import React from 'react';
import {
  Wallet,
  TrendingDown,
  PiggyBank,
  Brain,
  ArrowUpRight,
  Sparkles,
  Plus,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { StatCard } from '../components/dashboard/StatCard';
import { useCurrency } from '../context/CurrencyContext';
import type {
  FinancialOverview,
  Expense,
  MonthlyTrendItem,
  AIInsightItem,
  SavingsGoal,
  ViewType,
} from '../types';

interface DashboardViewProps {
  overview: FinancialOverview | null;
  recentExpenses: Expense[];
  monthlyTrends: MonthlyTrendItem[];
  aiInsights: AIInsightItem[];
  savingsGoals: SavingsGoal[];
  onNavigate: (view: ViewType) => void;
  onAddExpense: () => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: number) => void;
}

const CATEGORY_COLORS = [
  '#059669', // Emerald
  '#0284c7', // Sky
  '#d97706', // Amber
  '#7c3aed', // Purple
  '#db2777', // Pink
  '#14b8a6', // Teal
  '#ea580c', // Orange
  '#64748b', // Slate
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  overview,
  recentExpenses,
  monthlyTrends,
  aiInsights,
  savingsGoals,
  onNavigate,
  onAddExpense,
  onEditExpense,
  onDeleteExpense,
}) => {
  const { format, convert, currencyInfo, localizeText } = useCurrency();
  const topAiInsight = aiInsights.length > 0 ? aiInsights[0] : null;

  // Chart data formatting with currency conversion
  const pieData =
    overview?.category_breakdown.map((item) => ({
      name: item.category,
      value: convert(item.spent),
      rawUsd: item.spent,
    })) || [];

  const convertedTrends = monthlyTrends.map((t) => ({
    ...t,
    displaySpent: convert(t.spent),
    displayBudget: convert(t.budget),
  }));

  return (
    <div className="space-y-7 animate-in fade-in duration-150">
      {/* AI Quick Insight Banner */}
      {topAiInsight && (
        <div className="bg-gradient-to-r from-emerald-50 via-white to-emerald-50/40 rounded-3xl p-5 sm:p-6 border border-emerald-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs shadow-emerald-600/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  AI Advisor Spotlight
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {topAiInsight.category}
                </span>
                {topAiInsight.impact_amount && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-2xs">
                    {topAiInsight.is_potential_saving
                      ? `Potential: +${format(topAiInsight.impact_amount)}/mo`
                      : `Buffer: ${format(topAiInsight.impact_amount)}`}
                  </span>
                )}
              </div>
              <h4 className="text-sm font-bold text-slate-900 mt-0.5">{localizeText(topAiInsight.title)}</h4>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                {localizeText(topAiInsight.summary)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('ai-insights')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-emerald-300 text-emerald-800 font-semibold text-xs hover:bg-emerald-50 transition-colors shadow-2xs self-end md:self-auto shrink-0 cursor-pointer"
          >
            <span>Explore All Insights</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 4 Core Financial KPI Stat Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Monthly Spent"
          value={overview ? format(overview.total_spent) : format(0)}
          subtext="Actual semester spend"
          icon={TrendingDown}
          trend={overview && overview.total_spent > 0 ? `${overview.total_expenses_count} items` : 'No spend'}
          trendPositive={overview ? overview.total_spent <= overview.monthly_budget : true}
        />
        <StatCard
          title="Remaining Budget"
          value={overview ? format(overview.remaining_budget) : format(0)}
          subtext={`Of ${overview ? format(overview.monthly_budget) : format(0)} monthly pool`}
          icon={Wallet}
          trend={
            overview && overview.monthly_budget > 0
              ? `${Math.round((overview.remaining_budget / overview.monthly_budget) * 100)}% left`
              : '100% left'
          }
          trendPositive={overview ? overview.remaining_budget > 0 : true}
        />
        <StatCard
          title="Active Savings"
          value={overview ? format(overview.monthly_savings) : format(0)}
          subtext="Across milestone goals"
          icon={PiggyBank}
          trend={`${savingsGoals.length} Goals active`}
          trendPositive={true}
        />
        <StatCard
          title="Student Health Score"
          value={`${overview ? overview.student_financial_health_score : 90} / 100`}
          subtext="Discipline pace index"
          icon={Brain}
          trend={
            overview && overview.student_financial_health_score >= 85
              ? 'Excellent'
              : 'Attention Needed'
          }
          trendPositive={overview ? overview.student_financial_health_score >= 80 : true}
        />
      </section>

      {/* Charts Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Expense Comparison Trends Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Monthly Spending Trends</h3>
              <p className="text-xs text-slate-500">
                Trajectory in {currencyInfo.name} ({currencyInfo.symbol})
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('analytics')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
            >
              Analytics <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-6 h-64 w-full">
            {convertedTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={convertedTrends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <XAxis dataKey="month_name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(v) => `${currencyInfo.symbol}${Number(v).toLocaleString()}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      fontSize: '12px',
                    }}
                    formatter={(val) => [
                      `${currencyInfo.symbol}${Number(val).toLocaleString(undefined, {
                        minimumFractionDigits: currencyInfo.code === 'JPY' ? 0 : 2,
                        maximumFractionDigits: currencyInfo.code === 'JPY' ? 0 : 2,
                      })}`,
                      '',
                    ]}
                  />
                  <Bar dataKey="displaySpent" name="Spent" fill="#059669" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="displayBudget" name="Budget Limit" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No trend data available yet
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown Donut / Pie Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Spending Breakdown</h3>
              <p className="text-xs text-slate-500">Distribution by student category</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('budgets')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
            >
              Budgets <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4 h-56 w-full relative">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                    }}
                    formatter={(val) => [
                      `${currencyInfo.symbol}${Number(val).toLocaleString(undefined, {
                        minimumFractionDigits: currencyInfo.code === 'JPY' ? 0 : 2,
                        maximumFractionDigits: currencyInfo.code === 'JPY' ? 0 : 2,
                      })}`,
                      'Spent',
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No expenses logged
              </div>
            )}
          </div>

          {/* Quick Legend */}
          <div className="mt-2 space-y-1.5 overflow-y-auto max-h-28 pr-1 text-xs">
            {overview?.category_breakdown.slice(0, 4).map((item, idx) => (
              <div key={item.category} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                  />
                  <span className="text-slate-600 truncate max-w-[130px]">{item.category}</span>
                </div>
                <span className="font-semibold text-slate-800">{format(item.spent)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Transactions & Savings Goals Row */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Transactions</h3>
              <p className="text-xs text-slate-500">Latest activity from your campus ledger</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onAddExpense}
                className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('expenses')}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                View All
              </button>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            {recentExpenses.length > 0 ? (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 font-semibold border-b border-slate-100">
                    <th className="pb-3">Title / Merchant</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3 text-right">Amount</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentExpenses.slice(0, 6).map((expense) => (
                    <tr key={expense.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 font-semibold text-slate-800 flex items-center gap-2">
                        <span className="truncate max-w-[180px] sm:max-w-xs">{expense.title}</span>
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {expense.category}
                        </span>
                      </td>
                      <td className="py-3 text-slate-500">{expense.date}</td>
                      <td className="py-3 font-bold text-slate-900 text-right">
                        {format(expense.amount)}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onEditExpense(expense)}
                            className="text-xs text-slate-500 hover:text-emerald-600 px-1 py-0.5 cursor-pointer"
                          >
                            Edit
                          </button>
                          <span className="text-slate-300">&bull;</span>
                          <button
                            type="button"
                            onClick={() => onDeleteExpense(expense.id)}
                            className="text-xs text-slate-400 hover:text-rose-600 px-1 py-0.5 cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                No recent transactions found. Click "+ Add Expense" to begin.
              </div>
            )}
          </div>
        </div>

        {/* Savings Goals Preview Widget */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <PiggyBank className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Savings Milestones</h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('savings')}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
              >
                Goals <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {savingsGoals.length > 0 ? (
                savingsGoals.slice(0, 3).map((goal) => (
                  <div key={goal.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-slate-800">{goal.name}</span>
                      <span className="font-semibold text-emerald-700">{goal.progress_percentage}%</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-600 transition-all duration-300"
                        style={{ width: `${Math.min(100, goal.progress_percentage)}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2">
                      <span>Saved: {format(goal.current_amount)}</span>
                      <span>Target: {format(goal.target_amount)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-slate-400">
                  No active savings goals. Set one to build an emergency fund!
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => onNavigate('savings')}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span>Manage All Savings Goals</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
