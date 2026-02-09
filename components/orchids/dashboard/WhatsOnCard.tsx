import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

type Tab = 'Time Off' | 'Birthday';

export function WhatsOnCard() {
    const [activeTab, setActiveTab] = useState<Tab>('Time Off');
    const [data, setData] = useState<{ birthdays: any[], timeOffEvents: any[] }>({ birthdays: [], timeOffEvents: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch('/api/dashboard/stats');
                if (res.ok) {
                    const stats = await res.json();
                    setData(stats);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    const events = activeTab === 'Time Off' ? data.timeOffEvents : data.birthdays;

    if (loading) {
        return (
            <div className="bg-white dark:bg-[#242424] rounded-2xl border border-gray-100 dark:border-white/[0.08] p-5 h-full flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-white/30" />
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-[#242424] rounded-2xl border border-gray-100 dark:border-white/[0.08] p-5 h-full">
            <h3 className="font-semibold text-[15px] text-gray-900 dark:text-white/90 mb-4">What&apos;s on in {new Date().toLocaleString('default', { month: 'long' })}?</h3>
            {/* Tabs - macOS bubble style */}
            <div className="flex mb-4 bg-gray-100 dark:bg-white/[0.04] rounded-xl p-1">
                <button
                    onClick={() => setActiveTab('Time Off')}
                    className={`flex-1 text-xs font-medium py-2 rounded-lg transition-all ${activeTab === 'Time Off' ? 'bg-white dark:bg-white/[0.12] shadow-sm text-gray-900 dark:text-white' : 'text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white/60'}`}
                >
                    Time Off
                </button>
                <button
                    onClick={() => setActiveTab('Birthday')}
                    className={`flex-1 text-xs font-medium py-2 rounded-lg transition-all ${activeTab === 'Birthday' ? 'bg-white dark:bg-white/[0.12] shadow-sm text-gray-900 dark:text-white' : 'text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white/60'}`}
                >
                    Birthday
                </button>
            </div>
            <div className="space-y-3.5 max-h-[250px] overflow-y-auto custom-scrollbar pr-1">
                {events.length === 0 && <p className="text-sm text-gray-400 dark:text-white/30 text-center py-4">No {activeTab}s this month.</p>}
                {events.map((event, idx) => {
                    const initials = event.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
                    return (
                        <div key={idx} className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${event.avatarColor || "bg-blue-500/20 text-blue-400"}`}>
                                {initials}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex justify-between items-center">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white/90 truncate">{event.name}</p>
                                    <span className="text-[10px] text-gray-400 dark:text-white/40">
                                        {activeTab === 'Birthday' ? `${new Date().toLocaleString('default', { month: 'short' })} ${event.date}` : event.type}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400 dark:text-white/40 truncate">
                                    {event.role}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
