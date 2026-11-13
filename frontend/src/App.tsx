import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './views/DashboardView';
import { ExpensesView } from './views/ExpensesView';
import { CsvImportView } from './views/CsvImportView';
import { BudgetsView } from './views/BudgetsView';
import { AnalyticsView } from './views/AnalyticsView';
import { AiInsightsView } from './views/AiInsightsView';
import { SavingsView } from './views/SavingsView';
import { SettingsView } from './views/SettingsView';

// Modals
import { AddExpenseModal } from './components/modals/AddExpenseModal';
import { EditExpenseModal } from './components/modals/EditExpenseModal';
import { AddBudgetModal } from './components/modals/AddBudgetModal';
import { AddGoalModal } from './components/modals/AddGoalModal';
import { DepositGoalModal } from './components/modals/DepositGoalModal';
import { ConfirmDialog } from './components/modals/ConfirmDialog';
import { CurrencySettingsModal } from './components/modals/CurrencySettingsModal';

// Currency Context
import { CurrencyProvider, useCurrency } from './context/CurrencyContext';

// API Services
import {
  checkBackendHealth,
  fetchExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  fetchBudgets,
  saveBudget,
  deleteBudget,
  fetchSavingsGoals,
  createSavingsGoal,
  depositToGoal,
  deleteSavingsGoal,
  fetchOverview,
  fetchMonthlyTrends,
  fetchDailySpending,
  fetchAiInsights,
} from './services/api';

import type {
  ViewType,
  Expense,
  ExpenseCreate,
  ExpenseUpdate,
  Budget,
  BudgetCreate,
  SavingsGoal,
  SavingsGoalCreate,
  FinancialOverview,
  MonthlyTrendItem,
  DailySpendingItem,
  AIInsightItem,
} from './types';

