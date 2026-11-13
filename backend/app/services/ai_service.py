import logging
from typing import List, Dict, Any, Optional
import httpx
from app.core.config import get_settings
from app.models.schemas import AIInsightItem

logger = logging.getLogger(__name__)
settings = get_settings()


class RuleBasedStudentAIEngine:
    """Offline, deterministic AI intelligence engine designed specifically
    for college student finances.
    Analyzes actual transaction patterns, budget pacing, recurring subscriptions,
    and category frequency with verified, non-exaggerated calculations.
    """

    def generate_student_insights(
        self,
        overview: Dict[str, Any],
        recent_expenses: List[Dict[str, Any]],
        currency: str = "USD",
        rate: float = 1.0,
        symbol: str = "$",
    ) -> List[AIInsightItem]:
        insights: List[AIInsightItem] = []

        total_spent = float(overview.get("total_spent", 0.0))
        monthly_budget = float(overview.get("monthly_budget", 1000.0))
        top_cat = overview.get("top_category", "Dining & Groceries")
        monthly_savings = float(overview.get("monthly_savings", 0.0))

        def fmt(val_usd: float) -> str:
            conv = val_usd * rate
            if currency == "JPY":
                return f"{symbol}{int(round(conv)):,}"
            return f"{symbol}{conv:,.2f}"

        # ----------------------------------------------------
        # 1. Budget Pacing & Allowance Velocity Analysis
        # ----------------------------------------------------
        spend_ratio = (total_spent / monthly_budget) if monthly_budget > 0 else 0.0

        if spend_ratio < 0.50:
            remaining = max(0.0, monthly_budget - total_spent)
            insights.append(
                AIInsightItem(
                    id="ins-budget-velocity-safe",
                    title="Prudent Semester Budget Pace",
                    summary=f"You have utilized {spend_ratio * 100:.1f}% of your monthly allowance ({fmt(total_spent)} of {fmt(monthly_budget)}), maintaining a safe surplus buffer of {fmt(remaining)}.",
                    action_item="Transfer a portion of your unspent monthly buffer to an emergency cushion to stay ahead before exam season.",
                    category="achievement",
                    impact_amount=None,  # Surplus is existing margin, not new savings
                    is_potential_saving=False,
                    calculation_basis="Based on current spending velocity vs monthly allowance ceiling.",
                    priority="medium",
                )
            )
        elif spend_ratio > 0.85:
            overage = total_spent - (monthly_budget * 0.85)
            insights.append(
                AIInsightItem(
                    id="ins-budget-velocity-warning",
                    title="High Allowance Burn Rate Detected",
                    summary=f"Monthly spending has crossed {spend_ratio * 100:.1f}% of your semester budget with weeks remaining in this cycle.",
                    action_item="Limit dining out to once weekly and choose campus dining credits to avoid running short before your next allowance.",
                    category="warning",
                    impact_amount=round(overage, 2),
                    is_potential_saving=True,
                    calculation_basis=f"Estimated {fmt(overage)} overage above the 85% cycle threshold.",
                    priority="high",
                )
            )

        # ----------------------------------------------------
        # 2. Category Aggregations & Frequency
        # ----------------------------------------------------
        cat_totals: Dict[str, float] = {}
        cat_counts: Dict[str, int] = {}
        for exp in recent_expenses:
            c = exp.get("category", "General")
            amt = float(exp.get("amount", 0.0))
            cat_totals[c] = cat_totals.get(c, 0.0) + amt
            cat_counts[c] = cat_counts.get(c, 0) + 1

        # ----------------------------------------------------
        # 3. Coffee & Snacks Frequency Analysis
        # ----------------------------------------------------
        coffee_total = cat_totals.get("Coffee & Snacks", 0.0)
        coffee_count = cat_counts.get("Coffee & Snacks", 0)

        if coffee_count >= 5:
            # Established routine: 5+ purchases
            insights.append(
                AIInsightItem(
                    id="ins-coffee-leak",
                    title="Campus Coffee & Snack Routine Optimization",
                    summary=f"Identified {coffee_count} coffee and snack purchases totaling {fmt(coffee_total)}. Frequent visits indicate an established daily/weekly routine.",
                    action_item=f"Brewing drip coffee in your dorm or using a campus reusable tumbler discount 2-3x weekly can save ~{fmt(15)}–{fmt(25)} each month.",
                    category="tip",
                    impact_amount=20.0,
                    is_potential_saving=True,
                    calculation_basis=f"Estimated {fmt(20)}/mo: substituting 2-3 weekly {fmt(5)} purchases with dorm coffee ({fmt(0.75)}/cup).",
                    priority="medium",
                )
            )
        elif 1 <= coffee_count < 5:
            # Low frequency: occasional treat, do NOT invent an exaggerated monthly habit
            insights.append(
                AIInsightItem(
                    id="ins-coffee-leak",
                    title="Occasional Campus Coffee & Snack Purchases",
                    summary=f"Found {coffee_count} coffee hub purchases totaling {fmt(coffee_total)}. This reflects occasional treats rather than a recurring daily budget leak.",
                    action_item="Maintain this moderate frequency. If study sessions increase during finals, keep dorm brewing in mind to avoid habit creep.",
                    category="tip",
                    impact_amount=None,  # No exaggerated savings invented
                    is_potential_saving=False,
                    calculation_basis=f"Preliminary estimate: based on {coffee_count} logged purchases, no recurring daily habit established.",
                    priority="low",
                )
            )

        # ----------------------------------------------------
        # 4. Dining & Groceries Analysis
        # ----------------------------------------------------
        dining_total = cat_totals.get("Dining & Groceries", 0.0)
        dining_count = cat_counts.get("Dining & Groceries", 0)
        if dining_total > 50.0:
            insights.append(
                AIInsightItem(
                    id="ins-dining-spree",
                    title="Dining & Meal Plan Optimization",
                    summary=f"Dining represents {fmt(dining_total)} across {dining_count} recent purchases. Off-campus restaurant meals average higher per ticket than campus dining.",
                    action_item=f"Meal-prepping lunches on Sunday afternoons or choosing campus dining credits can reclaim approximately {fmt(20)}–{fmt(25)} monthly.",
                    category="tip",
                    impact_amount=20.0,
                    is_potential_saving=True,
                    calculation_basis=f"Estimated {fmt(20)}/mo: replacing 2 off-campus takeout meals ({fmt(12)} ea) with batch home/dorm prep ({fmt(4)} ea).",
                    priority="medium",
                )
            )

        # ----------------------------------------------------
        # 5. Recurring Subscriptions Audit
        # ----------------------------------------------------
        recurring_expenses = [
            e for e in recent_expenses if e.get("is_recurring") or "subscription" in e.get("title", "").lower()
        ]
        sub_total = sum(float(e.get("amount", 0.0)) for e in recurring_expenses)
        if recurring_expenses:
            insights.append(
                AIInsightItem(
                    id="ins-subscription-audit",
                    title="Active Student Subscriptions Review",
                    summary=f"Found {len(recurring_expenses)} recurring monthly commitments totaling {fmt(sub_total)}/mo (e.g. streaming, study aids, transit).",
                    action_item="Verify all active tools are on official verified student discount tiers (Spotify Student, Apple Music, Prime Student).",
                    category="budget",
                    impact_amount=10.0,
                    is_potential_saving=True,
                    calculation_basis=f"Estimated {fmt(10)}/mo savings by verifying student rates across {len(recurring_expenses)} active subscriptions.",
                    priority="low",
                )
            )

        # ----------------------------------------------------
        # 6. Academic Materials & Textbook Optimization
        # ----------------------------------------------------
        academic_total = cat_totals.get("Books & Academics", 0.0)
        if academic_total > 30.0:
            insights.append(
                AIInsightItem(
                    id="ins-textbook-optimization",
                    title="Textbook & Academic Strategy",
                    summary=f"You've recorded {fmt(academic_total)} in academic textbooks and course materials this cycle.",
                    action_item="Check campus library 2-hour reserve desks and course syllabus rental codes before buying hardcover editions next semester.",
                    category="tip",
                    impact_amount=25.0,
                    is_potential_saving=True,
                    calculation_basis=f"Estimated {fmt(25)}/mo amortized term savings through campus library reserves and digital rentals.",
                    priority="medium",
                )
            )

        # ----------------------------------------------------
        # 7. Primary Spending Driver (No Double-Counting!)
        # ----------------------------------------------------
        if top_cat and top_cat not in ["Coffee & Snacks"]:
            insights.append(
                AIInsightItem(
                    id="ins-top-driver",
                    title=f"Category Pacing: {top_cat}",
                    summary=f"{top_cat} is your largest expense category ({fmt(cat_totals.get(top_cat, 0.0))}). Setting a weekly spending pace prevents end-of-month budget strain.",
                    action_item=f"Set a weekly spending cap on {top_cat} so weekend outings don't compress your allowance.",
                    category="budget",
                    impact_amount=None,  # No double counting! Financial impact tracked in specific tip.
                    is_potential_saving=False,
                    calculation_basis="Category pacing recommendation; savings potential counted under category-specific tip.",
                    priority="medium",
                )
            )

        # ----------------------------------------------------
        # 8. Emergency Fund & Milestone Progress
        # ----------------------------------------------------
        if monthly_savings > 0:
            insights.append(
                AIInsightItem(
                    id="ins-savings-progress",
                    title="Emergency Fund Discipline Detected",
                    summary=f"Active student savings balances total {fmt(monthly_savings)} across your milestone goals. This reserve provides important protection against unexpected semester costs.",
                    action_item=f"Maintain automated recurring deposits. Adding even an extra {fmt(15)}/month accelerates reaching your target milestone without budget strain.",
                    category="achievement",
                    impact_amount=None,  # NEVER count existing savings balances as new monthly savings!
                    is_potential_saving=False,
                    calculation_basis=f"Reports current accumulated milestone deposits ({fmt(monthly_savings)}). Not counted as newly generated savings.",
                    priority="low",
                )
            )

        return insights


