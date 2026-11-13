import os
import sys
import unittest
import tempfile
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

# Isolated test DB
temp_dir = tempfile.TemporaryDirectory()
test_db_path = Path(temp_dir.name) / "spendwise_api_test.db"
os.environ["DATABASE_PATH"] = str(test_db_path)

from app.core.config import get_settings
get_settings.cache_clear()

from app.core.database import init_db
from app.services.expense_service import seed_sample_data_if_empty
from app.api.routes_health import health_check
from app.api.routes_currencies import get_supported_currencies, get_exchange_rates
from app.api.routes_expenses import (
    list_expenses,
    get_expense,
    add_expense,
    modify_expense,
    remove_expense,
    preview_csv,
    confirm_csv_import,
)
from app.api.routes_budgets import list_budgets, set_budget, remove_budget
from app.api.routes_savings import (
    list_savings_goals,
    add_savings_goal,
    deposit_funds,
    remove_savings_goal,
)
from app.api.routes_insights import get_overview, get_trends, get_daily
from app.api.routes_ai import get_ai_insights
from app.models.schemas import (
    ExpenseCreate,
    ExpenseUpdate,
    BudgetCreate,
    SavingsGoalCreate,
    SavingsGoalDeposit,
    CSVImportConfirmRequest,
)


class SpendWiseAPIEndpointsTestSuite(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_db()
        seed_sample_data_if_empty()

    @classmethod
    def tearDownClass(cls):
        temp_dir.cleanup()

    # 1. Health
    def test_endpoint_health(self):
        res = health_check()
        self.assertEqual(res["status"], "healthy")
        self.assertIn("SpendWise", res["app"])

    # 2. Currencies
    def test_endpoint_currencies(self):
        res = get_supported_currencies()
        self.assertEqual(res["base_currency"], "USD")
        self.assertEqual(len(res["currencies"]), 9)

        rates = get_exchange_rates()
        self.assertEqual(rates["base"], "USD")
        self.assertIn("INR", rates["rates"])

    # 3. Expenses API
    def test_endpoint_expenses_crud(self):
        # List
        expenses = list_expenses()
        self.assertGreater(len(expenses), 0)

        # Add
        new_exp = add_expense(
            ExpenseCreate(
                title="Dorm Room Rug",
                amount=24.99,
                original_amount=24.99,
                original_currency="USD",
                category="Housing & Utilities",
                date="2026-11-12",
                payment_method="UPI / Card",
            )
        )
        self.assertIsNotNone(new_exp["id"])
        self.assertEqual(new_exp["title"], "Dorm Room Rug")

        # Get
        fetched = get_expense(new_exp["id"])
        self.assertEqual(fetched["id"], new_exp["id"])

        # Modify
        modified = modify_expense(new_exp["id"], ExpenseUpdate(title="Dorm Room Wool Rug", amount=29.99))
        self.assertEqual(modified["title"], "Dorm Room Wool Rug")
        self.assertEqual(modified["amount"], 29.99)

        # Delete
        del_res = remove_expense(new_exp["id"])
        self.assertEqual(del_res["id"], new_exp["id"])

    # 4. CSV Preview & Import Endpoints
    def test_endpoint_csv_preview_and_import(self):
        from app.services.expense_service import parse_and_preview_csv
        csv_bytes = b"Title,Amount,Category,Date,Payment Method,Notes\nTest Book,30.00,Books & Academics,2026-11-10,Card,Midterm\n"
        preview_res = parse_and_preview_csv(csv_bytes, currency="USD")
        self.assertEqual(preview_res.valid_count, 1)
        self.assertEqual(preview_res.invalid_count, 0)

        # Confirm import endpoint
        confirm_req = CSVImportConfirmRequest(
            expenses=[
                ExpenseCreate(
                    title=row.title,
                    amount=row.amount,
                    original_amount=row.original_amount,
                    original_currency=row.original_currency,
                    category=row.category,
                    date=row.date,
                    payment_method=row.payment_method,
                    notes=row.notes,
                )
                for row in preview_res.preview_rows
            ]
        )
        import_res = confirm_csv_import(confirm_req)
        self.assertEqual(import_res.imported_count, 1)
        self.assertEqual(import_res.imported_count, 1)

    # 5. Budgets Endpoints
    def test_endpoint_budgets(self):
        budgets = list_budgets()
        self.assertGreater(len(budgets), 0)

        # Create/Update
        saved = set_budget(BudgetCreate(category="Transit & Commute", monthly_limit=65.0))
        self.assertEqual(saved.category, "Transit & Commute")
        self.assertEqual(saved.monthly_limit, 65.0)

        # Delete
        del_res = remove_budget(saved.id)
        self.assertEqual(del_res["id"], saved.id)

    # 6. Savings Goals Endpoints
    def test_endpoint_savings(self):
        goals = list_savings_goals()
        self.assertGreater(len(goals), 0)

        # Add
        new_g = add_savings_goal(SavingsGoalCreate(name="Summer Internship Trip", target_amount=800.0, current_amount=200.0))
        self.assertEqual(new_g.name, "Summer Internship Trip")
        self.assertEqual(new_g.progress_percentage, 25.0)

        # Deposit
        deposited = deposit_funds(new_g.id, SavingsGoalDeposit(amount=100.0))
        self.assertEqual(deposited.current_amount, 300.0)
        self.assertEqual(deposited.progress_percentage, 37.5)

        # Delete
        del_res = remove_savings_goal(new_g.id)
        self.assertEqual(del_res["id"], new_g.id)

    # 7. Insights & Analytics Endpoints
    def test_endpoint_analytics(self):
        ov = get_overview()
        self.assertGreater(ov.total_spent, 0)
        self.assertGreaterEqual(ov.student_financial_health_score, 0)

        tr = get_trends()
        self.assertGreater(len(tr), 0)

        daily = get_daily()
        self.assertGreater(len(daily), 0)

    # 8. AI Advisor Endpoint
    def test_endpoint_ai_insights(self):
        # Default USD
        insights_usd = get_ai_insights(currency="USD")
        self.assertGreater(len(insights_usd), 0)

        # INR
        insights_inr = get_ai_insights(currency="INR")
        self.assertGreater(len(insights_inr), 0)

        # JPY
        insights_jpy = get_ai_insights(currency="JPY")
        self.assertGreater(len(insights_jpy), 0)


if __name__ == "__main__":
    unittest.main()
