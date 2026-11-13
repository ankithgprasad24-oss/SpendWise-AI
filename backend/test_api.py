import io
from app.core.database import init_db
from app.services.expense_service import (
    seed_sample_data_if_empty,
    get_all_expenses,
    calculate_financial_overview,
    create_expense,
    update_expense,
    delete_expense,
    parse_and_preview_csv,
    bulk_import_expenses,
    get_all_budgets,
    upsert_budget,
    get_all_savings_goals,
    create_savings_goal,
    deposit_to_savings_goal,
    get_monthly_trends,
    get_daily_spending,
)
from app.services.ai_service import get_ai_service
from app.models.schemas import ExpenseCreate, ExpenseUpdate, BudgetCreate, SavingsGoalCreate

def run():
    print("--- [1] DATABASE & SEEDING ---")
    init_db()
    seed_sample_data_if_empty()
    expenses = get_all_expenses()
    print(f"Loaded {len(expenses)} synthetic transactions.")

    print("\n--- [2] EXPENSE CRUD OPERATIONS ---")
    # Create
    new_exp = create_expense(
        ExpenseCreate(
            title="Campus Printing Lab",
            amount=4.50,
            category="Books & Academics",
            date="2026-11-12",
            payment_method="Campus Card",
            notes="Syllabus printouts",
            is_recurring=False
        )
    )
    print(f"Created Expense #{new_exp['id']}: {new_exp['title']} - ${new_exp['amount']}")

    # Update
    updated = update_expense(new_exp["id"], ExpenseUpdate(amount=5.00, notes="Updated with color prints"))
    assert updated is not None
    print(f"Updated Expense #{updated['id']}: Amount changed to ${updated['amount']}")

    # Delete
    del_ok = delete_expense(new_exp["id"])
    assert del_ok is True
    print(f"Deleted Expense #{new_exp['id']} successfully.")

    print("\n--- [3] CSV PREVIEW & BULK IMPORT (PANDAS) ---")
    sample_csv = b"""Title,Amount,Category,Date,Payment Method,Notes
Campus Chemistry Lab Kit,45.00,Books & Academics,2026-11-10,Debit Card,Safety goggles and lab manual
Campus Pizza Slice,4.25,Dining & Groceries,2026-11-11,Cash,Study snack
Invalid Item,-10.00,Unknown,InvalidDate,Cash,Should fail
"""
    preview = parse_and_preview_csv(sample_csv)
    print(f"CSV Total Rows: {preview.total_rows}, Valid: {preview.valid_count}, Invalid: {preview.invalid_count}")
    assert preview.valid_count == 2
    assert preview.invalid_count == 1
    print(f"Sample Invalid Reason: {preview.invalid_rows[0].error}")

    # Bulk Import
    import_list = [
        ExpenseCreate(
            title=row.title,
            amount=row.amount,
            category=row.category,
            date=row.date,
            payment_method=row.payment_method,
            notes=row.notes,
            is_recurring=False
        )
        for row in preview.preview_rows
    ]
    imported_count = bulk_import_expenses(import_list)
    print(f"Successfully bulk imported {imported_count} verified rows.")

    print("\n--- [4] BUDGET MANAGEMENT ---")
    budgets = get_all_budgets()
    print(f"Retrieved {len(budgets)} category budgets:")
    for b in budgets[:3]:
        print(f"  * {b.category}: Spent ${b.spent:.2f} / ${b.monthly_limit:.2f} ({b.utilization_percentage}% - {b.status})")

    # Upsert
    new_b = upsert_budget(BudgetCreate(category="Tech & Gadgets", monthly_limit=75.0))
    print(f"Upserted Budget: {new_b.category} with limit ${new_b.monthly_limit:.2f}")

    print("\n--- [5] SAVINGS GOALS ---")
    goals = get_all_savings_goals()
    print(f"Retrieved {len(goals)} savings goals:")
    for g in goals:
        print(f"  * {g.name}: ${g.current_amount:.2f} / ${g.target_amount:.2f} ({g.progress_percentage}%)")

    # Create & Deposit
    goal = create_savings_goal(SavingsGoalCreate(name="Spring Break Roadtrip", target_amount=400.0, current_amount=50.0))
    print(f"Created goal #{goal.id}: {goal.name} (${goal.current_amount} of ${goal.target_amount})")
    deposited = deposit_to_savings_goal(goal.id, 25.0)
    assert deposited is not None
    print(f"Deposited $25: New total ${deposited.current_amount} ({deposited.progress_percentage}%)")

    print("\n--- [6] PANDAS ANALYTICS & TRENDS ---")
    overview = calculate_financial_overview()
    print(f"Financial Overview: Spent: ${overview.total_spent:.2f}, Budget: ${overview.monthly_budget:.2f}, Score: {overview.student_financial_health_score}/100")
    trends = get_monthly_trends()
    print(f"Monthly Trends ({len(trends)} periods): {[t.month_name for t in trends]}")
    daily = get_daily_spending()
    print(f"Daily Spending points: {len(daily)}")

    print("\n--- [7] AI STUDENT INTELLIGENCE ENGINE ---")
    svc = get_ai_service()
    insights = svc.get_insights(overview.model_dump(), get_all_expenses(), currency="USD")
    print(f"Generated {len(insights)} dynamic student insights (USD):")
    actionable_savings_total = 0.0
    for ins in insights:
        print(f"  * [{ins.priority.upper()}] {ins.title} ({ins.category})")
        print(f"    Action: {ins.action_item}")
        if ins.calculation_basis:
            print(f"    Calculation Basis: {ins.calculation_basis}")
        if ins.is_potential_saving and ins.impact_amount:
            actionable_savings_total += ins.impact_amount
            print(f"    Actionable Potential Saving: +${ins.impact_amount:.2f}/mo")
        elif ins.impact_amount:
            print(f"    Accumulated Milestone Balance (Not new saving): ${ins.impact_amount:.2f}")

    print(f"\nTotal Actionable Monthly Savings Identified: ${actionable_savings_total:.2f}/mo")
    # Verify it does NOT include the $880 emergency fund balance
    assert actionable_savings_total < 500.0, f"Actionable savings should exclude emergency fund reserves, got {actionable_savings_total}"
    assert all(ins.impact_amount != 880.0 for ins in insights if ins.is_potential_saving), "Milestone balance must not be marked as potential saving"
    print("AI Advisor accurately separates potential savings from existing emergency reserves!")

    # Test INR Currency Localization
    inr_insights = svc.get_insights(overview.model_dump(), get_all_expenses(), currency="INR")
    print(f"\nVerifying INR Localized Insights ({len(inr_insights)} items):")
    coffee_inr = next((i for i in inr_insights if i.id == "ins-coffee-leak"), None)
    if coffee_inr:
        print(f"  * Coffee Insight in INR: {coffee_inr.summary}")
        assert "₹" in coffee_inr.summary, "INR currency symbol ₹ should be present in coffee insight summary"
    print("INR AI insights formatting successfully verified!")

    # Test EUR Currency Localization
    eur_insights = svc.get_insights(overview.model_dump(), get_all_expenses(), currency="EUR")
    print(f"\nVerifying EUR Localized Insights ({len(eur_insights)} items):")
    coffee_eur = next((i for i in eur_insights if i.id == "ins-coffee-leak"), None)
    if coffee_eur:
        print(f"  * Coffee Insight in EUR: {coffee_eur.summary}")
        assert "€" in coffee_eur.summary, "EUR currency symbol € should be present in coffee insight summary"
    print("EUR AI insights formatting successfully verified!")

    print("\n--- [8] MULTI-CURRENCY EXCHANGE RATE SERVICE ---")
    from app.api.routes_currencies import SUPPORTED_CURRENCIES, get_exchange_rates, get_supported_currencies

    curr_res = get_supported_currencies()
    curr_list = curr_res["currencies"]
    print(f"Supported Currencies ({len(curr_list)}): {[c['code'] for c in curr_list]}")
    assert len(curr_list) == 9

    rates_resp = get_exchange_rates()
    print(f"Exchange Rates (Base: {rates_resp['base']}, Source: {rates_resp['source']}):")
    for code, rate in list(rates_resp['rates'].items())[:5]:
        print(f"  * 1 USD = {rate} {code}")
    assert "INR" in rates_resp['rates']
    assert rates_resp['rates']["USD"] == 1.0

    print("\n--- [9] MULTI-CURRENCY EXPENSES & CSV IMPORT PERSISTENCE ---")
    # 1. Multi-currency expense creation (e.g. 845 INR ~ $10 USD)
    inr_rate = rates_resp['rates'].get("INR", 84.50)
    entered_inr = 845.0
    base_usd = round(entered_inr / inr_rate, 2)
    created_inr_exp = create_expense(
        ExpenseCreate(
            title="Campus Canteen Thali Meal",
            amount=base_usd,
            original_amount=entered_inr,
            original_currency="INR",
            category="Dining & Groceries",
            date="2026-11-13",
            payment_method="UPI / Card",
            notes="Lunch with study partners",
        )
    )
    print(f"Created Multi-Currency Expense #{created_inr_exp['id']}:")
    print(f"  * Base Amount (USD): ${created_inr_exp['amount']}")
    print(f"  * Original Amount: {created_inr_exp['original_currency']} {created_inr_exp['original_amount']}")
    assert created_inr_exp["original_currency"] == "INR"
    assert created_inr_exp["original_amount"] == 845.0
    assert created_inr_exp["amount"] == base_usd

    # 2. Multi-currency CSV preview with INR statement
    inr_csv = b"""Title,Amount,Category,Date,Payment Method,Notes
Campus Stationery Notebooks,422.50,Books & Academics,2026-11-13,UPI / Card,Graph notebooks
Campus Masala Chai,169.00,Coffee & Snacks,2026-11-13,Cash,Evening tea
"""
    inr_preview = parse_and_preview_csv(inr_csv, currency="INR")
    print(f"INR CSV Preview: {inr_preview.valid_count} valid rows, Currency: {inr_preview.currency}")
    assert inr_preview.currency == "INR"
    assert inr_preview.valid_count == 2
    row0 = inr_preview.preview_rows[0]
    print(f"  * Row 1: {row0.title} | Statement: {row0.original_currency} {row0.original_amount} | Converted Base: ${row0.amount} USD")
    assert row0.original_currency == "INR"
    assert row0.original_amount == 422.50
    expected_row0_base = round(422.50 / inr_rate, 2)
    assert abs(row0.amount - expected_row0_base) < 0.05

    # 3. Bulk import of INR CSV rows
    inr_import_list = [
        ExpenseCreate(
            title=r.title,
            amount=r.amount,
            original_amount=r.original_amount,
            original_currency=r.original_currency,
            category=r.category,
            date=r.date,
            payment_method=r.payment_method,
            notes=r.notes,
            is_recurring=False,
        )
        for r in inr_preview.preview_rows
    ]
    imported_inr_count = bulk_import_expenses(inr_import_list)
    assert imported_inr_count == 2
    print(f"Bulk imported {imported_inr_count} multi-currency rows with preserved original amounts and currencies.")

    # 4. Verify retrieval from DB preserves original_amount and original_currency
    all_exp = get_all_expenses()
    imported_stationery = next((e for e in all_exp if e["title"] == "Campus Stationery Notebooks"), None)
    assert imported_stationery is not None
    assert imported_stationery["original_currency"] == "INR"
    assert imported_stationery["original_amount"] == 422.50
    print(f"Verified DB Persistence for '{imported_stationery['title']}': {imported_stationery['original_currency']} {imported_stationery['original_amount']} (USD: ${imported_stationery['amount']})")

    # Clean up test records
    delete_expense(created_inr_exp["id"])
    delete_expense(imported_stationery["id"])
    chai_exp = next((e for e in all_exp if e["title"] == "Campus Masala Chai"), None)
    if chai_exp:
        delete_expense(chai_exp["id"])
    print("Multi-currency test records cleaned up.")

    print("\n==============================================")
    print(">>> ALL BACKEND CORE ENDPOINTS & ENGINES VERIFIED! <<<")
    print("==============================================")

if __name__ == "__main__":
    run()
