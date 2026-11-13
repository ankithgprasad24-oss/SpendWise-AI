import React from 'react';
import { ShieldCheck } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import type {
  FinancialOverview,
  CategoryBreakdownItem,
  MonthlyTrendItem,
  DailySpendingItem,
} from '../types';
import { useCurrency } from '../context/CurrencyContext';

interface AnalyticsViewProps {
  overview: FinancialOverview | null;
  categoryBreakdown: CategoryBreakdownItem[];
  monthlyTrends: MonthlyTrendItem[];
  dailySpending: DailySpendingItem[];
}

const PALETTE = [
  '#059669', // Emerald
  '#0284c7', // Sky
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#10b981', // Mint
  '#f97316', // Orange
  '#64748b', // Slate
];

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  overview,
  categoryBreakdown,
  monthlyTrends,
  dailySpending,
}) => {
  const { currencyInfo, format, fromUSD } = useCurrency();

  const pieData = categoryBreakdown.map((item) => ({
    name: item.category,
    value: fromUSD(item.spent),
    rawSpent: item.spent,
  }));

  const convertedDailySpending = dailySpending.map((d) => ({
    ...d,
    displayAmount: fromUSD(d.amount),
  }));

  const convertedMonthlyTrends = monthlyTrends.map((m) => ({
    ...m,
    displaySpent: fromUSD(m.spent),
    displayBudget: fromUSD(m.budget),
  }));

  const totalSpent = overview?.total_spent || 0;
  const averagePerTransaction =
    overview && overview.total_expenses_count > 0
      ? totalSpent / overview.total_expenses_count
      : 0;

  const formatChartVal = (val: number | string) =>
    `${currencyInfo.symbol}${Number(val).toLocaleString(undefined, {
      minimumFractionDigits: currencyInfo.decimals,
      maximumFractionDigits: currencyInfo.decimals,
    })}`;

  return (
    <div className="space-y-7 animate-in fade-in duration-150">
      {/* Analytics Summary Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Spending Intelligence & Analytics</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pandas-aggregated metrics covering transaction volume, category concentration, and daily run-rate in {currencyInfo.code}.
            </p>
          </div>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-full border border-emerald-200 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Health Score: {overview?.student_financial_health_score || 90}/100</span>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Volume
            </span>
            <p className="text-xl font-extrabold text-slate-900 mt-1">{format(totalSpent)}</p>
            <span className="text-[10px] text-slate-500 mt-0.5 block">Across current period</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Transactions
            </span>
            <p className="text-xl font-extrabold text-slate-900 mt-1">
              {overview?.total_expenses_count || 0}
            </p>
            <span className="text-[10px] text-slate-500 mt-0.5 block">Recorded items</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Avg / Purchase
            </span>
            <p className="text-xl font-extrabold text-slate-900 mt-1">{format(averagePerTransaction)}</p>
            <span className="text-[10px] text-slate-500 mt-0.5 block">Per ticket average</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Top Category
            </span>
            <p className="text-xl font-extrabold text-emerald-700 mt-1 truncate">
              {overview?.top_category || 'None'}
            </p>
            <span className="text-[10px] text-slate-500 mt-0.5 block">Highest expenditure</span>
          </div>
        </div>
      </div>

      {/* Row 1: Daily Velocity Area Chart & Category Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Spending Velocity Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Daily Spending Run-Rate</h3>
              <p className="text-xs text-slate-500">Expenditure velocity in {currencyInfo.code} over this month</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
              Daily Pulse
            </span>
          </div>

          <div className="mt-6 h-64 w-full">
            {convertedDailySpending.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={convertedDailySpending} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} tickFormatter={(v) => `${currencyInfo.symbol}${v}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                    }}
                    formatter={(val) => [formatChartVal(Number(val)), 'Spent']}
                  />
                  <Area
                    type="monotone"
                    dataKey="displayAmount"
                    stroke="#059669"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#emeraldGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No daily transactions recorded
              </div>
            )}
          </div>
        </div>

        {/* Category Share Donut */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Category Share</h3>
                <p className="text-xs text-slate-500">Proportional allocation</p>
              </div>
            </div>

            <div className="mt-4 h-52 w-full">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-analytics-${index}`} fill={PALETTE[index % PALETTE.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        fontSize: '12px',
                      }}
                      formatter={(val) => [formatChartVal(Number(val)), 'Spent']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No data
                </div>
              )}
            </div>
          </div>

          <div className="mt-2 space-y-1.5 max-h-32 overflow-y-auto pr-1 text-xs">
            {categoryBreakdown.slice(0, 5).map((cat, idx) => (
              <div key={cat.category} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: PALETTE[idx % PALETTE.length] }}
                  />
                  <span className="text-slate-600 truncate max-w-[130px]">{cat.category}</span>
                </div>
                <span className="font-bold text-slate-900">{cat.percentage_of_total}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Multi-Month Spending Comparison & Detailed Category Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Multi-Month Trends Bar Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Historical Comparison</h3>
            <p className="text-xs text-slate-500">Semester month-over-month trajectory in {currencyInfo.code}</p>
          </div>

          <div className="mt-6 h-64 w-full">
            {convertedMonthlyTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={convertedMonthlyTrends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <XAxis dataKey="month_name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `${currencyInfo.symbol}${v}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                    }}
                    formatter={(val, name) => [
                      formatChartVal(Number(val)),
                      name === `Spent (${currencyInfo.symbol})` ? 'Spent' : 'Budget Cap',
                    ]}
                  />
                  <Bar dataKey="displaySpent" name={`Spent (${currencyInfo.symbol})`} fill="#059669" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="displayBudget" name={`Budget Cap (${currencyInfo.symbol})`} fill="#cbd5e1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No trend data
              </div>
            )}
          </div>
        </div>

        {/* Detailed Category Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Category Spending Distribution</h3>
            <p className="text-xs text-slate-500">Comprehensive breakdown with transaction counts and budget caps in {currencyInfo.code}</p>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">Transactions</th>
                  <th className="py-2.5 px-3 text-right">Spent</th>
                  <th className="py-2.5 px-3 text-right">Budget Cap</th>
                  <th className="py-2.5 px-3 text-right">Share</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categoryBreakdown.map((item) => (
                  <tr key={item.category} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-800">{item.category}</td>
                    <td className="py-3 px-3 text-right text-slate-500">{item.transaction_count}</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">
                      {format(item.spent)}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-500">
                      {item.limit > 0 ? format(item.limit) : 'None'}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-600 font-medium">
                      {item.percentage_of_total}%
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          item.status === 'exceeded'
                            ? 'bg-rose-100 text-rose-800'
                            : item.status === 'warning'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