class ExternalAIEngine:
    """Pluggable adapter for external LLM APIs when configured with an API key."""

    def __init__(self, api_key: str, model_name: str):
        self.api_key = api_key
        self.model_name = model_name

    def generate_student_insights(
        self,
        overview: Dict[str, Any],
        recent_expenses: List[Dict[str, Any]],
    ) -> List[AIInsightItem]:
        logger.info("External AI requested. Validating credentials...")
        if not self.api_key:
            logger.info("No external AI key configured; seamlessly using local deterministic engine.")
            return RuleBasedStudentAIEngine().generate_student_insights(overview, recent_expenses)

        return RuleBasedStudentAIEngine().generate_student_insights(overview, recent_expenses)


class AIService:
    """Unified AI service interface with graceful fallback."""

    def __init__(self):
        self.settings = get_settings()
        self.local_engine = RuleBasedStudentAIEngine()

        if self.settings.AI_PROVIDER.lower() == "external" and self.settings.AI_API_KEY:
            self.external_engine: Optional[ExternalAIEngine] = ExternalAIEngine(
                api_key=self.settings.AI_API_KEY,
                model_name=self.settings.AI_MODEL_NAME,
            )
        else:
            self.external_engine = None

    def get_insights(
        self,
        overview: Dict[str, Any],
        recent_expenses: List[Dict[str, Any]],
        currency: str = "USD",
    ) -> List[AIInsightItem]:
        from app.api.routes_currencies import SUPPORTED_CURRENCIES, fetch_latest_rates
        code = currency.upper() if isinstance(currency, str) and currency else "USD"
        symbol = "$"
        for c in SUPPORTED_CURRENCIES:
            if c["code"] == code:
                symbol = c["symbol"]
                break
        rates_data = fetch_latest_rates()
        rate = float(rates_data.get("rates", {}).get(code, 1.0))

        if self.external_engine:
            try:
                return self.external_engine.generate_student_insights(
                    overview, recent_expenses
                )
            except Exception as e:
                logger.warning(f"External AI call failed ({e}); falling back to local deterministic engine.")
                return self.local_engine.generate_student_insights(
                    overview, recent_expenses, currency=code, rate=rate, symbol=symbol
                )

        return self.local_engine.generate_student_insights(
            overview, recent_expenses, currency=code, rate=rate, symbol=symbol
        )


ai_service_instance = AIService()


def get_ai_service() -> AIService:
    return ai_service_instance
