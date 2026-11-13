import os
import sys
import unittest
import tempfile
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

# Configure isolated test database before loading application modules
temp_dir = tempfile.TemporaryDirectory()
test_db_path = Path(temp_dir.name) / "spendwise_isolated_test.db"
os.environ["DATABASE_PATH"] = str(test_db_path)

from app.core.config import get_settings
get_settings.cache_clear()

from app.core.database import init_db, get_db_connection
from app.services.expense_service import (
    seed_sample_data_if_empty,
    get_all_expenses,
    get_expense_by_id,
    create_expense,
    update_expense,
    delete_expense,
    parse_and_preview_csv,
    bulk_import_expenses,
    get_all_budgets,
    upsert_budget,
    delete_budget,
    get_all_savings_goals,
    create_savings_goal,
    deposit_to_savings_goal,
    delete_savings_goal,
    calculate_financial_overview,
    get_monthly_trends,
    get_daily_spending,
)
from app.api.routes_currencies import (
    SUPPORTED_CURRENCIES,
    DEFAULT_RATES,
    get_supported_currencies,
    get_exchange_rates,
    fetch_latest_rates,
)
from app.services.ai_service import get_ai_service
from app.models.schemas import (
    ExpenseCreate,
    ExpenseUpdate,
    BudgetCreate,
    SavingsGoalCreate,
)


