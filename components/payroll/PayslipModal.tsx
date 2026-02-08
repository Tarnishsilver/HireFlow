import React from 'react';
import { X, Download, Printer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PayslipModalProps {
    isOpen: boolean;
    onClose: () => void;
    employee: any;
}

export const PayslipModal = ({ isOpen, onClose, employee }: PayslipModalProps) => {
    if (!employee) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-white dark:bg-card w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 dark:border-border overflow-hidden pointer-events-auto max-h-[90vh] flex flex-col">
                            {/* Header */}
                            <div className="p-6 border-b border-slate-100 dark:border-border flex items-center justify-between bg-slate-50/50 dark:bg-muted/10">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-foreground">Payslip - Feb 2026</h2>
                                    <p className="text-sm text-slate-500 dark:text-muted-foreground">ID: #PAY-2026-002</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 rounded-md transition-colors" title="Print">
                                        <Printer className="w-5 h-5" />
                                    </button>
                                    <button className="p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 rounded-md transition-colors" title="Download PDF">
                                        <Download className="w-5 h-5" />
                                    </button>
                                    <button onClick={onClose} className="p-2 text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 rounded-md transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-8 overflow-y-auto custom-scrollbar">
                                {/* Company Info */}
                                <div className="flex justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                                            <span className="text-white font-bold text-lg">HF</span>
                                        </div>
                                        <div>
                                            <h1 className="font-bold text-xl text-slate-900 dark:text-foreground">HireFlow Inc.</h1>
                                            <p className="text-xs text-slate-500 dark:text-muted-foreground">123 Business Park, Tech City</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-slate-900 dark:text-foreground">Payslip For</p>
                                        <p className="text-sm text-slate-500 dark:text-muted-foreground">February 2026</p>
                                    </div>
                                </div>

                                {/* Employee Info */}
                                <div className="bg-slate-50 dark:bg-muted/20 rounded-xl p-4 mb-8 grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Employee Name</label>
                                        <p className="font-medium text-slate-900 dark:text-foreground">{employee.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Designation</label>
                                        <p className="font-medium text-slate-900 dark:text-foreground">{employee.role}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Department</label>
                                        <p className="font-medium text-slate-900 dark:text-foreground">{employee.department}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Bank Account</label>
                                        <p className="font-medium text-slate-900 dark:text-foreground">**** **** **** 4582</p>
                                    </div>
                                </div>

                                {/* Salary Table */}
                                <div className="grid grid-cols-2 gap-8 mb-8">
                                    {/* Earnings */}
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-foreground mb-4 uppercase tracking-wider border-b pb-2">Earnings</h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-600 dark:text-muted-foreground">Basic Salary</span>
                                                <span className="font-medium text-slate-900 dark:text-foreground">₹ 80,000</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-600 dark:text-muted-foreground">HRA</span>
                                                <span className="font-medium text-slate-900 dark:text-foreground">₹ 40,000</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-600 dark:text-muted-foreground">Special Allowance</span>
                                                <span className="font-medium text-slate-900 dark:text-foreground">₹ 35,000</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-600 dark:text-muted-foreground">Performance Bonus</span>
                                                <span className="font-medium text-slate-900 dark:text-foreground">₹ 25,000</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Deductions */}
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-foreground mb-4 uppercase tracking-wider border-b pb-2">Deductions</h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-600 dark:text-muted-foreground">Provident Fund</span>
                                                <span className="font-medium text-slate-900 dark:text-foreground">₹ 4,800</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-600 dark:text-muted-foreground">Income Tax</span>
                                                <span className="font-medium text-slate-900 dark:text-foreground">₹ 8,200</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-600 dark:text-muted-foreground">Professional Tax</span>
                                                <span className="font-medium text-slate-900 dark:text-foreground">₹ 200</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Total */}
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-6 flex items-center justify-between border border-indigo-100 dark:border-indigo-800">
                                    <div>
                                        <p className="text-sm text-indigo-900 dark:text-indigo-300 font-medium">Net Payable Amount</p>
                                        <p className="text-xs text-indigo-700 dark:text-indigo-400 mt-1">Direct deposit to bank account</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">{employee.netPay}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
