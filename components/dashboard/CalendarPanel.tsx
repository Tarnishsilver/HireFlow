'use client';

import React, { useMemo } from 'react';
import { FullScreenCalendar } from '@/components/ui/fullscreen-calendar';
import { CalendarEvent } from '@/lib/summarizer-scrape/calendar';

interface CalendarPanelProps {
    events: CalendarEvent[];
    loading?: boolean;
    onEventClick?: (eventId: string) => void;
    onAddEvent?: () => void;
}

export const CalendarPanel = ({ events, loading, onEventClick, onAddEvent }: CalendarPanelProps) => {
    // Transform Google Calendar events to FullScreenCalendar format
    const calendarData = useMemo(() => {
        const eventsByDay = new Map<string, { day: Date; events: { id: string; name: string; time: string; datetime: string; category?: string }[] }>();

        events.forEach(event => {
            const eventDate = new Date(event.start);
            const dateKey = eventDate.toISOString().split('T')[0];

            if (!eventsByDay.has(dateKey)) {
                eventsByDay.set(dateKey, {
                    day: new Date(dateKey),
                    events: []
                });
            }

            eventsByDay.get(dateKey)!.events.push({
                id: event.id,
                name: event.title,
                time: event.time,
                datetime: event.start,
                category: event.category,
            });
        });

        return Array.from(eventsByDay.values());
    }, [events]);

    if (loading) {
        return (
            <div className="flex flex-col h-full items-center justify-center p-8">
                <div className="h-10 w-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                <p className="mt-4 text-sm text-muted-foreground font-light">Loading calendar...</p>
            </div>
        );
    }

    return (
        <div className="h-full text-foreground">
            <FullScreenCalendar data={calendarData} onAddEvent={onAddEvent} onEventClick={onEventClick} />
        </div>
    );
};
