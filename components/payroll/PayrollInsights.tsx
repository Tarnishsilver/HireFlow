import React from 'react';
import { Sparkles, TrendingUp, AlertTriangle } from 'lucide-react';

export const PayrollInsights = () => {
    return (
        <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/10 dark:to-card rounded-xl border border-indigo-100 dark:border-border p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-semibold text-slate-800 dark:text-foreground">AI Insights</h3>
            </div>

            <div className="space-y-4">
                <div className="p-3 bg-white dark:bg-card rounded-lg border border-slate-100 dark:border-border shadow-sm flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                            Payroll increased by <strong className="text-slate-900 dark:text-foreground">12%</strong> this month compared to average, largely due to overtime in the Engineering team.
                        </p>
                    </div>
                </div>

                <div className="p-3 bg-white dark:bg-card rounded-lg border border-slate-100 dark:border-border shadow-sm flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                            <strong className="text-slate-900 dark:text-foreground">3 Employees</strong> have pending leave approvals that might affect their final settlement. Check the <span className="text-indigo-600 dark:text-indigo-400 font-medium cursor-pointer">Leave Requests</span> module.
                        </p>
                    </div>
                </div>

                <div className="p-3 bg-white dark:bg-card rounded-lg border border-slate-100 dark:border-border shadow-sm flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold shrink-0">i</div>
                    <div>
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                            Design department has the highest average salary this month at <strong className="text-slate-900 dark:text-foreground">₹ 1.8L</strong>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
