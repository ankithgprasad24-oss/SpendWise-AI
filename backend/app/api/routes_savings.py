from typing import List
from fastapi import APIRouter, HTTPException, status
from app.models.schemas import SavingsGoalCreate, SavingsGoalResponse, SavingsGoalDeposit
from app.services.expense_service import (
    get_all_savings_goals,
    create_savings_goal,
    deposit_to_savings_goal,
    delete_savings_goal,
)

router = APIRouter(prefix="/savings-goals", tags=["Savings Goals"])


@router.get("", response_model=List[SavingsGoalResponse])
def list_savings_goals():
    """List all student savings goals and milestone targets."""
    return get_all_savings_goals()


@router.post("", response_model=SavingsGoalResponse, status_code=status.HTTP_201_CREATED)
def add_savings_goal(goal: SavingsGoalCreate):
    """Create a new savings goal target."""
    try:
        return create_savings_goal(goal)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create savings goal: {str(e)}",
        )


@router.post("/{goal_id}/deposit", response_model=SavingsGoalResponse)
def deposit_funds(goal_id: int, deposit: SavingsGoalDeposit):
    """Deposit money toward a specific savings goal."""
    updated = deposit_to_savings_goal(goal_id, deposit.amount)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Savings goal with ID {goal_id} not found",
        )
    return updated


@router.delete("/{goal_id}", status_code=status.HTTP_200_OK)
def remove_savings_goal(goal_id: int):
    """Delete a savings goal."""
    success = delete_savings_goal(goal_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Savings goal with ID {goal_id} not found",
        )
    return {"message": f"Savings goal #{goal_id} successfully deleted", "id": goal_id}
