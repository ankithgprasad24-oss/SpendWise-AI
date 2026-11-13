import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  UploadCloud,
  Edit2,
  Trash2,
  Repeat,
  CreditCard,
  FileSpreadsheet,
} from 'lucide-react';
import type { Expense, ViewType } from '../types';
import { STUDENT_CATEGORIES } from '../components/modals/AddExpenseModal';
import { useCurrency } from '../context/CurrencyContext';

interface ExpensesViewProps {
  expenses: Expense[];
  onAddExpense: () => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: number) => void;
  onNavigate: (view: ViewType) => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  expenses,
  onAddExpense,
  onEditExpense,
  onDeleteExpense,
  onNavigate,
}) => {
  const { format, currencyInfo } = useCurrency();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((exp) => {
        const matchesSearch =
          exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (exp.notes && exp.notes.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = selectedCategory === 'All' || exp.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
        if (sortBy === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
        if (sortBy === 'amount-desc') return b.amount - a.amount;
        if (sortBy === 'amount-asc') return a.amount - b.amount;
        return 0;
      });
  }, [expenses, searchTerm, selectedCategory, sortBy]);

  const totalFilteredAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, item) => sum + item.amount, 0);
  }, [filteredExpenses]);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Controls Bar: Search, Category Filters, and Actions */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search expenses, merchants, textbook titles or notes..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate('csv-import')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 text-emerald-600" />
              <span>Import CSV</span>
            </button>
            <button
              type="button"
              onClick={onAddExpense}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>

        {/* Category Filter Pills & Sort Select */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <button
              type="button"
              onClick={() => setSelectedCategory('All')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === 'All'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              All Categories ({expenses.length})
            </button>
            {STUDENT_CATEGORIES.map((cat) => {
              const count = expenses.filter((e) => e.category === cat).length;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  {cat} {count > 0 && `(${count})`}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end lg:self-auto">
            <span className="text-xs text-slate-400 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs font-semibold py-1.5 px-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="date-desc">Newest Date</option>
              <option value="date-asc">Oldest Date</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Filter Strip */}
      <div className="flex items-center justify-between text-xs px-2 text-slate-500">
        <span>
          Showing <strong className="text-slate-800">{filteredExpenses.length}</strong> expenditures
          {selectedCategory !== 'All' && <span> in <strong className="text-emerald-700">{selectedCategory}</strong></span>}
          <span className="ml-2 text-slate-400 font-medium">({currencyInfo.code})</span>
        </span>
        <span>
          Total Filtered Spend: <strong className="text-slate-900 text-sm font-bold">{format(totalFilteredAmount)}</strong>
        </span>
      </div>

      {/* Main Expense Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {filteredExpenses.length > 0 ? (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3.5 px-6">Description / Merchant</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Payment Method</th>
                  <th className="py-3.5 px-6 text-right">Amount ({currencyInfo.symbol})</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Title & Notes */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 text-sm">{expense.title}</span>
                        {expense.notes && (
                          <span className="text-[11px] text-slate-400 mt-0.5 max-w-sm truncate">
                            {expense.notes}
                          </span>
                        )}
                        {expense.is_recurring && (
                          <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded w-fit border border-emerald-100">
                            <Repeat className="w-2.5 h-2.5" /> Recurring monthly
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                        {expense.category}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 text-slate-500 whitespace-nowrap font-medium">
                      {expense.date}
                    </td>

                    {/* Payment Mode */}
                    <td className="py-4 px-4 text-slate-600 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-medium text-slate-700">
                        <CreditCard className="w-3 h-3 text-slate-400" />
                        {expense.payment_method || 'UPI / Card'}
                      </span>
                    </td>

                    {/* Amount formatted in selected currency */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-extrabold text-slate-900">
                          {format(expense.amount)}
                        </span>
                        {expense.original_currency &&
                          expense.original_currency !== currencyInfo.code &&
                          expense.original_amount != null && (
                            <span className="text-[10px] text-slate-400 font-medium">
                              Orig: {expense.original_currency} {expense.original_amount.toFixed(2)}
                            </span>
                          )}
                      </div>
                    </td>

                    {/* Action Buttons */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onEditExpense(expense)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                          title="Edit expense"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteExpense(expense.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete expense"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-16 text-center">
              <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800">No expenses matched your filter</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Try clearing your search query or switching categories, or click "+ Add Expense" to record a new transaction.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                }}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
