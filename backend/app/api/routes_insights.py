from typing import List
from fastapi import APIRouter
from app.models.schemas import (
    FinancialOverview,
    CategoryBreakdownItem,
    MonthlyTrendItem,
    DailySpendingItem,
)
from app.services.expense_service import (
    calculate_financial_overview,
    get_monthly_trends,
    get_daily_spending,
)

router = APIRouter(prefix="/insights", tags=["Insights & Analytics"])


@router.get("/overview", response_model=FinancialOverview)
def get_overview():
    """Retrieve financial overview and aggregated metrics computed with Pandas."""
    return calculate_financial_overview()


@router.get("/category-breakdown", response_model=List[CategoryBreakdownItem])
def get_category_breakdown():
    """Retrieve category-wise expense breakdown with limits and percentage shares."""
    overview = calculate_financial_overview()
    return overview.category_breakdown


@router.get("/monthly-trends", response_model=List[MonthlyTrendItem])
def get_trends():
    """Retrieve multi-month spending vs budget comparison trends for charts."""
    return get_monthly_trends()


@router.get("/daily-spending", response_model=List[DailySpendingItem])
def get_daily():
    """Retrieve daily expense totals for spending velocity charts."""
    return get_daily_spending()
