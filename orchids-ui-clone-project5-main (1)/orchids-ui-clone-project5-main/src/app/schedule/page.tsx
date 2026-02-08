"use client";

import { Search, Bell, Share2, ChevronDown, CalendarDays, Download, Plus } from "lucide-react";
import Sidebar from "@/components/Sidebar";

// ─── Top Bar ─────────────────────────────────────────────────────────────
function TopBar() {
  return (
    <div className="flex items-center justify-between mb-6">
      {/* Search */}
      <div className="relative w-[320px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search keyword..."
          className="w-full pl-10 pr-16 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[11px] text-gray-400 bg-gray-100 rounded-md px-1.5 py-0.5">
          <span>&#8984;</span>
          <span>K</span>
        </div>
      </div>

      {/* Right icons */}
      <div className="flex items-center gap-3">
        <button className="w-10 h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50">
          <Bell className="w-[18px] h-[18px]" />
        </button>
        <button className="w-10 h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50">
          <Share2 className="w-[18px] h-[18px]" />
        </button>
      </div>
    </div>
  );
}

// ─── Schedule Header ─────────────────────────────────────────────────────
function ScheduleHeader() {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
          <CalendarDays className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Schedule</h1>
          <p className="text-sm text-gray-400">Manage your schedule</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 bg-white rounded-xl px-4 py-2.5 hover:bg-gray-50 font-medium">
          <Download className="w-4 h-4" />
          Export
        </button>
        <button className="flex items-center gap-2 text-sm text-white bg-indigo-600 rounded-xl px-4 py-2.5 hover:bg-indigo-700 font-medium">
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>
    </div>
  );
}

// ─── Date & View Toggle ──────────────────────────────────────────────────
function DateViewToggle() {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-bold text-gray-900">Jan 28, 2024</h2>
        <ChevronDown className="w-5 h-5 text-gray-400" />
      </div>
      <div className="flex items-center bg-gray-100 rounded-xl p-1">
        <button className="text-sm font-medium px-4 py-2 rounded-lg bg-indigo-600 text-white">
          Today
        </button>
        <button className="text-sm font-medium px-4 py-2 rounded-lg text-gray-500 hover:text-gray-700">
          Week
        </button>
        <button className="text-sm font-medium px-4 py-2 rounded-lg text-gray-500 hover:text-gray-700">
          Month
        </button>
      </div>
    </div>
  );
}

// ─── Schedule Events Data ────────────────────────────────────────────────
interface ScheduleEvent {
  title: string;
  startHour: number;
  startMin: number;
  durationMin: number;
  color: "green" | "yellow" | "blue" | "purple";
  column: number; // 0 = left, 1 = right
  durationLabel: string;
}

const events: ScheduleEvent[] = [
  {
    title: "Online Interview with UI Candidate",
    startHour: 8,
    startMin: 0,
    durationMin: 120,
    color: "green",
    column: 0,
    durationLabel: "2 hours",
  },
  {
    title: "Replying email to applicants",
    startHour: 8,
    startMin: 30,
    durationMin: 90,
    color: "yellow",
    column: 1,
    durationLabel: "1 hours 30 minutes",
  },
  {
    title: "Online Interview with UI Candidate",
    startHour: 10,
    startMin: 0,
    durationMin: 60,
    color: "green",
    column: 0,
    durationLabel: "1 hours",
  },
  {
    title: "Online Interview with UI Candidate",
    startHour: 10,
    startMin: 30,
    durationMin: 90,
    color: "yellow",
    column: 1,
    durationLabel: "1 hours 30 minutes",
  },
  {
    title: "Online Interview with UI Candidate",
    startHour: 13,
    startMin: 0,
    durationMin: 60,
    color: "blue",
    column: 0,
    durationLabel: "1 hours",
  },
];

const colorMap = {
  green: {
    bg: "bg-green-100/80",
    border: "border-l-green-500",
    text: "text-green-800",
    timeBg: "bg-green-200/60",
  },
  yellow: {
    bg: "bg-yellow-100/60",
    border: "border-l-yellow-500",
    text: "text-yellow-800",
    timeBg: "bg-yellow-200/60",
  },
  blue: {
    bg: "bg-blue-100/60",
    border: "border-l-blue-500",
    text: "text-blue-800",
    timeBg: "bg-blue-200/60",
  },
  purple: {
    bg: "bg-purple-100/60",
    border: "border-l-purple-500",
    text: "text-purple-800",
    timeBg: "bg-purple-200/60",
  },
};

