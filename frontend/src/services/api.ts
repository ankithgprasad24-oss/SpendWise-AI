import type {
  Expense,
  ExpenseCreate,
  ExpenseUpdate,
  Budget,
  BudgetCreate,
  SavingsGoal,
  SavingsGoalCreate,
  FinancialOverview,
  CategoryBreakdownItem,
  MonthlyTrendItem,
  DailySpendingItem,
  AIInsightItem,
  CSVPreviewResponse,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorDetail = `Request failed with status ${res.status}`;
    try {
      const errorJson = await res.json();
      if (errorJson.detail) {
        errorDetail = typeof errorJson.detail === 'string' ? errorJson.detail : JSON.stringify(errorJson.detail);
      }
    } catch {
      // ignore
    }
    throw new Error(errorDetail);
  }
  return res.json();
}

// --- Health Check ---
export async function checkBackendHealth(): Promise<{
  status: string;
  app: string;
  version: string;
  environment: string;
  ai_provider?: string;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) throw new Error('Unhealthy');
    return await res.json();
  } catch {
    return {
      status: 'offline',
      app: 'SpendWise AI Backend',
      version: 'unknown',
      environment: 'disconnected',
    };
  }
}

// --- Expenses ---
export async function fetchExpenses(params?: {
  search?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
}): Promise<Expense[]> {
  const url = new URL(`${API_BASE_URL}/expenses`);
  if (params?.search) url.searchParams.set('search', params.search);
  if (params?.category && params.category !== 'All') url.searchParams.set('category', params.category);
  if (params?.startDate) url.searchParams.set('start_date', params.startDate);
  if (params?.endDate) url.searchParams.set('end_date', params.endDate);

  const res = await fetch(url.toString());
  return handleResponse<Expense[]>(res);
}

export async function createExpense(expense: ExpenseCreate): Promise<Expense> {
  const res = await fetch(`${API_BASE_URL}/expenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(expense),
  });
  return handleResponse<Expense>(res);
}

export async function updateExpense(id: number, expense: ExpenseUpdate): Promise<Expense> {
  const res = await fetch(`${API_BASE_URL}/expenses/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(expense),
  });
  return handleResponse<Expense>(res);
}

export async function deleteExpense(id: number): Promise<{ message: string; id: number }> {
  const res = await fetch(`${API_BASE_URL}/expenses/${id}`, {
    method: 'DELETE',
  });
  return handleResponse<{ message: string; id: number }>(res);
}

// --- CSV Import ---
export async function previewCsv(file: File, currency: string = 'USD'): Promise<CSVPreviewResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const url = new URL(`${API_BASE_URL}/expenses/csv-preview`);
  if (currency) {
    url.searchParams.set('currency', currency);
  }

  const res = await fetch(url.toString(), {
    method: 'POST',
    body: formData,
  });
  return handleResponse<CSVPreviewResponse>(res);
}

export async function confirmCsvImport(expenses: ExpenseCreate[]): Promise<{ imported_count: number; message: string }> {
  const res = await fetch(`${API_BASE_URL}/expenses/csv-import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ expenses }),
  });
  return handleResponse<{ imported_count: number; message: string }>(res);
}

// --- Budgets ---
export async function fetchBudgets(): Promise<Budget[]> {
  const res = await fetch(`${API_BASE_URL}/budgets`);
  return handleResponse<Budget[]>(res);
}

export async function saveBudget(budget: BudgetCreate): Promise<Budget> {
  const res = await fetch(`${API_BASE_URL}/budgets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(budget),
  });
  return handleResponse<Budget>(res);
}

export async function deleteBudget(id: number): Promise<{ message: string; id: number }> {
  const res = await fetch(`${API_BASE_URL}/budgets/${id}`, {
    method: 'DELETE',
  });
  return handleResponse<{ message: string; id: number }>(res);
}

// --- Savings Goals ---
export async function fetchSavingsGoals(): Promise<SavingsGoal[]> {
  const res = await fetch(`${API_BASE_URL}/savings-goals`);
  return handleResponse<SavingsGoal[]>(res);
}

export async function createSavingsGoal(goal: SavingsGoalCreate): Promise<SavingsGoal> {
  const res = await fetch(`${API_BASE_URL}/savings-goals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(goal),
  });
  return handleResponse<SavingsGoal>(res);
}

export async function depositToGoal(goalId: number, amount: number): Promise<SavingsGoal> {
  const res = await fetch(`${API_BASE_URL}/savings-goals/${goalId}/deposit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount }),
  });
  return handleResponse<SavingsGoal>(res);
}

export async function deleteSavingsGoal(id: number): Promise<{ message: string; id: number }> {
  const res = await fetch(`${API_BASE_URL}/savings-goals/${id}`, {
    method: 'DELETE',
  });
  return handleResponse<{ message: string; id: number }>(res);
}

// --- Analytics & Insights ---
export async function fetchOverview(): Promise<FinancialOverview> {
  const res = await fetch(`${API_BASE_URL}/insights/overview`);
  return handleResponse<FinancialOverview>(res);
}

export async function fetchCategoryBreakdown(): Promise<CategoryBreakdownItem[]> {
  const res = await fetch(`${API_BASE_URL}/insights/category-breakdown`);
  return handleResponse<CategoryBreakdownItem[]>(res);
}

export async function fetchMonthlyTrends(): Promise<MonthlyTrendItem[]> {
  const res = await fetch(`${API_BASE_URL}/insights/monthly-trends`);
  return handleResponse<MonthlyTrendItem[]>(res);
}

export async function fetchDailySpending(): Promise<DailySpendingItem[]> {
  const res = await fetch(`${API_BASE_URL}/insights/daily-spending`);
  return handleResponse<DailySpendingItem[]>(res);
}

// --- AI Insights ---
export async function fetchAiInsights(currency?: string): Promise<AIInsightItem[]> {
  const url = currency
    ? `${API_BASE_URL}/ai/insights?currency=${encodeURIComponent(currency)}`
    : `${API_BASE_URL}/ai/insights`;
  const res = await fetch(url);
  return handleResponse<AIInsightItem[]>(res);
}
