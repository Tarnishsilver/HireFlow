import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export function LeaveRequestCard() {
    const [leave, setLeave] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPendingLeave() {
            try {
                const res = await fetch('/api/leaves');
                if (res.ok) {
                    const data = await res.json();
                    // Find first pending leave
                    const pending = data.leaves.find((l: any) => l.status === 'Pending');
                    if (pending) {
                        setLeave(pending);
                    }
                }
            } catch (error) {
                console.error("Failed to load leave request", error);
            } finally {
                setLoading(false);
            }
        }
        fetchPendingLeave();
    }, []);

    if (loading) {
        return (
            <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border p-5 shadow-sm h-full flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
        );
    }

    if (!leave) {
        return (
            <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border p-5 shadow-sm h-full flex flex-col items-center justify-center text-center">
                <p className="text-sm text-gray-500">No pending requests</p>
            </div>
        );
    }

    const initials = leave.employeeName?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

    return (
        <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border p-5 shadow-sm h-full">
            <div className="flex items-center gap-2 mb-3">
                <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300 text-[11px] font-medium rounded-full px-3 py-1">
                    {leave.type}
                </span>
                <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-[11px] font-medium rounded-full px-3 py-1">
                    Pending
                </span>
            </div>
            <div className="flex items-center gap-3 mb-4">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${leave.avatarColor || "bg-purple-100 text-purple-600"}`}>
                    {initials}
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-foreground truncate">{leave.employeeName}</p>
                    <p className="text-[11px] text-gray-400">Leave for {leave.days} day(s)</p>
                </div>
            </div>
            <div className="flex gap-3 mb-4">
                <button className="flex-1 text-xs font-medium text-green-600 dark:text-green-300 border border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-lg py-2 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                    Approve
                </button>
                <button className="flex-1 text-xs font-medium text-red-500 dark:text-red-300 border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-lg py-2 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                    Reject
                </button>
            </div>
            <div className="grid grid-cols-2 text-xs">
                <div>
                    <p className="text-gray-400 mb-0.5">Leave Dates:</p>
                    <p className="font-medium text-gray-900 dark:text-foreground truncate">{leave.dates}</p>
                </div>
            </div>
        </div>
    );
}
