import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtext: string;
  icon: LucideIcon;
  trend?: string;
  trendPositive?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  trend,
  trendPositive,
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        <div className="w-9 h-9 rounded-xl bg-slate-50 text-emerald-600 flex items-center justify-center border border-slate-100">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-2xl font-bold tracking-tight text-slate-900">{value}</h3>
        <div className="mt-1 flex items-center gap-2">
          {trend && (
            <span
              className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                trendPositive ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'
              }`}
            >
              {trend}
            </span>
          )}
          <span className="text-xs text-slate-500">{subtext}</span>
        </div>
      </div>
    </div>
  );
};
