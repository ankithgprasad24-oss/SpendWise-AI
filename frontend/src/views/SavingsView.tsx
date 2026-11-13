import React from 'react';
import {
  PiggyBank,
  Plus,
  Target,
  Calendar,
  Trash2,
  Award,
  Wallet,
} from 'lucide-react';
import type { SavingsGoal } from '../types';
import { useCurrency } from '../context/CurrencyContext';

interface SavingsViewProps {
  savingsGoals: SavingsGoal[];
  onOpenAddGoal: () => void;
  onOpenDeposit: (goal: SavingsGoal) => void;
  onDeleteGoal: (id: number) => void;
}

export const SavingsView: React.FC<SavingsViewProps> = ({
  savingsGoals,
  onOpenAddGoal,
  onOpenDeposit,
  onDeleteGoal,
}) => {
  const { format, currencyInfo } = useCurrency();
  const totalSaved = savingsGoals.reduce((sum, g) => sum + g.current_amount, 0);
  const totalTarget = savingsGoals.reduce((sum, g) => sum + g.target_amount, 0);
  const overallProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;
  const completedGoalsCount = savingsGoals.filter((g) => g.is_completed).length;

  return (
    <div className="space-y-7 animate-in fade-in duration-150">
      {/* Header & Global Progress */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">College Milestone Savings</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Build emergency cushions, save for upcoming semesters, textbooks, and graduation goals in {currencyInfo.code}.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenAddGoal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Goal</span>
          </button>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-6 space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-slate-600">
              Total Milestones Funded ({overallProgress}%) &bull; {completedGoalsCount} Goals Completed
            </span>
            <span className="text-slate-900 font-bold">
              {format(totalSaved)} / {format(totalTarget)} Target Pool
            </span>
          </div>

          <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-600 transition-all duration-500"
              style={{ width: `${Math.min(100, overallProgress)}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[11px] text-slate-400">
            <span>Remaining to hit all milestones: {format(Math.max(0, totalTarget - totalSaved))}</span>
            <span>Disciplined saving buffers student loan stress</span>
          </div>
        </div>
      </div>

      {/* Goals Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {savingsGoals.map((goal) => {
          const isDone = goal.is_completed || goal.current_amount >= goal.target_amount;

          return (
            <div
              key={goal.id}
              className={`bg-white rounded-3xl p-6 border shadow-xs flex flex-col justify-between transition-all ${
                isDone ? 'border-emerald-300 bg-emerald-50/20' : 'border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isDone ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-emerald-700'
                      }`}
                    >
                      {isDone ? <Award className="w-5 h-5" /> : <Target className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{goal.name}</h4>
                      {goal.target_date && (
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          <span>Deadline: {goal.target_date}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeleteGoal(goal.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Delete goal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-5 space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-2xl font-extrabold text-slate-900">
                      {format(goal.current_amount)}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      Goal: {format(goal.target_amount)}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isDone ? 'bg-emerald-600' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, goal.progress_percentage)}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[11px] pt-1">
                    <span className="text-slate-600 font-semibold">
                      {goal.progress_percentage}% funded
                    </span>
                    <span className="text-slate-500">
                      {isDone ? (
                        <strong className="text-emerald-700">Goal Reached! 🎉</strong>
                      ) : (
                        `${format(goal.remaining_amount)} left to reach`
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Deposit Action */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => onOpenDeposit(goal)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>Deposit Funds</span>
                </button>
              </div>
            </div>
          );
        })}

        {savingsGoals.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-200/80 shadow-xs">
            <PiggyBank className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-800">No savings goals set yet</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Setting small savings milestones helps students manage unexpected expenses and avoid high-interest credit debt.
            </p>
            <button
              type="button"
              onClick={onOpenAddGoal}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors cursor-pointer"
            >
              + Create First Savings Goal
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
