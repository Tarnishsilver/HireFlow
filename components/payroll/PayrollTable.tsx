import React, { useState } from 'react';
import { Search, Filter, MoreVertical, Download, Eye, Edit2 } from 'lucide-react';

interface Employee {
    id: string;
    name: string;
    role: string;
    department: string;
    avatar: string;
    grossPay: string;
    deductions: string;
    netPay: string;
    status: 'Paid' | 'Pending' | 'Failed';
}

const mockEmployees: Employee[] = [
    {
        id: '1',
        name: 'Sarah Chen',
        role: 'Senior Product Designer',
        department: 'Design',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
        grossPay: '₹ 1,80,000',
        deductions: '₹ 15,000',
        netPay: '₹ 1,65,000',
        status: 'Paid',
    },
    {
        id: '2',
        name: 'Michael Ross',
        role: 'Frontend Developer',
        department: 'Engineering',
        avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=150',
        grossPay: '₹ 1,50,000',
        deductions: '₹ 12,000',
        netPay: '₹ 1,38,000',
        status: 'Pending',
    },
    {
        id: '3',
        name: 'Emma Wilson',
        role: 'Marketing Manager',
        department: 'Marketing',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150',
        grossPay: '₹ 1,40,000',
        deductions: '₹ 10,000',
        netPay: '₹ 1,30,000',
        status: 'Paid',
    },
    {
        id: '4',
        name: 'James Rodriguez',
        role: 'DevOps Engineer',
        department: 'Engineering',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
        grossPay: '₹ 1,75,000',
        deductions: '₹ 14,500',
        netPay: '₹ 1,60,500',
        status: 'Failed',
    },
    {
        id: '5',
        name: 'Priya Patel',
        role: 'HR Manager',
        department: 'Human Resources',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
        grossPay: '₹ 1,30,000',
        deductions: '₹ 8,000',
        netPay: '₹ 1,22,000',
        status: 'Paid',
    },
];

export const PayrollTable = ({ onViewPayslip }: { onViewPayslip: (employee: any) => void }) => {
    const [filterStatus, setFilterStatus] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredEmployees = mockEmployees.filter(emp => {
        const matchesStatus = filterStatus === 'All' || emp.status === filterStatus;
        const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.department.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    return (
        <div className="bg-white dark:bg-card rounded-xl border border-slate-200 dark:border-border shadow-sm overflow-hidden">
            {/* Header / Filters */}
            <div className="p-5 border-b border-slate-200 dark:border-border flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/50 dark:bg-muted/10">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search employee or department..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white dark:bg-background border border-slate-200 dark:border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <span className="text-xs font-medium text-slate-500 dark:text-muted-foreground uppercase tracking-wide">Filter by:</span>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-2 bg-white dark:bg-background border border-slate-200 dark:border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                    >
                        <option value="All">All Status</option>
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                        <option value="Failed">Failed</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-muted/30 border-b border-slate-200 dark:border-border">
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-muted-foreground uppercase tracking-wider">Employee</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-muted-foreground uppercase tracking-wider">Department</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-muted-foreground uppercase tracking-wider text-right">Gross Pay</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-muted-foreground uppercase tracking-wider text-right">Deductions</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-muted-foreground uppercase tracking-wider text-right">Net Pay</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-muted-foreground uppercase tracking-wider text-center">Status</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-border/50">
                        {filteredEmployees.map((emp) => (
                            <tr
                                key={emp.id}
                                className="group hover:bg-slate-50 dark:hover:bg-muted/30 transition-colors"
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <img src={emp.avatar} alt={emp.name} className="w-9 h-9 rounded-full object-cover border border-slate-100 dark:border-border" />
                                        <div>
                                            <p className="font-medium text-sm text-slate-900 dark:text-foreground">{emp.name}</p>
                                            <p className="text-xs text-slate-500 dark:text-muted-foreground">{emp.role}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-muted-foreground">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-muted text-slate-800 dark:text-foreground">
                                        {emp.department}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-foreground text-right">{emp.grossPay}</td>
                                <td className="px-6 py-4 text-sm text-red-500 dark:text-red-400 text-right">-{emp.deductions}</td>
                                <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-foreground text-right">{emp.netPay}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`
                                        inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                                        ${emp.status === 'Paid' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                                            emp.status === 'Pending' ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' :
                                                'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'}
                                    `}>
                                        {emp.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => onViewPayslip(emp)}
                                            className="p-1.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-muted rounded-md transition-colors"
                                            title="View Payslip"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button className="p-1.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-muted rounded-md transition-colors">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button className="p-1.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-muted rounded-md transition-colors">
                                            <Download className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredEmployees.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500 dark:text-muted-foreground">
                        <Search className="w-10 h-10 mb-3 opacity-20" />
                        <p className="text-sm font-medium">No employees found matching your search.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
