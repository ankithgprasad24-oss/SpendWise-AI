import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  UploadCloud,
  PieChart,
  TrendingUp,
  Brain,
  PiggyBank,
  Wallet,
  Activity,
  X,
  Settings as SettingsIcon,
  Globe,
} from 'lucide-react';
import type { ViewType } from '../../types';
import { useCurrency } from '../../context/CurrencyContext';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  backendStatus: string;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenCurrencySettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  backendStatus,
  isOpenMobile,
  onCloseMobile,
  onOpenCurrencySettings,
}) => {
  const { currencyInfo } = useCurrency();

  const navItems: { id: ViewType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'csv-import', label: 'CSV Import', icon: UploadCloud },
    { id: 'budgets', label: 'Budgets', icon: PieChart },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'ai-insights', label: 'AI Advisor', icon: Brain },
    { id: 'savings', label: 'Savings Goals', icon: PiggyBank },
    { id: 'settings', label: 'Preferences', icon: SettingsIcon },
  ];

  const handleSelect = (view: ViewType) => {
    onViewChange(view);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden cursor-pointer"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200/90 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between">
          <div
            onClick={() => handleSelect('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs shadow-emerald-600/30 group-hover:scale-105 transition-transform">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-slate-900 tracking-tight text-base">SpendWise</span>
                <span className="font-extrabold text-emerald-600 text-base">AI</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">Student Edition</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 lg:hidden cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
                {item.id === 'ai-insights' && (
                  <span className="ml-auto px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-100/70 text-emerald-800 rounded-md">
                    AI
                  </span>
                )}
                {item.id === 'settings' && (
                  <span className="ml-auto px-2 py-0.5 text-[10px] font-bold uppercase bg-slate-100 text-slate-700 rounded-md">
                    {currencyInfo.code}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Student Profile & Live Status */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          {/* Backend Status indicator */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-xs">
            <div className="flex items-center gap-2">
              <Activity
                className={`w-3.5 h-3.5 ${
                  backendStatus === 'healthy' ? 'text-emerald-600' : 'text-amber-500 animate-pulse'
                }`}
              />
              <span className="text-slate-600 font-medium">Backend API</span>
            </div>
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                backendStatus === 'healthy'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {backendStatus}
            </span>
          </div>

          {/* Student Profile Card (Clickable to open currency & settings) */}
          <div
            role="button"
            tabIndex={0}
            onClick={onOpenCurrencySettings}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onOpenCurrencySettings();
              }
            }}
            className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
            title="Click to change currency & preferences"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center border border-emerald-200">
                JD
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">Alex Rivera</p>
                <p className="text-[11px] text-slate-400 truncate">
                  Campus '27 &bull; {currencyInfo.flag} {currencyInfo.code}
                </p>
              </div>
            </div>

            <Globe className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
          </div>
        </div>
      </aside>
    </>
  );
};
