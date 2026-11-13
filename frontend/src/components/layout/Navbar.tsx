import React from 'react';
import { Sparkles, Wallet, Activity } from 'lucide-react';

interface NavbarProps {
  backendStatus: string;
}

export const Navbar: React.FC<NavbarProps> = ({ backendStatus }) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-slate-900">SpendWise</span>
                <span className="text-xl font-bold text-emerald-600">AI</span>
                <span className="ml-1.5 px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                  Student Edition
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Intelligent College Expense Management</p>
            </div>
          </div>

          {/* Center Navigation placeholder */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#dashboard" className="text-sm font-semibold text-emerald-700 border-b-2 border-emerald-600 pb-1">
              Overview
            </a>
            <a href="#expenses" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Expenses
            </a>
            <a href="#analytics" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Analytics
            </a>
            <a href="#advisor" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              AI Advisor
            </a>
          </nav>

          {/* Right Status Badge & Student Profile */}
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                backendStatus === 'healthy'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Backend: {backendStatus}</span>
            </div>

            <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-semibold text-xs">
              JD
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
