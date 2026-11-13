import sys
from pydantic import ValidationError
from app.models.schemas import ExpenseCreate, ExpenseUpdate, ExpenseResponse
from app.api.routes_expenses import (
    list_expenses,
    get_expense,
    add_expense,
    modify_expense,
    remove_expense,
)
from app.api.routes_health import health_check
from app.api.routes_insights import get_overview, get_category_breakdown, get_trends, get_daily
from app.api.routes_budgets import list_budgets
from app.api.routes_savings import list_savings_goals
from app.api.routes_ai import get_ai_insights

def run_tests():
    print("==================================================")
    print("STEP 1: Testing GET /api/v1/expenses & Response Validation")
    print("==================================================")
    raw_expenses = list_expenses()
    print(f"Retrieved {len(raw_expenses)} expenses.")
    assert len(raw_expenses) > 0, "No expenses returned!"

    validated_expenses = []
    for item in raw_expenses:
        validated = ExpenseResponse.model_validate(item)
        assert validated.amount > 0, f"Expense #{validated.id} has invalid amount: {validated.amount}"
        validated_expenses.append(validated)
        print(f" - #{validated.id}: {validated.title} | ${validated.amount:.2f} ({validated.category})")

    print(f"\n>>> VERIFIED: All {len(validated_expenses)} expenses pass ExpenseResponse validation (amount > 0)!\n")

    print("==================================================")
    print("STEP 2: Testing Validation for Amount > 0 (Preserved)")
    print("==================================================")
    # Amount = 0.0 must raise ValidationError
    zero_rejected = False
    try:
        ExpenseCreate(
            title="Invalid Zero Expense",
            amount=0.0,
            category="General",
            date="2026-11-13",
        )
    except ValidationError as ve:
        zero_rejected = True
        print(f" - Correctly rejected amount=0.0: {ve.errors()[0]['msg']}")
    assert zero_rejected, "ExpenseCreate failed to reject amount = 0.0!"

    # Negative amount must raise ValidationError
    neg_rejected = False
    try:
        ExpenseCreate(
            title="Invalid Negative Expense",
            amount=-25.0,
            category="General",
            date="2026-11-13",
        )
    except ValidationError as ve:
        neg_rejected = True
        print(f" - Correctly rejected amount=-25.0: {ve.errors()[0]['msg']}")
    assert neg_rejected, "ExpenseCreate failed to reject negative amount!"

    print(">>> VERIFIED: ExpenseCreate strictly preserves amount > 0 validation!\n")

    print("==================================================")
    print("STEP 3: Testing Adding, Listing, Editing & Deleting")
    print("==================================================")
    # Add
    new_expense_payload = ExpenseCreate(
        title="Campus Physics Lab Manual",
        amount=32.50,
        category="Books & Academics",
        date="2026-11-13",
        payment_method="Student Debit Card",
        notes="Spring semester lab guide",
        is_recurring=False,
    )
    created = add_expense(new_expense_payload)
    new_id = created["id"]
    print(f"Created Expense #{new_id}: {created['title']} (${created['amount']})")

    # List & verify
    current_list = list_expenses()
    assert any(e["id"] == new_id for e in current_list), f"Expense #{new_id} not found in list!"
    print(f"Verified Expense #{new_id} is present in expense list.")

    # Edit
    edit_payload = ExpenseUpdate(
        title="Campus Physics Lab Manual (With Online Homework Access)",
        amount=39.00,
        notes="Added digital homework license",
    )
    updated = modify_expense(new_id, edit_payload)
    assert updated["amount"] == 39.00
    assert "Online Homework" in updated["title"]
    print(f"Edited Expense #{new_id}: New title '{updated['title']}', Amount: ${updated['amount']}")

    # Delete
    del_res = remove_expense(new_id)
    print(f"Deleted Expense #{new_id}: {del_res['message']}")

    # Verify no longer present
    after_del_list = list_expenses()
    assert not any(e["id"] == new_id for e in after_del_list), f"Expense #{new_id} still exists after delete!"
    print(f"Verified Expense #{new_id} successfully deleted from database.\n")

    print("==================================================")
    print("STEP 4: Testing Dashboard & All Other Endpoints")
    print("==================================================")
    h = health_check()
    print(f" - /api/v1/health -> {h['status']} (App: {h['app']})")
    assert h["status"] == "healthy"

    ov = get_overview()
    print(f" - /api/v1/insights/overview -> Spent: ${ov.total_spent}, Budget: ${ov.monthly_budget}, Score: {ov.student_financial_health_score}/100")
    assert ov.total_spent > 0
    assert ov.student_financial_health_score > 0

    cats = get_category_breakdown()
    print(f" - /api/v1/insights/category-breakdown -> {len(cats)} categories analyzed")

    tr = get_trends()
    print(f" - /api/v1/insights/monthly-trends -> {len(tr)} month intervals")

    daily = get_daily()
    print(f" - /api/v1/insights/daily-spending -> {len(daily)} daily entries")

    b = list_budgets()
    print(f" - /api/v1/budgets -> {len(b)} active budgets")

    goals = list_savings_goals()
    print(f" - /api/v1/savings-goals -> {len(goals)} savings goals")

    ai = get_ai_insights()
    print(f" - /api/v1/ai/insights -> {len(ai)} recommendations generated")

    print("\n==================================================")
    print(">>> ALL VERIFICATION SUITE TESTS PASSED (100%)! <<<")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
