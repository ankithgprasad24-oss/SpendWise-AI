import React, { useState } from 'react';
import {
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { formatCurrency } from '../utils/currency';
import type { CurrencyCode } from '../types';

export const SettingsView: React.FC = () => {
  const {
    currency,
    currencyInfo,
    setCurrency,
    availableCurrencies,
    rates,
    ratesSource,
    lastUpdated,
    refreshRates,
  } = useCurrency();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [successNote, setSuccessNote] = useState<string | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshRates();
      setSuccessNote('Exchange rates refreshed successfully.');
      setTimeout(() => setSuccessNote(null), 3000);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSelect = (code: CurrencyCode) => {
    setCurrency(code);
    setSuccessNote(`Display currency switched to ${code}.`);
    setTimeout(() => setSuccessNote(null), 3000);
  };

  const formattedDate = new Date(lastUpdated).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="space-y-7 animate-in fade-in duration-150">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Application Preferences & Currency</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Customize your student financial experience, display currencies, and locale conventions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Base: 1.00 USD</span>
            </span>
          </div>
        </div>

        {successNote && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successNote}</span>
          </div>
        )}

        {/* Currency Conversion Engine Status */}
        <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-bold text-slate-800">Reliable Currency Conversion Active</span>
            <p className="text-slate-500 mt-0.5">
              Source: <span className="capitalize font-semibold text-slate-700">{ratesSource} rates</span> &bull; Last synchronized: {formattedDate}
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-slate-100 transition-colors shadow-2xs self-start sm:self-auto cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync Rates Now'}</span>
          </button>
        </div>
      </div>

      {/* Currency Selection Grid */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Supported Currencies</h3>
            <p className="text-xs text-slate-500">
              Select any currency to instantly recompute and display all balances, charts, and budgets.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Active: {currencyInfo.flag} {currencyInfo.code} ({currencyInfo.symbol})
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {availableCurrencies.map((item) => {
            const isSelected = currency === item.code;
            const rate = rates[item.code] || 1.0;
            // Each card displays its own currency sample conversion for $50 base USD
            const sampleConversion = formatCurrency(50, item.code, rates);

            return (
              <div
                key={item.code}
                role="button"
                tabIndex={0}
                onClick={() => handleSelect(item.code)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelect(item.code);
                  }
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-emerald-50/80 border-emerald-500 shadow-xs'
                    : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{item.flag}</span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{item.code}</h4>
                      <p className="text-xs text-slate-500 font-medium">{item.name}</p>
                    </div>
                  </div>

                  <span className="text-lg font-bold text-slate-800">{item.symbol}</span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-xs">
                  <div className="flex justify-between items-center text-slate-500">
                    <span>1 USD Rate:</span>
                    <span className="font-semibold text-slate-800">
                      {rate.toFixed(rate > 10 ? 2 : 4)} {item.code}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500 mt-1">
                    <span>Sample $50:</span>
                    <span className="font-bold text-emerald-700">{sampleConversion}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
