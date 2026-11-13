import React, { useState, useEffect } from 'react';
import { X, Tag, CheckCircle2 } from 'lucide-react';
import type { BudgetCreate } from '../../types';
import { STUDENT_CATEGORIES } from './AddExpenseModal';
import { useCurrency } from '../../context/CurrencyContext';

interface AddBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (budget: BudgetCreate) => Promise<void>;
  initialCategory?: string;
  initialLimit?: number;
}

export const AddBudgetModal: React.FC<AddBudgetModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialCategory,
  initialLimit,
}) => {
  const { currencyInfo, fromUSD, toUSD } = useCurrency();
  const [category, setCategory] = useState(initialCategory || STUDENT_CATEGORIES[0]);
  const [limit, setLimit] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialCategory) setCategory(initialCategory);
    if (initialLimit !== undefined) {
      const converted = fromUSD(initialLimit);
      setLimit(currencyInfo.decimals === 0 ? Math.round(converted).toString() : converted.toFixed(2));
    } else {
      setLimit('');
    }
    setError(null);
  }, [isOpen, initialCategory, initialLimit, fromUSD, currencyInfo]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedLimit = parseFloat(limit);
    if (isNaN(parsedLimit) || parsedLimit <= 0) {
      setError(`Please provide a valid monthly budget limit greater than 0 in ${currencyInfo.code}.`);
      return;
    }

    try {
      setIsSubmitting(true);
      // Persist in base USD
      const limitInUSD = toUSD(parsedLimit);
      await onSubmit({
        category,
        monthly_limit: limitInUSD,
      });
      setLimit('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set budget');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Set Monthly Budget</h2>
            <p className="text-xs text-slate-500">Assign a strict spending cap in {currencyInfo.code} to keep allowances on track.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Category *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Tag className="w-4 h-4" />
              </span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all text-slate-900 bg-white cursor-pointer"
              >
                {STUDENT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Monthly Limit ({currencyInfo.symbol} {currencyInfo.code}) *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 font-medium text-sm">
                {currencyInfo.symbol}
              </span>
              <input
                type="number"
                step={currencyInfo.decimals === 0 ? '1' : '0.01'}
                min={currencyInfo.decimals === 0 ? '1' : '0.01'}
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                placeholder={currencyInfo.code === 'INR' ? '5000' : '250.00'}
                required
                className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all text-slate-900 font-semibold"
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              SpendWise will warn you when your spending reaches 80% and 100% of this limit.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-xs transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : 'Set Budget'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
