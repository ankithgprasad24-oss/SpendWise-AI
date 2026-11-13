import React from 'react';
import {
  Plus,
  AlertTriangle,
  AlertCircle,
  Tag,
  Trash2,
  Edit2,
} from 'lucide-react';
import type { Budget } from '../types';
import { useCurrency } from '../context/CurrencyContext';

interface BudgetsViewProps {
  budgets: Budget[];
  onOpenAddBudget: () => void;
  onEditBudget: (category: string, currentLimit: number) => void;
  onDeleteBudget: (id: number) => void;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  budgets,
  onOpenAddBudget,
  onEditBudget,
  onDeleteBudget,
}) => {
  const { format } = useCurrency();
  const totalBudgeted = budgets.reduce((sum, b) => sum + b.monthly_limit, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const totalRemaining = Math.max(0, totalBudgeted - totalSpent);
  const totalUtilization = totalBudgeted > 0 ? Math.round((totalSpent / totalBudgeted) * 100) : 0;

  const warningBudgets = budgets.filter((b) => b.status === 'warning');
  const exceededBudgets = budgets.filter((b) => b.status === 'exceeded');

  return (
    <div className="space-y-7 animate-in fade-in duration-150">
      {/* Overall Budget Overview Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Semester Budget Allocation</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Category caps designed to prevent mid-semester allowance exhaustion.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenAddBudget}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Set Category Budget</span>
          </button>
        </div>

        {/* Global Utilization Progress Bar */}
        <div className="mt-6 space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-slate-600">Total Monthly Utilization ({totalUtilization}%)</span>
            <span className="text-slate-900 font-bold">
              {format(totalSpent)} spent of {format(totalBudgeted)} pool
            </span>
          </div>

          <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                totalUtilization > 100
                  ? 'bg-rose-500'
                  : totalUtilization >= 80
                  ? 'bg-amber-500'
                  : 'bg-emerald-600'
              }`}
              style={{ width: `${Math.min(100, totalUtilization)}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[11px] text-slate-400">
            <span>Remaining Buffer: {format(totalRemaining)}</span>
            <span>Target: Keep under 100% until month-end</span>
          </div>
        </div>

        {/* Warning Banners if any exceeded */}
        {(exceededBudgets.length > 0 || warningBudgets.length > 0) && (
          <div className="mt-6 space-y-2">
            {exceededBudgets.map((b) => (
              <div
                key={`exc-${b.id}`}
                className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>
                    <strong>{b.category}</strong> exceeded limit by {format(b.spent - b.monthly_limit)} (
                    {b.utilization_percentage}%)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onEditBudget(b.category, b.monthly_limit)}
                  className="px-2.5 py-1 bg-white border border-rose-300 rounded-lg text-rose-700 hover:bg-rose-100/60 cursor-pointer"
                >
                  Adjust Limit
                </button>
              </div>
            ))}

            {warningBudgets.map((b) => (
              <div
                key={`warn-${b.id}`}
                className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>{b.category}</strong> approaching cap: {b.utilization_percentage}% used ({format(b.spent)} of {format(b.monthly_limit)})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onEditBudget(b.category, b.monthly_limit)}
                  className="px-2.5 py-1 bg-white border border-amber-300 rounded-lg text-amber-700 hover:bg-amber-100/60 cursor-pointer"
                >
                  Adjust Limit
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Category Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {budgets.map((b) => {
          const isExceeded = b.status === 'exceeded';
          const isWarning = b.status === 'warning';

          return (
            <div
              key={b.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                      <Tag className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{b.category}</h4>
                      <p className="text-[11px] text-slate-400">Monthly Ceiling</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      isExceeded
                        ? 'bg-rose-100 text-rose-800'
                        : isWarning
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {b.status}
                  </span>
                </div>

                <div className="mt-5 space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-2xl font-extrabold text-slate-900">
                      {format(b.spent)}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      Limit: {format(b.monthly_limit)}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isExceeded
                          ? 'bg-rose-500'
                          : isWarning
                          ? 'bg-amber-500'
                          : 'bg-emerald-600'
                      }`}
                      style={{ width: `${Math.min(100, b.utilization_percentage)}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[11px] pt-1">
                    <span className="text-slate-500 font-medium">
                      {b.utilization_percentage}% utilized
                    </span>
                    <span className={`font-semibold ${b.remaining === 0 ? 'text-rose-600' : 'text-slate-600'}`}>
                      {format(b.remaining)} left
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => onEditBudget(b.category, b.monthly_limit)}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Adjust Cap</span>
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteBudget(b.id)}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Delete budget"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
