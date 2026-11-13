import React from 'react';
import { Menu, Plus, RefreshCw, Globe } from 'lucide-react';
import type { ViewType, CurrencyCode } from '../../types';
import { useCurrency } from '../../context/CurrencyContext';

interface HeaderProps {
  currentView: ViewType;
  onOpenMobileNav: () => void;
  onAddExpenseClick: () => void;
  onRefreshClick: () => void;
  onOpenCurrencySettings: () => void;
  isRefreshing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onOpenMobileNav,
  onAddExpenseClick,
  onRefreshClick,
  onOpenCurrencySettings,
  isRefreshing,
}) => {
  const { currency, setCurrency, availableCurrencies, currencyInfo } = useCurrency();

  const titles: Record<ViewType, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Financial Cockpit',
      subtitle: 'Overview of your semester budget, spending habits, and active savings.',
    },
    expenses: {
      title: 'Expense Ledger',
      subtitle: 'Record, search, filter, and modify your college expenditures.',
    },
    'csv-import': {
      title: 'CSV Expense Import',
      subtitle: 'Upload bank or spreadsheet statements with instant Pandas validation.',
    },
    budgets: {
      title: 'Category Budgets',
      subtitle: 'Set strict monthly limits for dining, housing, textbooks, and recreation.',
    },
    analytics: {
      title: 'Expense Analytics',
      subtitle: 'Deep-dive into spending velocity, category allocations, and historical trends.',
    },
    'ai-insights': {
      title: 'AI Student Financial Advisor',
      subtitle: 'Actionable financial intelligence, anomaly detection, and verified savings.',
    },
    savings: {
      title: 'Milestone Savings Goals',
      subtitle: 'Track textbook emergency funds, gadget purchases, and travel targets.',
    },
    settings: {
      title: 'Preferences & Currency',
      subtitle: 'Configure display currencies, exchange rates, and student settings.',
    },
  };

  const current = titles[currentView] || { title: 'SpendWise AI', subtitle: 'Student Financial Intelligence' };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileNav}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hidden cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">{current.title}</h1>
          <p className="text-xs text-slate-500 hidden sm:block">{current.subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Currency Quick-Switcher Dropdown */}
        <div className="relative flex items-center">
          <label htmlFor="header-currency-select" className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer">
            <span className="text-sm select-none cursor-pointer">{currencyInfo.flag}</span>
            <select
              id="header-currency-select"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className="text-xs font-bold text-slate-800 bg-transparent focus:outline-hidden cursor-pointer pr-1"
              title="Select display currency"
            >
              {availableCurrencies.map((c) => (
                <option key={c.code} value={c.code} className="cursor-pointer py-1 text-slate-900 bg-white">
                  {c.code} ({c.symbol})
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Currency Settings / Preferences Modal Button */}
        <button
          type="button"
          onClick={onOpenCurrencySettings}
          className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer"
          title="Currency Preferences & Exchange Rates"
          aria-label="Currency settings"
        >
          <Globe className="w-4 h-4 text-emerald-600" />
        </button>

        {/* Refresh Button */}
        <button
          type="button"
          onClick={onRefreshClick}
          disabled={isRefreshing}
          className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          title="Refresh live data"
          aria-label="Refresh data"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
        </button>

        {/* Add Expense Button */}
        <button
          type="button"
          onClick={onAddExpenseClick}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Expense</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>
    </header>
  );
};