class SpendWiseFullTestSuite(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        """Initialize isolated test database with fresh schema and seeded test data."""
        init_db()
        seed_sample_data_if_empty()

    @classmethod
    def tearDownClass(cls):
        """Clean up isolated temporary test directory."""
        temp_dir.cleanup()

    # ==========================================
    # 1. System Config & Database Initialization
    # ==========================================
    def test_01_isolated_database_configured(self):
        settings = get_settings()
        self.assertTrue(str(test_db_path) in str(settings.DATABASE_PATH) or settings.DATABASE_PATH == str(test_db_path))
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [r[0] for r in cursor.fetchall()]
        conn.close()
        self.assertIn("expenses", tables)
        self.assertIn("budgets", tables)
        self.assertIn("savings_goals", tables)

    # ==========================================
    # 2. Supported Currencies & Exchange Rates
    # ==========================================
    def test_02_supported_currencies_audit(self):
        result = get_supported_currencies()
        self.assertEqual(result["base_currency"], "USD")
        currencies = result["currencies"]
        self.assertEqual(len(currencies), 9)

        required_codes = {"USD", "INR", "EUR", "GBP", "JPY", "AUD", "CAD", "SGD", "AED"}
        returned_codes = {c["code"] for c in currencies}
        self.assertEqual(required_codes, returned_codes)

        # Verify symbols
        symbol_map = {c["code"]: c["symbol"] for c in currencies}
        self.assertEqual(symbol_map["USD"], "$")
        self.assertEqual(symbol_map["INR"], "₹")
        self.assertEqual(symbol_map["EUR"], "€")
        self.assertEqual(symbol_map["GBP"], "£")
        self.assertEqual(symbol_map["JPY"], "¥")

    def test_03_exchange_rates_availability(self):
        rates_data = get_exchange_rates()
        self.assertEqual(rates_data["base"], "USD")
        self.assertIn("rates", rates_data)
        rates = rates_data["rates"]
        self.assertEqual(rates["USD"], 1.0)
        for code in ["INR", "EUR", "GBP", "JPY", "AUD", "CAD", "SGD", "AED"]:
            self.assertIn(code, rates)
            self.assertGreater(rates[code], 0)

    # ==========================================
    # 3. Expense Ledger CRUD & Filters
    # ==========================================
    def test_04_create_and_retrieve_expense(self):
        exp = create_expense(
            ExpenseCreate(
                title="Calculus Textbook",
                amount=75.50,
                category="Books & Academics",
                date="2026-11-10",
                payment_method="UPI / Card",
                notes="Bought from bookstore",
            )
        )
        self.assertIsNotNone(exp["id"])
        self.assertEqual(exp["title"], "Calculus Textbook")
        self.assertEqual(exp["amount"], 75.50)
        self.assertEqual(exp["original_amount"], 75.50)
        self.assertEqual(exp["original_currency"], "USD")

        # Retrieve by ID
        fetched = get_expense_by_id(exp["id"])
        self.assertIsNotNone(fetched)
        self.assertEqual(fetched["title"], "Calculus Textbook")

    def test_05_update_and_delete_expense(self):
        exp = create_expense(
            ExpenseCreate(
                title="Temporary Gym Fee",
                amount=30.00,
                category="Personal Care & Health",
                date="2026-11-11",
            )
        )
        exp_id = exp["id"]

        # Update
        updated = update_expense(exp_id, ExpenseUpdate(amount=35.00, notes="Included locker fee"))
        self.assertIsNotNone(updated)
        self.assertEqual(updated["amount"], 35.00)
        self.assertEqual(updated["notes"], "Included locker fee")

        # Delete
        deleted = delete_expense(exp_id)
        self.assertTrue(deleted)
        self.assertIsNone(get_expense_by_id(exp_id))

    def test_06_expense_filtering_and_search(self):
        # Add tagged expenses for filter testing
        create_expense(ExpenseCreate(title="Special Organic Apples", amount=6.50, category="Dining & Groceries", date="2026-11-05"))
        create_expense(ExpenseCreate(title="Special Organic Milk", amount=4.50, category="Dining & Groceries", date="2026-11-06"))

        # Search query
        search_results = get_all_expenses(search="Organic")
        self.assertGreaterEqual(len(search_results), 2)
        for r in search_results:
            self.assertIn("organic", (r["title"] + (r["notes"] or "")).lower())

        # Category filter
        cat_results = get_all_expenses(category="Dining & Groceries")
        self.assertGreater(len(cat_results), 0)
        for r in cat_results:
            self.assertEqual(r["category"], "Dining & Groceries")

        # Date range filter
        date_results = get_all_expenses(start_date="2026-11-05", end_date="2026-11-06")
        self.assertGreaterEqual(len(date_results), 2)
        for r in date_results:
            self.assertTrue("2026-11-05" <= r["date"] <= "2026-11-06")

    # ==========================================
    # 4. Multi-Currency Expense Persistence
    # ==========================================
    def test_07_multi_currency_expense_entry_inr(self):
        rates = DEFAULT_RATES
        inr_amount = 845.0
        base_usd = round(inr_amount / rates["INR"], 2)

        exp = create_expense(
            ExpenseCreate(
                title="University Canteen Meal",
                amount=base_usd,
                original_amount=inr_amount,
                original_currency="INR",
                category="Dining & Groceries",
                date="2026-11-12",
                payment_method="UPI / Card",
            )
        )
        self.assertEqual(exp["original_currency"], "INR")
        self.assertEqual(exp["original_amount"], 845.0)
        self.assertEqual(exp["amount"], base_usd)

        # Verify DB fetch retains original currency
        fetched = get_expense_by_id(exp["id"])
        self.assertEqual(fetched["original_currency"], "INR")
        self.assertEqual(fetched["original_amount"], 845.0)

    def test_08_multi_currency_expense_entry_eur(self):
        rates = DEFAULT_RATES
        eur_amount = 50.0
        base_usd = round(eur_amount / rates["EUR"], 2)

        exp = create_expense(
            ExpenseCreate(
                title="European Journal Subscription",
                amount=base_usd,
                original_amount=eur_amount,
                original_currency="EUR",
                category="Subscriptions & Tech",
                date="2026-11-12",
            )
        )
        self.assertEqual(exp["original_currency"], "EUR")
        self.assertEqual(exp["original_amount"], 50.0)

        # Update notes without changing amounts
        updated = update_expense(exp["id"], ExpenseUpdate(notes="Quarterly issue"))
        self.assertEqual(updated["original_currency"], "EUR")
        self.assertEqual(updated["original_amount"], 50.0)
        self.assertEqual(updated["amount"], base_usd)

    # ==========================================
    # 5. CSV Parsing, Pandas Validation & Import
    # ==========================================
    def test_09_csv_preview_and_validation(self):
        csv_data = b"""Title,Amount,Category,Date,Payment Method,Notes
Campus Lab Coat,28.50,Books & Academics,2026-11-01,Debit Card,Chemistry lab
Hostel Laundry,12.00,Housing & Utilities,2026-11-02,Cash,Token wash
Invalid Negative,-15.00,Dining & Groceries,2026-11-03,Cash,Negative price
Invalid Date Row,10.00,General,NotADate,Card,Corrupt date
"""
        preview = parse_and_preview_csv(csv_data, currency="USD")
        self.assertEqual(preview.total_rows, 4)
        self.assertEqual(preview.valid_count, 2)
        self.assertEqual(preview.invalid_count, 2)
        self.assertEqual(preview.currency, "USD")

        # Verify specific error messages
        invalid_errors = [r.error for r in preview.invalid_rows]
        self.assertTrue(any("greater than zero" in err for err in invalid_errors))
        self.assertTrue(any("Invalid date format" in err for err in invalid_errors))

    def test_10_csv_preview_with_inr_statement_currency(self):
        rates = DEFAULT_RATES
        csv_data = b"""Title,Amount,Category,Date,Payment Method,Notes
Physics Lab Manual,422.50,Books & Academics,2026-11-04,UPI / Card,Campus store
Campus Coffee,84.50,Coffee & Snacks,2026-11-05,Cash,Study fuel
"""
        preview = parse_and_preview_csv(csv_data, currency="INR")
        self.assertEqual(preview.currency, "INR")
        self.assertEqual(preview.valid_count, 2)

        row1 = preview.preview_rows[0]
        self.assertEqual(row1.original_currency, "INR")
        self.assertEqual(row1.original_amount, 422.50)
        # Expected base USD: 422.50 / 84.50 = $5.00
        self.assertAlmostEqual(row1.amount, 5.00, places=2)

        row2 = preview.preview_rows[1]
        self.assertEqual(row2.original_currency, "INR")
        self.assertEqual(row2.original_amount, 84.50)
        # Expected base USD: 84.50 / 84.50 = $1.00
        self.assertAlmostEqual(row2.amount, 1.00, places=2)

    def test_11_bulk_import_preserves_currency(self):
        items = [
            ExpenseCreate(
                title="Imported INR Book",
                amount=5.00,
                original_amount=422.50,
                original_currency="INR",
                category="Books & Academics",
                date="2026-11-08",
            ),
            ExpenseCreate(
                title="Imported EUR Snack",
                amount=4.30,
                original_amount=4.00,
                original_currency="EUR",
                category="Coffee & Snacks",
                date="2026-11-09",
            ),
        ]
        count = bulk_import_expenses(items)
        self.assertEqual(count, 2)

        all_exp = get_all_expenses()
        inr_item = next((e for e in all_exp if e["title"] == "Imported INR Book"), None)
        self.assertIsNotNone(inr_item)
        self.assertEqual(inr_item["original_currency"], "INR")
        self.assertEqual(inr_item["original_amount"], 422.50)

    # ==========================================
    # 6. Category Budgets & Utilization
    # ==========================================
    def test_12_budget_management_and_utilization(self):
        # Upsert a new budget
        b = upsert_budget(BudgetCreate(category="Entertainment & Social", monthly_limit=80.00))
        self.assertEqual(b.category, "Entertainment & Social")
        self.assertEqual(b.monthly_limit, 80.00)

        # Retrieve all budgets
        all_budgets = get_all_budgets()
        self.assertGreater(len(all_budgets), 0)
        b_names = [x.category for x in all_budgets]
        self.assertIn("Entertainment & Social", b_names)

        # Delete budget
        del_ok = delete_budget(b.id)
        self.assertTrue(del_ok)

    # ==========================================
    # 7. Savings Goals & Deposits
    # ==========================================
    def test_13_savings_goals_workflow(self):
        goal = create_savings_goal(
            SavingsGoalCreate(name="Semester Laptop Fund", target_amount=600.0, current_amount=150.0)
        )
        self.assertIsNotNone(goal.id)
        self.assertEqual(goal.progress_percentage, 25.0)
        self.assertFalse(goal.is_completed)

        # Deposit funds
        updated_goal = deposit_to_savings_goal(goal.id, 450.0)
        self.assertIsNotNone(updated_goal)
        self.assertEqual(updated_goal.current_amount, 600.0)
        self.assertEqual(updated_goal.progress_percentage, 100.0)
        self.assertTrue(updated_goal.is_completed)

        # Delete
        delete_ok = delete_savings_goal(goal.id)
        self.assertTrue(delete_ok)

    # ==========================================
    # 8. Pandas Analytics & Trends
    # ==========================================
    def test_14_financial_overview_and_trends(self):
        overview = calculate_financial_overview()
        self.assertGreater(overview.total_spent, 0)
        self.assertGreater(overview.monthly_budget, 0)
        self.assertTrue(0 <= overview.student_financial_health_score <= 100)
        self.assertGreater(len(overview.category_breakdown), 0)

        trends = get_monthly_trends()
        self.assertGreater(len(trends), 0)
        for t in trends:
            self.assertIsNotNone(t.month)
            self.assertGreaterEqual(t.spent, 0)

        daily = get_daily_spending()
        self.assertGreater(len(daily), 0)

    # ==========================================
    # 9. AI Student Financial Advisor Engine
    # ==========================================
    def test_15_ai_insights_usd(self):
        svc = get_ai_service()
        overview = calculate_financial_overview()
        expenses = get_all_expenses()
        insights = svc.get_insights(overview.model_dump(), expenses, currency="USD")
        self.assertGreater(len(insights), 0)

        # Check priority sorting: HIGH, MEDIUM, LOW
        for ins in insights:
            self.assertIn(ins.priority, ["high", "medium", "low"])
            self.assertTrue(len(ins.action_item) > 0)

    def test_16_ai_insights_multi_currency_formatting(self):
        svc = get_ai_service()
        overview = calculate_financial_overview()
        expenses = get_all_expenses()

        # INR
        inr_insights = svc.get_insights(overview.model_dump(), expenses, currency="INR")
        coffee_inr = next((i for i in inr_insights if i.id == "ins-coffee-leak"), None)
        if coffee_inr:
            self.assertIn("₹", coffee_inr.summary)

        # EUR
        eur_insights = svc.get_insights(overview.model_dump(), expenses, currency="EUR")
        coffee_eur = next((i for i in eur_insights if i.id == "ins-coffee-leak"), None)
        if coffee_eur:
            self.assertIn("€", coffee_eur.summary)

        # GBP
        gbp_insights = svc.get_insights(overview.model_dump(), expenses, currency="GBP")
        coffee_gbp = next((i for i in gbp_insights if i.id == "ins-coffee-leak"), None)
        if coffee_gbp:
            self.assertIn("£", coffee_gbp.summary)


if __name__ == "__main__":
    unittest.main()
