import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export function EmployeeCard() {
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchEmployees() {
            try {
                const res = await fetch('/api/employees');
                if (res.ok) {
                    const data = await res.json();
                    setEmployees(data.employees.slice(0, 3)); // Show top 3
                }
            } catch (error) {
                console.error("Failed to load employees", error);
            } finally {
                setLoading(false);
            }
        }
        fetchEmployees();
    }, []);

    if (loading) {
        return (
            <div className="bg-white dark:bg-[#242424] rounded-2xl border border-gray-100 dark:border-white/[0.08] p-5 h-full flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-white/30" />
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-[#242424] rounded-2xl border border-gray-100 dark:border-white/[0.08] p-5 h-full">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[15px] text-gray-900 dark:text-white/90">Employee</h3>
                <Link
                    href="/employee"
                    className="text-xs text-gray-500 dark:text-white/50 border border-gray-200 dark:border-white/[0.08] rounded-xl px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors"
                >
                    See Details
                </Link>
            </div>
            {/* Table header */}
            <div className="grid grid-cols-3 text-[11px] text-gray-400 dark:text-white/40 font-medium mb-3 px-1">
                <span>Employee Name</span>
                <span className="text-center">Department</span>
                <span className="text-end">Job Title</span>
            </div>
            <div className="space-y-3">
                {employees.map((emp) => {
                    const initials = emp.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
                    const color = emp.avatar || "bg-blue-500/20 text-blue-400";

                    return (
                        <div key={emp.id} className="grid grid-cols-3 items-center px-1">
                            <div className="flex items-center gap-2.5">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0 ${color}`}>
                                    {initials}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white/90 truncate">{emp.name}</p>
                                    <p className="text-[11px] text-gray-400 dark:text-white/40 truncate">{emp.email}</p>
                                </div>
                            </div>
                            <div className="flex justify-center">
                                <span className="text-[11px] font-medium rounded-full px-3 py-1 truncate bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-white/60">
                                    {emp.department}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-white/50 text-end truncate">{emp.role}</p>
                        </div>
                    )
                })}
                {employees.length === 0 && <p className="text-center text-sm text-gray-400 dark:text-white/30">No employees found.</p>}
            </div>
        </div>
    );
}
