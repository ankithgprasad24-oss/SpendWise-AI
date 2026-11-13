from typing import List, Optional
from fastapi import APIRouter, Query
from app.models.schemas import AIInsightItem
from app.services.expense_service import calculate_financial_overview, get_all_expenses
from app.services.ai_service import get_ai_service

router = APIRouter(prefix="/ai", tags=["AI Intelligence"])


@router.get("/insights", response_model=List[AIInsightItem])
def get_ai_insights(currency: Optional[str] = Query(None, description="Preferred currency code (e.g. INR, EUR, USD)")):
    """Retrieve AI-powered student spending intelligence and advice localized in preferred currency."""
    overview = calculate_financial_overview().model_dump()
    recent_expenses = get_all_expenses()[:15]
    ai_service = get_ai_service()
    cur_code = currency if isinstance(currency, str) and currency else "USD"
    return ai_service.get_insights(overview, recent_expenses, currency=cur_code)
