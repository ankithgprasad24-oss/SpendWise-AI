from typing import List, Optional
from fastapi import APIRouter, HTTPException, UploadFile, File, Query, status
from app.models.schemas import (
    ExpenseCreate,
    ExpenseUpdate,
    ExpenseResponse,
    CSVPreviewResponse,
    CSVImportConfirmRequest,
    CSVImportResponse,
)
from app.services.expense_service import (
    get_all_expenses,
    get_expense_by_id,
    create_expense,
    update_expense,
    delete_expense,
    parse_and_preview_csv,
    bulk_import_expenses,
)

router = APIRouter(prefix="/expenses", tags=["Expenses"])


@router.get("", response_model=List[ExpenseResponse])
def list_expenses(
    search: Optional[str] = None,
    category: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    limit: Optional[int] = None,
    offset: Optional[int] = 0,
):
    """Retrieve student expenses with search and category filtering."""
    return get_all_expenses(
        search=search,
        category=category,
        start_date=start_date,
        end_date=end_date,
        limit=limit,
        offset=offset,
    )


@router.get("/{expense_id}", response_model=ExpenseResponse)
def get_expense(expense_id: int):
    """Get single expense details by ID."""
    expense = get_expense_by_id(expense_id)
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Expense with ID {expense_id} not found",
        )
    return expense


@router.post("", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
def add_expense(expense: ExpenseCreate):
    """Manually record a new student expense."""
    try:
        return create_expense(expense)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to record expense: {str(e)}",
        )


@router.put("/{expense_id}", response_model=ExpenseResponse)
def modify_expense(expense_id: int, expense_update: ExpenseUpdate):
    """Update details of an existing expense."""
    updated = update_expense(expense_id, expense_update)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Expense with ID {expense_id} not found or no changes provided",
        )
    return updated


@router.delete("/{expense_id}", status_code=status.HTTP_200_OK)
def remove_expense(expense_id: int):
    """Delete an expense record."""
    success = delete_expense(expense_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Expense with ID {expense_id} not found",
        )
    return {"message": f"Expense #{expense_id} successfully deleted", "id": expense_id}


# --- CSV Import Endpoints ---

@router.post("/csv-preview", response_model=CSVPreviewResponse)
async def preview_csv(
    file: UploadFile = File(...),
    currency: str = Query("USD", description="Currency code for transaction amounts in the CSV"),
):
    """Uploads CSV file, validates columns and row integrity with Pandas, and returns preview."""
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be a valid .csv format",
        )

    try:
        content = await file.read()
        if not content:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded CSV file is empty",
            )
        cur_code = currency if isinstance(currency, str) and currency else "USD"
        return parse_and_preview_csv(content, currency=cur_code)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error parsing CSV: {str(e)}",
        )


@router.post("/csv-import", response_model=CSVImportResponse)
def confirm_csv_import(request: CSVImportConfirmRequest):
    """Imports the user-confirmed list of valid expenses in bulk."""
    if not request.expenses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No expenses provided for import",
        )

    count = bulk_import_expenses(request.expenses)
    return CSVImportResponse(
        imported_count=count,
        message=f"Successfully imported {count} expenses into your ledger",
    )
