import React, { useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import type { SavingsGoal } from '../../types';
import { useCurrency } from '../../context/CurrencyContext';

interface DepositGoalModalProps {
  isOpen: boolean;
  goal: SavingsGoal | null;
  onClose: () => void;
  onSubmit: (goalId: number, amount: number) => Promise<void>;
}

export const DepositGoalModal: React.FC<DepositGoalModalProps> = ({
  isOpen,
  goal,
  onClose,
  onSubmit,
}) => {
  const { currencyInfo, format, toUSD } = useCurrency();
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !goal) return null;

  // Convenient presets based on currency scale
  const presets = currencyInfo.code === 'INR' || currencyInfo.code === 'JPY'
    ? [200, 500, 1000, 2000]
    : [10, 25, 50, 100];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) {
      setError(`Please enter a valid deposit amount greater than 0 in ${currencyInfo.code}.`);
      return;
    }

    try {
      setIsSubmitting(true);
      // Persist in base USD
      await onSubmit(goal.id, toUSD(parsed));
      setAmount('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Deposit failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Deposit to Goal</h2>
            <p className="text-xs text-slate-500 font-medium">{goal.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-xs text-emerald-900">
          <div className="flex justify-between items-center mb-1">
            <span className="text-emerald-700 font-medium">Current Balance:</span>
            <span className="font-bold">{format(goal.current_amount)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-emerald-700 font-medium">Target Milestone:</span>
            <span className="font-bold">{format(goal.target_amount)}</span>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Deposit Amount ({currencyInfo.symbol} {currencyInfo.code}) *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 font-medium text-sm">
                {currencyInfo.symbol}
              </span>
              <input
                type="number"
                step={currencyInfo.decimals === 0 ? '10' : '1'}
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={currencyInfo.code === 'INR' ? '500' : '25.00'}
                required
                autoFocus
                className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all text-slate-900 font-semibold"
              />
            </div>
          </div>

          <div className="flex gap-2">
            {presets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(preset.toString())}
                className="flex-1 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors cursor-pointer"
              >
                +{currencyInfo.symbol}{preset}
              </button>
            ))}
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
              <span>{isSubmitting ? 'Depositing...' : 'Confirm Deposit'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
