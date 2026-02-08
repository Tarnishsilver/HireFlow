import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export function WhatsOnCard() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchEvents() {
            try {
                const res = await fetch('/api/leaves');
                if (res.ok) {
                    const data = await res.json();
                    if (data.leaves) {
                        // Filter for active leaves or just take the latest
                        setEvents(data.leaves.slice(0, 3).map((l: any) => ({
                            name: l.employeeName,
                            role: l.type, // Using leave type as role for this view or could be job title if we had it
                            type: l.status,
                            avatar: l.employeeName.split(' ')[0][0] + (l.employeeName.split(' ')[1]?.[0] || ''),
                            color: l.avatarColor || "bg-blue-100 text-blue-600"
                        })));
                    }
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetchEvents();
    }, []);

    if (loading) {
        return (
            <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border p-5 shadow-sm h-full flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border p-5 shadow-sm h-full">
            <h3 className="font-semibold text-[15px] text-gray-900 dark:text-foreground mb-4">What&apos;s on in {new Date().toLocaleString('default', { month: 'long' })}?</h3>
            {/* Tabs */}
            <div className="flex mb-4 bg-gray-100 dark:bg-muted rounded-xl p-1">
                <button className="flex-1 text-xs font-medium py-2 rounded-lg bg-white dark:bg-card shadow-sm text-gray-900 dark:text-foreground">
                    Time Off
                </button>
                <button className="flex-1 text-xs font-medium py-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    Birthday
                </button>
            </div>
            <div className="space-y-3.5">
                {events.length === 0 && <p className="text-sm text-gray-400 text-center py-2">No events this month.</p>}
                {events.map((event, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${event.color}`}>
                            {event.avatar}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-foreground truncate">{event.name}</p>
                            <p className="text-xs text-gray-400 truncate">
                                {event.role} · {event.type}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