function AppInner() {
  const { format, currency } = useCurrency();
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [backendStatus, setBackendStatus] = useState<string>('checking...');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Core Data State
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [overview, setOverview] = useState<FinancialOverview | null>(null);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrendItem[]>([]);
  const [dailySpending, setDailySpending] = useState<DailySpendingItem[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsightItem[]>([]);

  // Modal State
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [budgetModalState, setBudgetModalState] = useState<{ isOpen: boolean; category?: string; limit?: number }>({
    isOpen: false,
  });
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [depositingGoal, setDepositingGoal] = useState<SavingsGoal | null>(null);
  const [isCurrencySettingsOpen, setIsCurrencySettingsOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Centralized Data Fetcher
  const loadAllData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [
        healthRes,
        expensesRes,
        overviewRes,
        budgetsRes,
        savingsRes,
        trendsRes,
        dailyRes,
        aiRes,
      ] = await Promise.all([
        checkBackendHealth(),
        fetchExpenses(),
        fetchOverview(),
        fetchBudgets(),
        fetchSavingsGoals(),
        fetchMonthlyTrends(),
        fetchDailySpending(),
        fetchAiInsights(currency),
      ]);

      setBackendStatus(healthRes.status);
      setExpenses(expensesRes);
      setOverview(overviewRes);
      setBudgets(budgetsRes);
      setSavingsGoals(savingsRes);
      setMonthlyTrends(trendsRes);
      setDailySpending(dailyRes);
      setAiInsights(aiRes);
    } catch (err) {
      console.error('Failed to load application data:', err);
      setBackendStatus('offline');
      showToast('Unable to connect to SpendWise backend. Ensure the server is running.', 'error');
    } finally {
      setIsRefreshing(false);
    }
  }, [currency]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // --- Handlers: Expenses ---
  const handleAddExpense = async (data: ExpenseCreate) => {
    await createExpense(data);
    showToast(`Recorded "${data.title}" (${format(data.amount)})`);
    await loadAllData();
  };

  const handleUpdateExpense = async (id: number, updates: ExpenseUpdate) => {
    await updateExpense(id, updates);
    showToast('Expense updated successfully');
    await loadAllData();
  };

  const handleDeleteExpense = (id: number) => {
    const expense = expenses.find((e) => e.id === id);
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Expense Record',
      message: `Are you sure you want to delete "${expense?.title || `Expense #${id}`}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await deleteExpense(id);
          showToast('Expense deleted');
          await loadAllData();
        } catch (err) {
          showToast(err instanceof Error ? err.message : 'Delete failed', 'error');
        }
      },
    });
  };

  // --- Handlers: Budgets ---
  const handleSaveBudget = async (data: BudgetCreate) => {
    await saveBudget(data);
    showToast(`Budget for ${data.category} set to ${format(data.monthly_limit)}`);
    await loadAllData();
  };

  const handleDeleteBudget = (id: number) => {
    const b = budgets.find((item) => item.id === id);
    setConfirmDialog({
      isOpen: true,
      title: 'Remove Category Budget',
      message: `Delete budget cap for "${b?.category}"? Spending alerts for this category will be disabled.`,
      onConfirm: async () => {
        try {
          await deleteBudget(id);
          showToast('Budget deleted');
          await loadAllData();
        } catch (err) {
          showToast(err instanceof Error ? err.message : 'Delete failed', 'error');
        }
      },
    });
  };

  // --- Handlers: Savings Goals ---
  const handleCreateGoal = async (data: SavingsGoalCreate) => {
    await createSavingsGoal(data);
    showToast(`Created savings goal "${data.name}"`);
    await loadAllData();
  };

  const handleDepositGoal = async (goalId: number, amount: number) => {
    await depositToGoal(goalId, amount);
    showToast(`Deposited ${format(amount)} toward goal!`);
    await loadAllData();
  };

  const handleDeleteGoal = (id: number) => {
    const goal = savingsGoals.find((g) => g.id === id);
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Savings Goal',
      message: `Are you sure you want to delete "${goal?.name}"?`,
      onConfirm: async () => {
        try {
          await deleteSavingsGoal(id);
          showToast('Savings goal removed');
          await loadAllData();
        } catch (err) {
          showToast(err instanceof Error ? err.message : 'Delete failed', 'error');
        }
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 font-sans flex flex-col antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-bottom-3 duration-200 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-900 text-white border-emerald-800'
              : 'bg-rose-900 text-white border-rose-800'
          }`}
        >
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        backendStatus={backendStatus}
        isOpenMobile={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
        onOpenCurrencySettings={() => setIsCurrencySettingsOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header
          currentView={currentView}
          onOpenMobileNav={() => setIsMobileNavOpen(true)}
          onAddExpenseClick={() => setIsAddExpenseOpen(true)}
          onRefreshClick={loadAllData}
          onOpenCurrencySettings={() => setIsCurrencySettingsOpen(true)}
          isRefreshing={isRefreshing}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-8">
          {currentView === 'dashboard' && (
            <DashboardView
              overview={overview}
              recentExpenses={expenses}
              monthlyTrends={monthlyTrends}
              aiInsights={aiInsights}
              savingsGoals={savingsGoals}
              onNavigate={setCurrentView}
              onAddExpense={() => setIsAddExpenseOpen(true)}
              onEditExpense={(exp) => setEditingExpense(exp)}
              onDeleteExpense={handleDeleteExpense}
            />
          )}

          {currentView === 'expenses' && (
            <ExpensesView
              expenses={expenses}
              onAddExpense={() => setIsAddExpenseOpen(true)}
              onEditExpense={(exp) => setEditingExpense(exp)}
              onDeleteExpense={handleDeleteExpense}
              onNavigate={setCurrentView}
            />
          )}

          {currentView === 'csv-import' && (
            <CsvImportView
              onImportSuccess={loadAllData}
              onNavigate={setCurrentView}
            />
          )}

          {currentView === 'budgets' && (
            <BudgetsView
              budgets={budgets}
              onOpenAddBudget={() => setBudgetModalState({ isOpen: true })}
              onEditBudget={(category, currentLimit) =>
                setBudgetModalState({ isOpen: true, category, limit: currentLimit })
              }
              onDeleteBudget={handleDeleteBudget}
            />
          )}

          {currentView === 'analytics' && (
            <AnalyticsView
              overview={overview}
              categoryBreakdown={overview?.category_breakdown || []}
              monthlyTrends={monthlyTrends}
              dailySpending={dailySpending}
            />
          )}

          {currentView === 'ai-insights' && (
            <AiInsightsView
              insights={aiInsights}
              overview={overview}
              onRefresh={loadAllData}
              onNavigate={setCurrentView}
            />
          )}

          {currentView === 'savings' && (
            <SavingsView
              savingsGoals={savingsGoals}
              onOpenAddGoal={() => setIsAddGoalOpen(true)}
              onOpenDeposit={(goal) => setDepositingGoal(goal)}
              onDeleteGoal={handleDeleteGoal}
            />
          )}

          {currentView === 'settings' && (
            <SettingsView />
          )}
        </main>
      </div>

      {/* Modals */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        onSubmit={handleAddExpense}
      />

      <EditExpenseModal
        isOpen={editingExpense !== null}
        expense={editingExpense}
        onClose={() => setEditingExpense(null)}
        onSubmit={handleUpdateExpense}
      />

      <AddBudgetModal
        isOpen={budgetModalState.isOpen}
        initialCategory={budgetModalState.category}
        initialLimit={budgetModalState.limit}
        onClose={() => setBudgetModalState({ isOpen: false })}
        onSubmit={handleSaveBudget}
      />

      <AddGoalModal
        isOpen={isAddGoalOpen}
        onClose={() => setIsAddGoalOpen(false)}
        onSubmit={handleCreateGoal}
      />

      <DepositGoalModal
        isOpen={depositingGoal !== null}
        goal={depositingGoal}
        onClose={() => setDepositingGoal(null)}
        onSubmit={handleDepositGoal}
      />

      <CurrencySettingsModal
        isOpen={isCurrencySettingsOpen}
        onClose={() => setIsCurrencySettingsOpen(false)}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
      />
    </div>
  );
}

export function App() {
  return (
    <CurrencyProvider>
      <AppInner />
    </CurrencyProvider>
  );
}

export default App;
