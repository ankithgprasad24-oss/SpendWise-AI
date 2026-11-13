from typing import List
from fastapi import APIRouter, HTTPException, status
from app.models.schemas import BudgetCreate, BudgetResponse
from app.services.expense_service import get_all_budgets, upsert_budget, delete_budget

router = APIRouter(prefix="/budgets", tags=["Budgets"])


@router.get("", response_model=List[BudgetResponse])
def list_budgets():
    """List all category budgets with real-time utilization and status warnings."""
    return get_all_budgets()


@router.post("", response_model=BudgetResponse, status_code=status.HTTP_201_CREATED)
def set_budget(budget: BudgetCreate):
    """Set or update a category monthly spending limit."""
    try:
        return upsert_budget(budget)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to set budget: {str(e)}",
        )


@router.delete("/{budget_id}", status_code=status.HTTP_200_OK)
def remove_budget(budget_id: int):
    """Delete a category budget."""
    success = delete_budget(budget_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Budget with ID {budget_id} not found",
        )
    return {"message": f"Budget #{budget_id} successfully deleted", "id": budget_id}
