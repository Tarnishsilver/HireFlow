import { ChevronDown, Plus } from "lucide-react";

interface Event {
    id: string;
    title: string;
    start: string;
    end: string;
    location?: string;
    description?: string;
}

interface TodayScheduleCardProps {
    events?: Event[];
    onAddEvent?: () => void;
}

export function TodayScheduleCard({ events = [], onAddEvent }: TodayScheduleCardProps) {
    // Filter for today's events if needed, or assume passed events are relevant
    // For visual consistency with the clone, we'll slice to fit the height or scroll
    const displayEvents = events.slice(0, 5);
    const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return (
        <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border p-5 shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[15px] text-gray-900 dark:text-foreground">Today Schedule</h3>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-muted-foreground border border-gray-200 dark:border-border rounded-lg px-2.5 py-1.5">
                        {todayStr}
                        <ChevronDown className="w-3 h-3" />
                    </div>
                    <button
                        onClick={onAddEvent}
                        className="text-xs text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg px-3 py-1.5 font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors flex items-center gap-1"
                    >
                        <Plus className="w-3 h-3" />
                        Add Task
                    </button>
                </div>
            </div>

            {/* Timeline Header */}
            <div className="relative flex-1">
                <div className="flex items-center text-[11px] text-gray-400 mb-3 border-b border-gray-100 dark:border-border/50 pb-2">
                    <span className="flex-1">Time</span>
                    <span className="flex-[3]">Event</span>
                </div>

                {/* Events List */}
                <div className="space-y-2 overflow-y-auto max-h-[300px] pr-1 custom-scrollbar">
                    {displayEvents.length > 0 ? (
                        displayEvents.map((event, index) => {
                            const startDate = new Date(event.start);
                            const timeStr = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            // Randomize colors for visual variety if not defined
                            const colors = [
                                "bg-green-100 dark:bg-green-900/20 border-green-500 text-green-800 dark:text-green-300",
                                "bg-yellow-100 dark:bg-yellow-900/20 border-yellow-500 text-yellow-800 dark:text-yellow-300",
                                "bg-purple-100 dark:bg-purple-900/20 border-purple-500 text-purple-800 dark:text-purple-300",
                                "bg-blue-100 dark:bg-blue-900/20 border-blue-500 text-blue-800 dark:text-blue-300"
                            ];
                            const colorClass = colors[index % colors.length];

                            return (
                                <div key={index} className="flex items-center gap-3">
                                    <span className="text-[11px] text-gray-400 w-[60px] shrink-0">{timeStr}</span>
                                    <div className={`flex-1 h-9 rounded-lg border-l-[3px] flex items-center px-3 hover:scale-[1.02] transition-transform cursor-pointer ${colorClass}`}>
                                        <span className="text-[11px] font-medium truncate">{event.title}</span>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-8 text-xs text-gray-400">
                            No events scheduled for today.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
