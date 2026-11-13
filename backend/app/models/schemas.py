from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


# --- Expense Schemas ---

class ExpenseBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=150, example="Campus Bookstore - Economics 101")
    amount: float = Field(..., gt=0, example=65.50)  # Always persisted in base USD for uniform calculations
    category: str = Field(..., min_length=1, max_length=50, example="Books & Academics")
    date: str = Field(..., example="2026-11-12")
    payment_method: str = Field(default="UPI / Card", example="UPI / Card")
    notes: Optional[str] = Field(default="", example="Used student discount coupon")
    is_recurring: bool = Field(default=False)
    original_amount: Optional[float] = Field(default=None, example=65.50)
    original_currency: Optional[str] = Field(default="USD", example="USD")


class ExpenseCreate(ExpenseBase):
    pass


class ExpenseUpdate(BaseModel):
    title: Optional[str] = None
    amount: Optional[float] = Field(default=None, gt=0)
    category: Optional[str] = None
    date: Optional[str] = None
    payment_method: Optional[str] = None
    notes: Optional[str] = None
    is_recurring: Optional[bool] = None
    original_amount: Optional[float] = Field(default=None, gt=0)
    original_currency: Optional[str] = None


class ExpenseResponse(ExpenseBase):
    id: int
    created_at: Optional[str] = None

    class Config:
        from_attributes = True


# --- CSV Import Schemas ---

class CSVRowPreview(BaseModel):
    row_number: int
    title: str
    amount: float  # Base USD amount
    category: str
    date: str
    payment_method: str = "CSV Import"
    notes: str = ""
    original_amount: Optional[float] = None
    original_currency: Optional[str] = "USD"
    is_valid: bool = True
    error: Optional[str] = None


class CSVPreviewResponse(BaseModel):
    total_rows: int
    valid_count: int
    invalid_count: int
    currency: str = "USD"
    preview_rows: List[CSVRowPreview]
    invalid_rows: List[CSVRowPreview]


class CSVImportConfirmRequest(BaseModel):
    expenses: List[ExpenseCreate]


class CSVImportResponse(BaseModel):
    imported_count: int
    message: str


# --- Budget Schemas ---

class BudgetBase(BaseModel):
    category: str = Field(..., min_length=1, max_length=50, example="Dining & Groceries")
    monthly_limit: float = Field(..., gt=0, example=250.0)


class BudgetCreate(BudgetBase):
    pass


class BudgetResponse(BudgetBase):
    id: int
    spent: float = 0.0
    remaining: float = 0.0
    utilization_percentage: float = 0.0
    status: str = "normal"  # 'normal' | 'warning' (>=80%) | 'exceeded' (>100%)

    class Config:
        from_attributes = True


# --- Savings Goal Schemas ---

class SavingsGoalBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, example="Laptop Replacement Fund")
    target_amount: float = Field(..., gt=0, example=750.0)
    current_amount: float = Field(default=0.0, ge=0, example=250.0)
    target_date: Optional[str] = Field(default=None, example="2027-01-15")


class SavingsGoalCreate(SavingsGoalBase):
    pass


class SavingsGoalDeposit(BaseModel):
    amount: float = Field(..., gt=0, example=50.0)


class SavingsGoalResponse(SavingsGoalBase):
    id: int
    progress_percentage: float = 0.0
    remaining_amount: float = 0.0
    is_completed: bool = False
    created_at: Optional[str] = None

    class Config:
        from_attributes = True


# --- Analytics & Insights Schemas ---

class CategoryBreakdownItem(BaseModel):
    category: str
    spent: float
    limit: float
    percentage_of_total: float
    transaction_count: int
    status: str


class MonthlyTrendItem(BaseModel):
    month: str
    month_name: str
    spent: float
    budget: float
    savings: float


class DailySpendingItem(BaseModel):
    date: str
    amount: float


class FinancialOverview(BaseModel):
    total_spent: float
    monthly_budget: float
    remaining_budget: float
    total_expenses_count: int
    top_category: str
    student_financial_health_score: int
    monthly_savings: float
    category_breakdown: List[CategoryBreakdownItem]


# --- AI Intelligence Schemas ---

class AIInsightItem(BaseModel):
    id: str
    title: str
    summary: str
    action_item: str
    category: str  # 'tip' | 'warning' | 'achievement' | 'budget'
    impact_amount: Optional[float] = None
    priority: str = "medium"  # 'high' | 'medium' | 'low'
    calculation_basis: Optional[str] = None
    is_potential_saving: bool = False
