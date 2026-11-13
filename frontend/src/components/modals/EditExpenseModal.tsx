import React, { useState, useEffect } from 'react';
import { X, Calendar, Tag, CreditCard, FileText, CheckCircle2 } from 'lucide-react';
import type { Expense, ExpenseUpdate, CurrencyCode } from '../../types';
import { STUDENT_CATEGORIES, PAYMENT_METHODS } from './AddExpenseModal';
import { useCurrency } from '../../context/CurrencyContext';
import { getCurrencyInfo, convertToUSD, DEFAULT_RATES } from '../../utils/currency';

interface EditExpenseModalProps {
  isOpen: boolean;
  expense: Expense | null;
  onClose: () => void;
  onSubmit: (id: number, updates: ExpenseUpdate) => Promise<void>;
}

export const EditExpenseModal: React.FC<EditExpenseModalProps> = ({
  isOpen,
  expense,
  onClose,
  onSubmit,
}) => {
  const { availableCurrencies, rates } = useCurrency();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [txCurrency, setTxCurrency] = useState<CurrencyCode>('USD');
  const [category, setCategory] = useState(STUDENT_CATEGORIES[0]);
  const [date, setDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [notes, setNotes] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (expense) {
      setTitle(expense.title);
      const originalCur = (expense.original_currency as CurrencyCode) || 'USD';
      setTxCurrency(originalCur);

      // If original amount was preserved, display that exact original amount to prevent drift/double-conversion
      const origAmt =
        expense.original_amount != null && expense.original_amount > 0
          ? expense.original_amount
          : expense.amount;
      const info = getCurrencyInfo(originalCur);
      const formatted =
        info.decimals === 0 ? Math.round(origAmt).toString() : origAmt.toFixed(2);
      setAmount(formatted);

      setCategory(expense.category);
      setDate(expense.date);
      setPaymentMethod(expense.payment_method || PAYMENT_METHODS[0]);
      setNotes(expense.notes || '');
      setIsRecurring(expense.is_recurring || false);
      setError(null);
    }
  }, [expense]);

  if (!isOpen || !expense) return null;

  const txCurrencyInfo = getCurrencyInfo(txCurrency);
  const parsedAmount = parseFloat(amount);
  const equivalentUsd =
    !isNaN(parsedAmount) && parsedAmount > 0
      ? convertToUSD(parsedAmount, txCurrency, rates)
      : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Title cannot be empty.');
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please provide a valid positive amount.');
      return;
    }

    try {
      setIsSubmitting(true);

      // Check if amount or currency changed
      const originalCur = (expense.original_currency as CurrencyCode) || 'USD';
      const origAmt =
        expense.original_amount != null && expense.original_amount > 0
          ? expense.original_amount
          : expense.amount;

      let finalAmountInUSD: number;
      if (txCurrency === originalCur && Math.abs(parsedAmount - origAmt) < 0.001) {
        // Unchanged value: maintain exact stored base USD amount to eliminate any floating-point drift
        finalAmountInUSD = expense.amount;
      } else {
        // Value or currency modified: recalculate base USD
        finalAmountInUSD = roundToTwo(convertToUSD(parsedAmount, txCurrency, rates));
      }

      await onSubmit(expense.id, {
        title: title.trim(),
        amount: finalAmountInUSD,
        original_amount: roundToTwo(parsedAmount),
        original_currency: txCurrency,
        category,
        date,
        payment_method: paymentMethod,
        notes: notes.trim(),
        is_recurring: isRecurring,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Edit Expense #{expense.id}</h2>
            <p className="text-xs text-slate-500">Update amount, category, date or notes.</p>
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
              Title / Merchant Name *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all text-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Amount *
                </label>
                <span className="text-[10px] font-medium text-slate-400">
                  {txCurrencyInfo.name}
                </span>
              </div>
              <div className="flex rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-600 transition-all overflow-hidden bg-white">
                <div className="relative border-r border-slate-200 bg-slate-50 flex items-center shrink-0">
                  <select
                    value={txCurrency}
                    onChange={(e) => setTxCurrency(e.target.value as CurrencyCode)}
                    className="h-full pl-2.5 pr-6 py-2 text-xs font-bold text-slate-700 bg-transparent border-0 focus:outline-hidden cursor-pointer appearance-none"
                    aria-label="Transaction Currency"
                  >
                    {availableCurrencies.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.code}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-1.5 text-slate-400 text-[10px]">▼</span>
                </div>
                <div className="relative flex-1 flex items-center">
                  <span className="pl-3 pr-1 text-slate-400 font-bold text-xs select-none">
                    {txCurrencyInfo.symbol}
                  </span>
                  <input
                    type="number"
                    step={txCurrencyInfo.decimals === 0 ? '1' : '0.01'}
                    min={txCurrencyInfo.decimals === 0 ? '1' : '0.01'}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="w-full pr-3 py-2 text-sm border-0 focus:outline-hidden text-slate-900 bg-transparent font-semibold"
                  />
                </div>
              </div>
              {txCurrency !== 'USD' && equivalentUsd > 0 && (
                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                  <span>≈ ${equivalentUsd.toFixed(2)} USD base</span>
                  <span>1 USD = {rates[txCurrency] || DEFAULT_RATES[txCurrency]} {txCurrency}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Calendar className="w-4 h-4" />
                </span>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all text-slate-900 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                Payment Method
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <CreditCard className="w-4 h-4" />
                </span>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all text-slate-900 bg-white cursor-pointer"
                >
                  {PAYMENT_METHODS.map((pm) => (
                    <option key={pm} value={pm}>
                      {pm}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notes
            </label>
            <div className="relative">
              <span className="absolute top-2.5 left-3 pointer-events-none text-slate-400">
                <FileText className="w-4 h-4" />
              </span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all text-slate-900"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="editRecurring"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
            />
            <label htmlFor="editRecurring" className="text-xs font-medium text-slate-700 cursor-pointer">
              Recurring Monthly Expense
            </label>
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
              <span>{isSubmitting ? 'Updating...' : 'Update Expense'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

function roundToTwo(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}
