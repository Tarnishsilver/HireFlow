'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { PayrollStats } from '@/components/payroll/PayrollStats';
import { PayrollTable } from '@/components/payroll/PayrollTable';
import { PayrollInsights } from '@/components/payroll/PayrollInsights';
import { PayslipModal } from '@/components/payroll/PayslipModal';
import { ChevronLeft, ChevronRight, PlayCircle, Loader2 } from 'lucide-react';

export default function PayrollPage() {
    const { user, signOut } = useAuth();
    const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
    const [isPayslipOpen, setIsPayslipOpen] = useState(false);
    const [isRunningPayroll, setIsRunningPayroll] = useState(false);

    const handleViewPayslip = (employee: any) => {
        setSelectedEmployee(employee);
        setIsPayslipOpen(true);
    };

    const handleRunPayroll = () => {
        setIsRunningPayroll(true);
        // Mock processing
        setTimeout(() => {
            setIsRunningPayroll(false);
            alert('Payroll run initiated successfully!');
        }, 2000);
    };

    return (
        <MainLayout user={user} onSignIn={() => { }} onSignOut={signOut}>
            <div className="min-h-screen bg-slate-50 dark:bg-background">
                <main className="max-w-[1920px] mx-auto px-6 py-8">

                    {/* Page Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-foreground">Payroll Management</h1>
                            <p className="text-slate-500 dark:text-muted-foreground">Manage ongoing payrolls, view history and reports.</p>
                        </div>

                        <div className="flex items-center gap-4 bg-white dark:bg-card p-1.5 rounded-xl border border-slate-200 dark:border-border shadow-sm">
                            <button className="p-1 hover:bg-slate-100 dark:hover:bg-muted rounded-lg transition-colors">
                                <ChevronLeft className="w-5 h-5 text-slate-500" />
                            </button>
                            <span className="font-semibold text-slate-900 dark:text-foreground px-2">February 2026</span>
                            <button className="p-1 hover:bg-slate-100 dark:hover:bg-muted rounded-lg transition-colors">
                                <ChevronRight className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        <button
                            onClick={handleRunPayroll}
                            disabled={isRunningPayroll}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none hover:shadow-indigo-300 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isRunningPayroll ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <PlayCircle className="w-5 h-5" />
                            )}
                            {isRunningPayroll ? 'Processing...' : 'Run Payroll'}
                        </button>
                    </div>

                    {/* Stats Row */}
                    <PayrollStats />

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                        {/* Table Section */}
                        <div className="xl:col-span-3">
                            <div className="bg-white dark:bg-card rounded-xl border border-slate-200 dark:border-border p-5 mb-6 flex items-center justify-between shadow-sm">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-foreground">Employee Payroll List</h2>
                                <div className="flex gap-2">
                                    <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">Download Report</button>
                                </div>
                            </div>
                            <PayrollTable onViewPayslip={handleViewPayslip} />
                        </div>

                        {/* Sidebar / Insights */}
                        <div className="space-y-6">
                            <PayrollInsights />

                            {/* Approval Workflow Widget */}
                            <div className="bg-white dark:bg-card rounded-xl border border-slate-200 dark:border-border p-6 shadow-sm">
                                <h3 className="font-semibold text-slate-800 dark:text-foreground mb-4">Approval Workflow</h3>
                                <div className="relative pl-4 border-l-2 border-slate-100 dark:border-border space-y-6">
                                    <div className="relative">
                                        <span className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-green-500 ring-4 ring-white dark:ring-card"></span>
                                        <p className="text-sm font-medium text-slate-900 dark:text-foreground">Draft Created</p>
                                        <p className="text-xs text-slate-500">Feb 01, 2026 • 10:00 AM</p>
                                    </div>
                                    <div className="relative">
                                        <span className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-green-500 ring-4 ring-white dark:ring-card"></span>
                                        <p className="text-sm font-medium text-slate-900 dark:text-foreground">HR Approved</p>
                                        <p className="text-xs text-slate-500">Feb 02, 2026 • 02:30 PM</p>
                                    </div>
                                    <div className="relative">
                                        <span className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-amber-400 ring-4 ring-white dark:ring-card animate-pulse"></span>
                                        <p className="text-sm font-medium text-slate-900 dark:text-foreground">Finance Review</p>
                                        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">In Progress</p>
                                    </div>
                                    <div className="relative opacity-50">
                                        <span className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700 ring-4 ring-white dark:ring-card"></span>
                                        <p className="text-sm font-medium text-slate-900 dark:text-foreground">Payment Processing</p>
                                        <p className="text-xs text-slate-500">Pending</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Modals */}
            <PayslipModal
                isOpen={isPayslipOpen}
                onClose={() => setIsPayslipOpen(false)}
                employee={selectedEmployee}
            />
        </MainLayout>
    );
}
