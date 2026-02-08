import React from 'react';
import { DollarSign, Users, Clock, AlertCircle } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string;
    subValue: string;
    icon: React.ReactNode;
    trend?: string;
    color: 'blue' | 'green' | 'yellow' | 'red';
}

const StatCard = ({ title, value, subValue, icon, trend, color }: StatCardProps) => {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
        green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
        yellow: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
        red: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
    };

    return (
        <div className="bg-white dark:bg-card rounded-xl border border-slate-200 dark:border-border p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
                    {icon}
                </div>
                {trend && (
                    <span className="text-xs font-medium bg-slate-100 dark:bg-muted text-slate-600 dark:text-muted-foreground px-2 py-1 rounded-full">
                        {trend}
                    </span>
                )}
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500 dark:text-muted-foreground mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-foreground mb-1">{value}</h3>
                <p className="text-xs text-slate-400 dark:text-muted-foreground/80">{subValue}</p>
            </div>
        </div>
    );
};

export const PayrollStats = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
                title="Total Payroll"
                value="₹ 45,23,000"
                subValue="For February 2026"
                icon={<DollarSign className="w-6 h-6" />}
                trend="+12%"
                color="blue"
            />
            <StatCard
                title="Employees Paid"
                value="124 / 142"
                subValue="18 Pending"
                icon={<Users className="w-6 h-6" />}
                color="green"
            />
            <StatCard
                title="Pending Payments"
                value="₹ 5,42,000"
                subValue="Due by 10th Feb"
                icon={<Clock className="w-6 h-6" />}
                color="yellow"
            />
            <StatCard
                title="Deductions"
                value="₹ 1,28,400"
                subValue="Tax & PF"
                icon={<AlertCircle className="w-6 h-6" />}
                color="red"
            />
        </div>
    );
};