// ─── Schedule Grid ───────────────────────────────────────────────────────
function ScheduleGrid() {
  const hours = [7, 8, 9, 10, 11, 12, 13, 14];
  const ROW_HEIGHT = 90; // px per hour
  const START_HOUR = 7;
  const CURRENT_TIME_HOUR = 9;
  const CURRENT_TIME_MIN = 35;

  const currentTimeTop =
    (CURRENT_TIME_HOUR - START_HOUR) * ROW_HEIGHT +
    (CURRENT_TIME_MIN / 60) * ROW_HEIGHT;

  function getEventStyle(event: ScheduleEvent) {
    const top =
      (event.startHour - START_HOUR) * ROW_HEIGHT +
      (event.startMin / 60) * ROW_HEIGHT;
    const height = (event.durationMin / 60) * ROW_HEIGHT;
    return { top: `${top}px`, height: `${height}px` };
  }

  function formatTimeRange(event: ScheduleEvent) {
    const startH = String(event.startHour).padStart(2, "0");
    const startM = String(event.startMin).padStart(2, "0");
    const endTotalMin = event.startHour * 60 + event.startMin + event.durationMin;
    const endH = String(Math.floor(endTotalMin / 60)).padStart(2, "0");
    const endM = String(endTotalMin % 60).padStart(2, "0");
    return `${startH}.${startM} - ${endH}.${endM}`;
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Column Headers */}
      <div className="grid grid-cols-[80px_1fr] border-b border-gray-100">
        <div className="px-4 py-3 text-xs font-medium text-gray-400">Time</div>
        <div className="px-4 py-3 text-xs font-medium text-gray-400">Your Task</div>
      </div>

      {/* Grid Body */}
      <div className="grid grid-cols-[80px_1fr]">
        {/* Time Column */}
        <div className="relative border-r border-gray-100">
          {hours.map((hour) => {
            const top = (hour - START_HOUR) * ROW_HEIGHT;
            return (
              <div
                key={hour}
                className="absolute left-0 right-0 px-4 text-sm font-medium text-gray-700"
                style={{ top: `${top}px`, height: `${ROW_HEIGHT}px` }}
              >
                <span className="relative top-3">
                  {String(hour).padStart(2, "0")}.00
                </span>
              </div>
            );
          })}

          {/* Current time indicator in time column */}
          <div
            className="absolute left-2 z-20"
            style={{ top: `${currentTimeTop - 2}px` }}
          >
            <span className="bg-indigo-600 text-white text-[11px] font-medium rounded-md px-2 py-1">
              09.35
            </span>
          </div>

          <div style={{ height: `${hours.length * ROW_HEIGHT}px` }} />
        </div>

        {/* Events Area */}
        <div className="relative">
          {/* Diagonal stripe background */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(135deg, transparent, transparent 8px, #000 8px, #000 9px)",
            }}
          />

          {/* Hour grid lines */}
          {hours.map((hour) => {
            const top = (hour - START_HOUR) * ROW_HEIGHT;
            return (
              <div
                key={hour}
                className="absolute left-0 right-0 border-t border-gray-100"
                style={{ top: `${top}px` }}
              />
            );
          })}

          {/* Current time horizontal line */}
          <div
            className="absolute left-0 right-0 z-10 flex items-center"
            style={{ top: `${currentTimeTop}px` }}
          >
            <div className="w-3 h-3 bg-indigo-600 rounded-full -ml-1.5" />
            <div className="flex-1 h-[2px] bg-indigo-600" />
          </div>

          {/* Events */}
          {events.map((event, idx) => {
            const style = getEventStyle(event);
            const colors = colorMap[event.color];
            return (
              <div
                key={idx}
                className={`absolute rounded-xl border-l-[4px] ${colors.border} ${colors.bg} p-3 flex flex-col justify-between overflow-hidden`}
                style={{
                  ...style,
                  left: event.column === 0 ? "8px" : "50%",
                  width: event.column === 0 ? "calc(50% - 12px)" : "calc(50% - 12px)",
                }}
              >
                <p className={`text-[13px] font-semibold ${colors.text} leading-tight`}>
                  {event.title}
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <span className={`text-[11px] ${colors.text} opacity-70`}>
                    {formatTimeRange(event)}
                  </span>
                  <span className={`text-[11px] ${colors.text} opacity-70`}>
                    {event.durationLabel}
                  </span>
                </div>
              </div>
            );
          })}

          <div style={{ height: `${hours.length * ROW_HEIGHT}px` }} />
        </div>
      </div>
    </div>
  );
}

// ─── Schedule Page ───────────────────────────────────────────────────────
export default function SchedulePage() {
  return (
    <div className="flex min-h-screen bg-gray-50/80">
      <Sidebar active="Schedule" />

      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-[1100px]">
          <TopBar />
          <ScheduleHeader />
          <DateViewToggle />
          <ScheduleGrid />
        </div>
      </main>
    </div>
  );
}
