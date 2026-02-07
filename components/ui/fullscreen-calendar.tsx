"use client"

import * as React from "react"
import {
    add,
    eachDayOfInterval,
    endOfMonth,
    endOfWeek,
    format,
    getDay,
    isEqual,
    isSameDay,
    isSameMonth,
    isToday,
    parse,
    startOfToday,
    startOfWeek,
} from "date-fns"
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    PlusCircleIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useMediaQuery } from "@/hooks/use-media-query"

interface Event {
    id: string
    name: string
    time: string
    datetime: string
    category?: string // Added category for styling
}

interface CalendarData {
    day: Date
    events: Event[]
}

interface FullScreenCalendarProps {
    data: CalendarData[]
    onAddEvent?: () => void
}

export function FullScreenCalendar({ data, onAddEvent }: FullScreenCalendarProps) {
    const today = startOfToday()
    const [selectedDay, setSelectedDay] = React.useState(today)
    const [currentMonth, setCurrentMonth] = React.useState(
        format(today, "MMM-yyyy"),
    )
    const firstDayCurrentMonth = parse(currentMonth, "MMM-yyyy", new Date())
    const isDesktop = useMediaQuery("(min-width: 768px)")

    const days = eachDayOfInterval({
        start: startOfWeek(firstDayCurrentMonth),
        end: endOfWeek(endOfMonth(firstDayCurrentMonth)),
    })

    function previousMonth() {
        const firstDayNextMonth = add(firstDayCurrentMonth, { months: -1 })
        setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"))
    }

    function nextMonth() {
        const firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 })
        setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"))
    }

    function goToToday() {
        setCurrentMonth(format(today, "MMM-yyyy"))
    }

    // Chunk days into weeks for better layout control
    const weeks = React.useMemo(() => {
        const result = [];
        for (let i = 0; i < days.length; i += 7) {
            result.push(days.slice(i, i + 7));
        }
        return result;
    }, [days]);

    return (
        <div className="flex flex-1 flex-col h-full gap-4 text-foreground">
            {/* Calendar Header - Card Style */}
            <div className="flex flex-col space-y-3 p-4 md:flex-row md:items-center md:justify-between md:space-y-0 bg-card border border-border rounded-xl shadow-sm">
                <div className="flex flex-auto">
                    <div className="flex items-center gap-4">
                        <div className="hidden w-16 flex-col items-center justify-center border border-border rounded-md overflow-hidden md:flex">
                            <h1 className="w-full bg-muted/50 p-1 text-center text-[10px] uppercase text-muted-foreground font-bold tracking-wider">
                                {format(today, "MMM")}
                            </h1>
                            <div className="flex w-full items-center justify-center bg-card p-1 text-lg font-bold">
                                <span>{format(today, "d")}</span>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-sm font-bold uppercase tracking-wider">
                                {format(firstDayCurrentMonth, "MMMM yyyy")}
                            </h2>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                {format(firstDayCurrentMonth, "MMM d")} - {format(endOfMonth(firstDayCurrentMonth), "MMM d, yyyy")}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-3 md:flex-row md:gap-4">
                    <div className="inline-flex w-full -space-x-px md:w-auto shadow-sm rounded-md">
                        <Button
                            onClick={previousMonth}
                            className="shadow-none first:rounded-s-md last:rounded-e-none focus-visible:z-10 border-r-0"
                            variant="outline"
                            size="icon"
                            aria-label="Previous month"
                        >
                            <ChevronLeftIcon size={14} strokeWidth={2} />
                        </Button>
                        <Button
                            onClick={goToToday}
                            className="w-full shadow-none rounded-none focus-visible:z-10 md:w-auto text-xs uppercase tracking-wider border-x-0"
                            variant="outline"
                        >
                            Today
                        </Button>
                        <Button
                            onClick={nextMonth}
                            className="shadow-none first:rounded-s-none last:rounded-e-md focus-visible:z-10 border-l-0"
                            variant="outline"
                            size="icon"
                            aria-label="Next month"
                        >
                            <ChevronRightIcon size={14} strokeWidth={2} />
                        </Button>
                    </div>

                    <Separator orientation="vertical" className="hidden h-5 md:block" />

                    <Button onClick={onAddEvent} className="w-full gap-2 md:w-auto text-xs uppercase tracking-wider shadow-sm">
                        <PlusCircleIcon size={14} strokeWidth={2} />
                        <span>New Event</span>
                    </Button>
                </div>
            </div>

            {/* Calendar Content */}
            <div className="flex flex-1 flex-col overflow-hidden gap-4">
                {/* Week Days Header - Card Style */}
                <div className="grid grid-cols-7 bg-card border border-border rounded-xl p-1 text-center text-[10px] font-bold uppercase tracking-wider shadow-sm">
                    <div className="py-2 text-muted-foreground">Sun</div>
                    <div className="py-2 text-muted-foreground">Mon</div>
                    <div className="py-2 text-muted-foreground">Tue</div>
                    <div className="py-2 text-muted-foreground">Wed</div>
                    <div className="py-2 text-muted-foreground">Thu</div>
                    <div className="py-2 text-muted-foreground">Fri</div>
                    <div className="py-2 text-muted-foreground">Sat</div>
                </div>

                {/* Weeks - Different Boxes */}
                <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4 pb-2">
                    {/* Desktop View: Chunked Weeks */}
                    <div className="hidden md:flex flex-col gap-4">
                        {weeks.map((week, weekIdx) => (
                            <div key={weekIdx} className="grid grid-cols-7 bg-card border border-border rounded-xl overflow-hidden shadow-sm min-h-[120px]">
                                {week.map((day, dayIdx) => (
                                    <div
                                        key={day.toString()}
                                        onClick={() => setSelectedDay(day)}
                                        className={cn(
                                            !isEqual(day, selectedDay) &&
                                            !isToday(day) &&
                                            !isSameMonth(day, firstDayCurrentMonth) &&
                                            "bg-muted/30 text-muted-foreground/40",
                                            "relative flex flex-col border-r border-border last:border-r-0 hover:bg-muted/40 cursor-pointer p-2 transition-colors",
                                        )}
                                    >
                                        <header className="flex items-center justify-between mb-2">
                                            <span
                                                className={cn(
                                                    isEqual(day, selectedDay) && "text-background",
                                                    !isEqual(day, selectedDay) &&
                                                    !isToday(day) &&
                                                    isSameMonth(day, firstDayCurrentMonth) &&
                                                    "text-foreground",
                                                    !isEqual(day, selectedDay) &&
                                                    !isToday(day) &&
                                                    !isSameMonth(day, firstDayCurrentMonth) &&
                                                    "text-muted-foreground",
                                                    isEqual(day, selectedDay) && isToday(day) && "bg-foreground",
                                                    isEqual(day, selectedDay) && !isToday(day) && "bg-foreground",
                                                    (isEqual(day, selectedDay) || isToday(day)) && "font-bold",
                                                    "flex h-6 w-6 items-center justify-center rounded-full text-[11px]",
                                                )}
                                            >
                                                <time dateTime={format(day, "yyyy-MM-dd")}>
                                                    {format(day, "d")}
                                                </time>
                                            </span>
                                        </header>
                                        <div className="flex-1 space-y-1">
                                            {data
                                                .filter((event) => isSameDay(event.day, day))
                                                .slice(0, 3)
                                                .map((dayData) => (
                                                    <React.Fragment key={dayData.day.toString()}>
                                                        {dayData.events.slice(0, 2).map((event) => (
                                                            <div
                                                                key={event.id}
                                                                className={cn(
                                                                    "flex flex-col border-l-2 px-1.5 py-0.5 text-[9px] leading-tight rounded-r-sm transition-all truncate",
                                                                    event.category === 'Interview'
                                                                        ? "border-primary bg-primary/10 text-primary-foreground hover:bg-primary/20"
                                                                        : "border-muted-foreground/30 bg-muted text-muted-foreground hover:bg-muted/80"
                                                                )}
                                                            >
                                                                <span className="font-medium truncate">{event.name}</span>
                                                            </div>
                                                        ))}
                                                    </React.Fragment>
                                                ))}
                                            {data.filter((e) => isSameDay(e.day, day)).reduce((acc, curr) => acc + curr.events.length, 0) > 2 && (
                                                <div className="text-[9px] text-muted-foreground font-medium pl-1">
                                                    + {data.filter((e) => isSameDay(e.day, day)).reduce((acc, curr) => acc + curr.events.length, 0) - 2} more
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* Mobile View - Keep slightly simplified but maybe chunked too? No, keep simple. */}
                    <div className="isolate grid w-full grid-cols-7 gap-2 md:hidden">
                        {days.map((day, dayIdx) => (
                            <button
                                onClick={() => setSelectedDay(day)}
                                key={dayIdx}
                                type="button"
                                className={cn(
                                    isEqual(day, selectedDay) && "bg-foreground text-background shadow-md",
                                    !isEqual(day, selectedDay) && "bg-card border border-border text-foreground hover:bg-muted",
                                    (isEqual(day, selectedDay) || isToday(day)) && "font-semibold",
                                    "flex flex-col items-center justify-center rounded-lg p-2 min-h-[50px] transition-all",
                                )}
                            >
                                <time
                                    dateTime={format(day, "yyyy-MM-dd")}
                                    className="text-xs"
                                >
                                    {format(day, "d")}
                                </time>
                                {data.some((d) => isSameDay(d.day, day)) && (
                                    <div className="mt-1 h-1 w-1 rounded-full bg-primary" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
