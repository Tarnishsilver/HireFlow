import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export function AnnualLeaveCard() {
    const [leaves, setLeaves] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchLeaves() {
            try {
                const res = await fetch('/api/leaves');
                if (res.ok) {
                    const data = await res.json();
                    if (data.leaves && data.leaves.length > 0) {
                        setLeaves(data.leaves.slice(0, 3)); // Show top 3
                    } else {
                        // Fallback
                        setLeaves([
                            {
                                employeeName: "Lisa Harvey",
                                type: "Annual Leave",
                                dates: "Jan 12, 2024",
                                days: 1,
                                avatarColor: "bg-teal-100 text-teal-600"
                            },
                            {
                                employeeName: "Leslie Alexander",
                                type: "Annual Leave",
                                dates: "Jan 12, 2024",
                                days: 2,
                                avatarColor: "bg-indigo-100 text-indigo-600"
                            }
                        ]);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch leaves", error);
            } finally {
                setLoading(false);
            }
        }
        fetchLeaves();
    }, []);

    if (loading) {
        return (
            <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border p-5 shadow-sm min-h-[200px] flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border p-5 shadow-sm h-full flex flex-col gap-4">
            <h3 className="font-semibold text-[15px] text-gray-900 dark:text-foreground mb-1">On Leave Today</h3>

            {leaves.length === 0 && (
                <p className="text-sm text-gray-400">No one is on leave today.</p>
            )}

            {leaves.map((leave, index) => {
                const initials = leave.employeeName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
                return (
                    <div key={index} className={`flex items-start gap-3 ${index > 0 ? "border-t border-gray-100 dark:border-border pt-4" : ""}`}>
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${leave.avatarColor || "bg-gray-100 text-gray-600"}`}>
                            {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <p className="text-sm font-semibold text-gray-900 dark:text-foreground truncate">{leave.employeeName}</p>
                                <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-[10px] font-medium rounded-full px-2 py-0.5 whitespace-nowrap">
                                    {leave.type}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-gray-400">
                                <span>{leave.dates}</span>
                                <span>{leave.days} day(s)</span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
