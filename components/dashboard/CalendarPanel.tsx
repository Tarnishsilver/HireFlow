import React from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { CalendarEvent } from '@/lib/summarizer-scrape/calendar';

interface CalendarPanelProps {
    events: CalendarEvent[];
    loading?: boolean;
}

const categoryColors = {
    Interview: 'border-l-blue-500 bg-blue-50/50 dark:bg-blue-900/10',
    Onboarding: 'border-l-purple-500 bg-purple-50/50 dark:bg-purple-900/10',
    'HR Meeting': 'border-l-amber-500 bg-amber-50/50 dark:bg-amber-900/10',
};

export const CalendarPanel = ({ events, loading }: CalendarPanelProps) => {
    if (loading) {
        return (
            <div className="flex flex-col h-full bg-card rounded-xl border border-border animate-pulse">
                <div className="h-16 border-b border-border m-6 bg-muted/50 rounded"></div>
                <div className="flex-1 p-6 space-y-6">
                    <div className="h-40 bg-muted/30 rounded-lg border border-border"></div>
                    <div className="h-40 bg-muted/30 rounded-lg border border-border"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-card rounded-xl border border-border overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <CalendarIcon className="text-primary" size={20} />
                    <h2 className="text-lg font-semibold">HR Calendar</h2>
                </div>
                <div className="flex items-center gap-1">
                    <button className="p-1.5 hover:bg-muted rounded-md transition-colors">
                        <ChevronLeft size={16} />
                    </button>
                    <button className="p-1.5 hover:bg-muted rounded-md transition-colors text-sm font-medium px-3">
                        Today
                    </button>
                    <button className="p-1.5 hover:bg-muted rounded-md transition-colors">
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-tight">Upcoming Events</h3>
                        <button className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
                            <Plus size={14} />
                            Add Event
                        </button>
                    </div>

                    <div className="space-y-3">
                        {events.length === 0 ? (
                            <p className="text-xs text-muted-foreground text-center py-4 italic">No upcoming HR events found.</p>
                        ) : (
                            events.map((event) => (
                                <div key={event.id} className={`p-4 rounded-lg border-l-4 border border-border transition-all hover:shadow-sm group ${categoryColors[event.category]}`}>
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-semibold text-sm leading-none group-hover:text-primary transition-colors">{event.title}</h4>
                                        <span className="text-[10px] font-bold text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                                            {event.category}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary/40"></span>
                                        {event.time}
                                    </p>
                                    <div className="text-[11px] font-medium text-foreground/70">
                                        {event.type}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-tight mb-4">Calendar Glance</h3>
                    <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: 31 }).map((_, i) => {
                            const day = i + 1;
                            const isToday = day === 29;
                            return (
                                <div
                                    key={i}
                                    className={`aspect-square flex items-center justify-center text-[10px] rounded-md border border-border/30 cursor-pointer transition-colors
                    ${isToday ? 'bg-primary text-primary-foreground font-bold shadow-md' : 'hover:bg-muted font-medium'}
                  `}
                                >
                                    {day}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
