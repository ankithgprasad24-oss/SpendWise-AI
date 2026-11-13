import React from 'react';
import { X, Check, Globe, RefreshCw, ShieldCheck } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import type { CurrencyCode } from '../../types';

interface CurrencySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CurrencySettingsModal: React.FC<CurrencySettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    currency,
    setCurrency,
    availableCurrencies,
    rates,
    ratesSource,
    lastUpdated,
    refreshRates,
  } = useCurrency();

  const [isRefreshing, setIsRefreshing] = React.useState(false);

  if (!isOpen) return null;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshRates();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSelect = (code: CurrencyCode) => {
    setCurrency(code);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Currency & Preferences</h2>
              <p className="text-xs text-slate-500">Choose your preferred display currency</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Exchange Rate Status Strip */}
        <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-slate-600">
              Rates: <strong className="text-slate-900 capitalize">{ratesSource}</strong> &bull; Synced {new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Update</span>
          </button>
        </div>

        {/* Currency List */}
        <div className="mt-4 space-y-2 overflow-y-auto flex-1 pr-1">
          {availableCurrencies.map((item) => {
            const isSelected = currency === item.code;
            const rate = rates[item.code] || 1.0;

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
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer text-left ${
                  isSelected
                    ? 'bg-emerald-50/80 border-emerald-500 shadow-xs'
                    : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.flag}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{item.code}</span>
                      <span className="text-xs text-slate-500 font-medium">{item.name}</span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Symbol: {item.symbol} &bull; 1 USD = {rate.toFixed(rate > 10 ? 2 : 4)} {item.code}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-800">{item.symbol}</span>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                      isSelected
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>Transactions are safely stored in base USD.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-colors cursor-pointer text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
