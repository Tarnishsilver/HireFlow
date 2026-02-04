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

const colStartClasses = [
    "",
    "col-start-2",
    "col-start-3",
    "col-start-4",
    "col-start-5",
    "col-start-6",
    "col-start-7",
]

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

    return (
        <div className="flex flex-1 flex-col h-full bg-card border border-border text-foreground">
            {/* Calendar Header */}
            <div className="flex flex-col space-y-3 p-4 md:flex-row md:items-center md:justify-between md:space-y-0 border-b border-border">
                <div className="flex flex-auto">
                    <div className="flex items-center gap-4">
                        <div className="hidden w-16 flex-col items-center justify-center border border-border p-0.5 md:flex">
                            <h1 className="p-1 text-[10px] uppercase text-muted-foreground font-bold tracking-wider">
                                {format(today, "MMM")}
                            </h1>
                            <div className="flex w-full items-center justify-center border-t border-border bg-muted p-1 text-lg font-bold">
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
                    <div className="inline-flex w-full -space-x-px md:w-auto">
                        <Button
                            onClick={previousMonth}
                            className="shadow-none first:rounded-s-none last:rounded-e-none focus-visible:z-10"
                            variant="outline"
                            size="icon"
                            aria-label="Previous month"
                        >
                            <ChevronLeftIcon size={14} strokeWidth={2} />
                        </Button>
                        <Button
                            onClick={goToToday}
                            className="w-full shadow-none first:rounded-s-none last:rounded-e-none focus-visible:z-10 md:w-auto text-xs uppercase tracking-wider"
                            variant="outline"
                        >
                            Today
                        </Button>
                        <Button
                            onClick={nextMonth}
                            className="shadow-none first:rounded-s-none last:rounded-e-none focus-visible:z-10"
                            variant="outline"
                            size="icon"
                            aria-label="Next month"
                        >
                            <ChevronRightIcon size={14} strokeWidth={2} />
                        </Button>
                    </div>

                    <Separator orientation="vertical" className="hidden h-5 md:block" />

                    <Button onClick={onAddEvent} className="w-full gap-2 md:w-auto text-xs uppercase tracking-wider">
                        <PlusCircleIcon size={14} strokeWidth={2} />
                        <span>New Event</span>
                    </Button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Week Days Header */}
                <div className="grid grid-cols-7 border-b border-border text-center text-[10px] font-bold uppercase tracking-wider">
                    <div className="border-r border-border py-2">Sun</div>
                    <div className="border-r border-border py-2">Mon</div>
                    <div className="border-r border-border py-2">Tue</div>
                    <div className="border-r border-border py-2">Wed</div>
                    <div className="border-r border-border py-2">Thu</div>
                    <div className="border-r border-border py-2">Fri</div>
                    <div className="py-2">Sat</div>
                </div>

                {/* Calendar Days */}
                <div className="flex flex-1 text-xs leading-6 overflow-auto">
                    <div className="hidden w-full md:grid md:grid-cols-7 md:grid-rows-5">
                        {days.map((day, dayIdx) =>
                            !isDesktop ? (
                                <button
                                    onClick={() => setSelectedDay(day)}
                                    key={dayIdx}
                                    type="button"
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
                                        (isEqual(day, selectedDay) || isToday(day)) &&
                                        "font-semibold",
                                        "flex h-14 flex-col border-b border-r border-border px-2 py-1.5 hover:bg-muted focus:z-10",
                                    )}
                                >
                                    <time
                                        dateTime={format(day, "yyyy-MM-dd")}
                                        className={cn(
                                            "ml-auto flex size-5 items-center justify-center text-[10px]",
                                            isEqual(day, selectedDay) && isToday(day) && "bg-foreground text-background",
                                            isEqual(day, selectedDay) && !isToday(day) && "bg-foreground text-background",
                                        )}
                                    >
                                        {format(day, "d")}
                                    </time>
                                </button>
                            ) : (
                                <div
                                    key={dayIdx}
                                    onClick={() => setSelectedDay(day)}
                                    className={cn(
                                        dayIdx === 0 && colStartClasses[getDay(day)],
                                        !isEqual(day, selectedDay) &&
                                        !isToday(day) &&
                                        !isSameMonth(day, firstDayCurrentMonth) &&
                                        "bg-muted/50 text-muted-foreground",
                                        "relative flex flex-col border-b border-r border-border hover:bg-muted/30 cursor-pointer min-h-[100px]",
                                    )}
                                >
                                    <header className="flex items-center justify-between p-2">
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
                                                "flex h-6 w-6 items-center justify-center text-[11px]",
                                            )}
                                        >
                                            <time dateTime={format(day, "yyyy-MM-dd")}>
                                                {format(day, "d")}
                                            </time>
                                        </span>
                                    </header>
                                    <div className="flex-1 px-2 pb-2">
                                        {data
                                            .filter((event) => isSameDay(event.day, day))
                                            .map((dayData) => (
                                                <div key={dayData.day.toString()} className="space-y-1">
                                                    {dayData.events.slice(0, 2).map((event) => (
                                                        <div
                                                            key={event.id}
                                                            className={cn(
                                                                "flex flex-col border-l-2 px-1.5 py-1 text-[10px] leading-tight mb-1 rounded-r-sm",
                                                                event.category === 'Interview'
                                                                    ? "border-primary bg-primary/20"
                                                                    : "border-foreground/50 bg-foreground/10"
                                                            )}
                                                        >
                                                            <p className={cn(
                                                                "font-medium truncate",
                                                                event.category === 'Interview' && "text-primary font-bold"
                                                            )}>{event.name}</p>
                                                            <p className="text-muted-foreground">{event.time}</p>
                                                        </div>
                                                    ))}
                                                    {dayData.events.length > 2 && (
                                                        <div className="text-[9px] text-muted-foreground font-medium">
                                                            + {dayData.events.length - 2} more
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            ),
                        )}
                    </div>

                    {/* Mobile View */}
                    <div className="isolate grid w-full grid-cols-7 grid-rows-5 md:hidden">
                        {days.map((day, dayIdx) => (
                            <button
                                onClick={() => setSelectedDay(day)}
                                key={dayIdx}
                                type="button"
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
                                    (isEqual(day, selectedDay) || isToday(day)) && "font-semibold",
                                    "flex h-12 flex-col border-b border-r border-border px-1 py-1 hover:bg-muted focus:z-10",
                                )}
                            >
                                <time
                                    dateTime={format(day, "yyyy-MM-dd")}
                                    className={cn(
                                        "ml-auto flex size-5 items-center justify-center text-[10px]",
                                        isEqual(day, selectedDay) && isToday(day) && "bg-foreground text-background",
                                        isEqual(day, selectedDay) && !isToday(day) && "bg-foreground text-background",
                                    )}
                                >
                                    {format(day, "d")}
                                </time>
                                {data.filter((date) => isSameDay(date.day, day)).length > 0 && (
                                    <div className="-mx-0.5 mt-auto flex flex-wrap-reverse">
                                        {data
                                            .filter((date) => isSameDay(date.day, day))
                                            .map((date) => (
                                                <div key={date.day.toString()}>
                                                    {date.events.slice(0, 3).map((event) => (
                                                        <span
                                                            key={event.id}
                                                            className="mx-0.5 mt-0.5 h-1 w-1 bg-foreground"
                                                        />
                                                    ))}
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
