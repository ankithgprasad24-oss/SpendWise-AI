export type ViewType =
  | 'dashboard'
  | 'expenses'
  | 'csv-import'
  | 'budgets'
  | 'analytics'
  | 'ai-insights'
  | 'savings'
  | 'settings';

export interface Expense {
  id: number;
  title: string;
  amount: number;
  category: string;
  date: string;
  payment_method: string;
  notes?: string;
  is_recurring: boolean;
  original_amount?: number;
  original_currency?: string;
  created_at?: string;
}

export interface ExpenseCreate {
  title: string;
  amount: number;
  category: string;
  date: string;
  payment_method?: string;
  notes?: string;
  is_recurring?: boolean;
  original_amount?: number;
  original_currency?: string;
}

export interface ExpenseUpdate {
  title?: string;
  amount?: number;
  category?: string;
  date?: string;
  payment_method?: string;
  notes?: string;
  is_recurring?: boolean;
  original_amount?: number;
  original_currency?: string;
}

export interface CSVRowPreview {
  row_number: number;
  title: string;
  amount: number;
  category: string;
  date: string;
  payment_method: string;
  notes: string;
  original_amount?: number;
  original_currency?: string;
  is_valid: boolean;
  error?: string | null;
}

export interface CSVPreviewResponse {
  total_rows: number;
  valid_count: number;
  invalid_count: number;
  currency?: string;
  preview_rows: CSVRowPreview[];
  invalid_rows: CSVRowPreview[];
}

export interface Budget {
  id: number;
  category: string;
  monthly_limit: number;
  spent: number;
  remaining: number;
  utilization_percentage: number;
  status: 'normal' | 'warning' | 'exceeded';
}

export interface BudgetCreate {
  category: string;
  monthly_limit: number;
}

export interface SavingsGoal {
  id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date?: string | null;
  progress_percentage: number;
  remaining_amount: number;
  is_completed: boolean;
  created_at?: string | null;
}

export interface SavingsGoalCreate {
  name: string;
  target_amount: number;
  current_amount?: number;
  target_date?: string;
}

export interface CategoryBreakdownItem {
  category: string;
  spent: number;
  limit: number;
  percentage_of_total: number;
  transaction_count: number;
  status: 'normal' | 'warning' | 'exceeded';
}

export interface MonthlyTrendItem {
  month: string;
  month_name: string;
  spent: number;
  budget: number;
  savings: number;
}

export interface DailySpendingItem {
  date: string;
  amount: number;
}

export interface FinancialOverview {
  total_spent: number;
  monthly_budget: number;
  remaining_budget: number;
  total_expenses_count: number;
  top_category: string;
  student_financial_health_score: number;
  monthly_savings: number;
  category_breakdown: CategoryBreakdownItem[];
}

export interface AIInsightItem {
  id: string;
  title: string;
  summary: string;
  action_item: string;
  category: 'tip' | 'warning' | 'achievement' | 'budget';
  impact_amount?: number | null;
  priority?: 'high' | 'medium' | 'low';
  calculation_basis?: string | null;
  is_potential_saving?: boolean;
}

export type CurrencyCode =
  | 'USD'
  | 'INR'
  | 'EUR'
  | 'GBP'
  | 'JPY'
  | 'AUD'
  | 'CAD'
  | 'SGD'
  | 'AED';

export interface CurrencyInfo {
  code: CurrencyCode;
  name: string;
  symbol: string;
  locale: string;
  flag: string;
  decimals: number;
}

export interface ExchangeRatesResponse {
  base: string;
  rates: Record<CurrencyCode, number>;
  source: 'live' | 'cached';
  last_updated: number;
}
