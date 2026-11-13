import React, { useState } from 'react';
import {
  Brain,
  Sparkles,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  RefreshCw,
  Award,
  Calculator,
  PiggyBank,
} from 'lucide-react';
import type { AIInsightItem, FinancialOverview, ViewType } from '../types';
import { useCurrency } from '../context/CurrencyContext';

interface AiInsightsViewProps {
  insights: AIInsightItem[];
  overview: FinancialOverview | null;
  onRefresh: () => Promise<void>;
  onNavigate: (view: ViewType) => void;
}

export const AiInsightsView: React.FC<AiInsightsViewProps> = ({
  insights,
  overview,
  onRefresh,
  onNavigate,
}) => {
  const { format, currencyInfo, localizeText } = useCurrency();
  const [activeTab, setActiveTab] = useState<'all' | 'tip' | 'warning' | 'budget' | 'achievement'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const filtered = insights.filter((item) => {
    if (activeTab === 'all') return true;
    return item.category === activeTab;
  });

  // Calculate potential savings strictly from realistic, actionable recurring savings items
  // Never count existing savings balance / emergency fund ($580) as newly generated savings!
  const actionableMonthlySavings = insights
    .filter((item) => item.is_potential_saving && item.impact_amount)
    .reduce((sum, item) => sum + (item.impact_amount || 0), 0);

  const existingSavingsBuffer = overview?.monthly_savings || 0;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'tip':
        return <Lightbulb className="w-5 h-5 text-emerald-600" />;
      case 'achievement':
        return <Award className="w-5 h-5 text-sky-600" />;
      case 'budget':
      default:
        return <TrendingDown className="w-5 h-5 text-purple-600" />;
    }
  };

  const getPriorityBadge = (priority?: string) => {
    switch (priority) {
      case 'high':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800">High Priority</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800">Medium</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">Advisory</span>;
    }
  };

  return (
    <div className="space-y-7 animate-in fade-in duration-150">
      {/* AI Intelligence Header Hero */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  SpendWise AI Student Advisor
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Zero-Cost Engine Active
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                Personalized financial coaching in {currencyInfo.code} based on verified transaction frequency. Analyzes real ledger records, avoids double-counting, and separates existing savings reserves from actionable monthly reductions.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-semibold text-xs shadow-xs transition-colors disabled:opacity-50 shrink-0 self-end md:self-auto cursor-pointer disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Re-analyzing...' : 'Re-Run AI Analysis'}</span>
          </button>
        </div>

        {/* Highlights Row: Clearly separating Potential New Savings from Existing Savings Buffer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
              Actionable Monthly Savings
            </span>
            <p className="text-2xl font-extrabold text-emerald-950 mt-1">
              ~{format(actionableMonthlySavings)}/mo
            </p>
            <span className="text-[11px] text-emerald-700 mt-0.5 block">
              Realistic micro-adjustments only
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-sky-800 uppercase tracking-wider">
                Existing Savings Buffer
              </span>
              <PiggyBank className="w-4 h-4 text-sky-600" />
            </div>
            <p className="text-2xl font-extrabold text-sky-950 mt-1">
              {format(existingSavingsBuffer)}
            </p>
            <span className="text-[11px] text-sky-700 mt-0.5 block">
              Accumulated milestone balance (not new)
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Discipline Health Score
            </span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {overview?.student_financial_health_score || 90} / 100
            </p>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              Allowance pacing evaluation
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              AI Engine Mode
            </span>
            <p className="text-base font-bold text-slate-900 mt-1">
              Deterministic + Modular
            </p>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              100% offline, privacy-safe & zero billing
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: `All Insights (${insights.length})` },
          { id: 'tip', label: 'Savings Tips' },
          { id: 'warning', label: 'Warnings & Spikes' },
          { id: 'budget', label: 'Budget Caps' },
          { id: 'achievement', label: 'Milestones & Wins' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Insights Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{localizeText(item.title)}</h3>
                    <span className="text-[10px] text-slate-400 capitalize font-medium">
                      Category: {item.category}
                    </span>
                  </div>
                </div>

                <div className="shrink-0">{getPriorityBadge(item.priority)}</div>
              </div>

              <p className="mt-4 text-xs text-slate-600 leading-relaxed font-normal">
                {localizeText(item.summary)}
              </p>

              {/* Action Item Box */}
              <div className="mt-4 p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100/90 text-xs">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                  Recommended Action
                </span>
                <p className="text-emerald-950 font-medium leading-relaxed">{localizeText(item.action_item)}</p>
              </div>

              {/* Transparent Calculation Basis if available */}
              {item.calculation_basis && (
                <div className="mt-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-[11px] text-slate-600 flex items-start gap-2">
                  <Calculator className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-700 block">Calculation Basis:</span>
                    <span>{localizeText(item.calculation_basis)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Impact Footer */}
            <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
              {item.impact_amount && item.is_potential_saving ? (
                <span className="text-emerald-700 font-bold">
                  Potential Monthly Saving: +{format(item.impact_amount)}
                </span>
              ) : item.impact_amount && !item.is_potential_saving ? (
                <span className="text-sky-700 font-bold">
                  Current Milestone Balance: {format(item.impact_amount)}
                </span>
              ) : (
                <span className="text-slate-400 font-medium">Long-term discipline boost</span>
              )}

              <button
                type="button"
                onClick={() => onNavigate('budgets')}
                className="text-slate-500 hover:text-emerald-700 font-semibold flex items-center gap-1 text-[11px] cursor-pointer"
              >
                <span>Adjust Limits</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-800">No insights in this category</h4>
          <p className="text-xs text-slate-400 mt-1">Select "All Insights" to view all active recommendations.</p>
        </div>
      )}
    </div>
  );
};
