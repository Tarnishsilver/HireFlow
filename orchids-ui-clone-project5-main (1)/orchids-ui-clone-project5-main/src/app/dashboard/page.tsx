"use client";

import {
  Phone,
  Clock,
  Eye,
  MoreVertical,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";

// ─── Payment Method Card ────────────────────────────────────────────────
function PaymentMethodCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <h3 className="font-semibold text-[15px] text-gray-900">Payment Method</h3>
          <Info className="w-3.5 h-3.5 text-gray-400" />
        </div>
        <button className="text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50">
          Change Payment Method
        </button>
      </div>
      <div className="grid grid-cols-4 gap-4">
        <div>
          <p className="text-[11px] text-gray-400 mb-1">Cardholder name</p>
          <p className="text-sm font-semibold text-gray-900">Rocks Company Ltd</p>
        </div>
        <div>
          <p className="text-[11px] text-gray-400 mb-1">Account Number</p>
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-gray-900">**** **** **** 6273</p>
            <Eye className="w-3.5 h-3.5 text-gray-400" />
          </div>
        </div>
        <div>
          <p className="text-[11px] text-gray-400 mb-1">Expiration</p>
          <p className="text-sm font-semibold text-gray-900">12/28</p>
        </div>
        <div>
          <p className="text-[11px] text-gray-400 mb-1">Payment Method</p>
          <div className="flex items-center gap-2">
            <span className="font-bold text-[13px] text-indigo-900 italic tracking-tight">VISA</span>
            <span className="text-sm text-gray-900">Debit Card · Visa</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── What's On Card ─────────────────────────────────────────────────────
function WhatsOnCard() {
  const events = [
    { name: "Elanoire Maggie", role: "UI UX Designer", type: "Sick Leave", avatar: "EM", color: "bg-pink-100 text-pink-600" },
    { name: "Kevin Malona", role: "UI UX Designer", type: "Annual Leave", avatar: "KM", color: "bg-blue-100 text-blue-600" },
    { name: "Jeremy Gemoy", role: "Graphic Designer", type: "Work From Home", avatar: "JG", color: "bg-green-100 text-green-600" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h3 className="font-semibold text-[15px] text-gray-900 mb-4">What&apos;s on in January?</h3>
      {/* Tabs */}
      <div className="flex mb-4 bg-gray-100 rounded-xl p-1">
        <button className="flex-1 text-xs font-medium py-2 rounded-lg bg-white shadow-sm text-gray-900">
          Time Off
        </button>
        <button className="flex-1 text-xs font-medium py-2 rounded-lg text-gray-400">
          Birthday
        </button>
      </div>
      <div className="space-y-3.5">
        {events.map((event) => (
          <div key={event.name} className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold ${event.color}`}>
              {event.avatar}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{event.name}</p>
              <p className="text-xs text-gray-400">
                {event.role} · {event.type}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Today Schedule Card ────────────────────────────────────────────────
function TodayScheduleCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-[15px] text-gray-900">Today Schedule</h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-gray-500 border border-gray-200 rounded-lg px-2.5 py-1.5">
            Jan 28, 2024
            <ChevronDown className="w-3 h-3" />
          </div>
          <button className="text-xs text-indigo-600 border border-indigo-200 bg-indigo-50 rounded-lg px-3 py-1.5 font-medium">
            Add Task
          </button>
        </div>
      </div>

      {/* Timeline Header */}
      <div className="relative">
        <div className="flex items-center text-[11px] text-gray-400 mb-3">
          <span className="w-[60px]">08.00</span>
          <span className="w-[60px]">09.00</span>
          <span className="relative w-[60px]">
            <span className="absolute -top-1 left-0 bg-indigo-600 text-white text-[10px] rounded-full px-2 py-0.5">
              09.35
            </span>
          </span>
          <span className="w-[60px]">10.00</span>
          <span className="w-[60px]">11.00</span>
        </div>

        {/* Timeline bars */}
        <div className="relative space-y-2">
          {/* Current time line */}
          <div className="absolute left-[120px] top-0 bottom-0 w-[2px] bg-indigo-600 z-10">
            <div className="w-2 h-2 bg-indigo-600 rounded-full -ml-[3px] -mt-1" />
          </div>

          {/* Event: Online Interview */}
          <div className="h-9 rounded-lg bg-green-100 border-l-[3px] border-green-500 flex items-center px-3 ml-[20px]" style={{ width: "180px" }}>
            <span className="text-[11px] font-medium text-green-800 truncate">Online Interview with UI Candidate</span>
          </div>

          {/* Event: Weekly meeting */}
          <div className="h-9 rounded-lg bg-yellow-100 border-l-[3px] border-yellow-500 flex items-center px-3 ml-[100px]" style={{ width: "120px" }}>
            <span className="text-[11px] font-medium text-yellow-800 truncate">Weekly meeting</span>
          </div>

          {/* Event: Psychology test */}
          <div className="h-9 rounded-lg bg-purple-100 border-l-[3px] border-purple-500 flex items-center px-3 ml-[140px]" style={{ width: "120px" }}>
            <span className="text-[11px] font-medium text-purple-800 truncate">Psychology test</span>
          </div>

          {/* Event: Replying email */}
          <div className="h-9 rounded-lg bg-blue-100 border-l-[3px] border-blue-500 flex items-center px-3 ml-[40px]" style={{ width: "200px" }}>
            <span className="text-[11px] font-medium text-blue-800 truncate">Replying email to applicants</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Job Card ───────────────────────────────────────────────────────────
function JobCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <p className="text-[11px] text-gray-400 mb-1">Active until: <span className="font-medium text-gray-500">Jan 31, 2024</span></p>
      <h3 className="font-bold text-[17px] text-gray-900 mb-2">Junior Frontend Developer</h3>
      <p className="text-xs text-gray-500 leading-relaxed mb-3">
        A front-end developer is basically a web developer has a specialization in frontend for
      </p>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[11px] bg-gray-100 text-gray-600 rounded-full px-3 py-1 font-medium">Development</span>
        <span className="text-[11px] bg-gray-100 text-gray-600 rounded-full px-3 py-1 font-medium">Full Time</span>
        <span className="text-[11px] bg-gray-100 text-gray-600 rounded-full px-3 py-1 font-medium">Remote</span>
      </div>
      <div className="border-t border-gray-100 pt-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-xs font-semibold text-orange-600">
            CF
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Cody Fisher</p>
            <p className="text-xs text-gray-400">cody_fisher99@mail.com</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
          <div className="flex items-center gap-1">
            <Phone className="w-3 h-3" />
            (+62) 928 7273 7262
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            120h 32m
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Employee Table Card ────────────────────────────────────────────────
function EmployeeCard() {
  const employees = [
    { name: "Brooklyn Simmons", email: "brok-simms@mail.com", dept: "Design", deptColor: "bg-green-100 text-green-700", job: "UI Designer", avatar: "BS", avatarColor: "bg-pink-100 text-pink-600" },
    { name: "Cody Fisher", email: "cody_fisher99@mail.com", dept: "Development", deptColor: "bg-blue-100 text-blue-700", job: "Front-End", avatar: "CF", avatarColor: "bg-orange-100 text-orange-600" },
    { name: "Ralph Edwards", email: "ralp_uxdsg@mail.com", dept: "Design", deptColor: "bg-green-100 text-green-700", job: "UX Designer", avatar: "RE", avatarColor: "bg-purple-100 text-purple-600" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-[15px] text-gray-900">Employee</h3>
        <button className="text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50">
          See Details
        </button>
      </div>
      {/* Table header */}
      <div className="grid grid-cols-3 text-[11px] text-gray-400 font-medium mb-3 px-1">
        <span>Employee Name</span>
        <span className="text-center">Department</span>
        <span className="text-center">Job Title</span>
      </div>
      <div className="space-y-3">
        {employees.map((emp) => (
          <div key={emp.name} className="grid grid-cols-3 items-center px-1">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-semibold ${emp.avatarColor}`}>
                {emp.avatar}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{emp.name}</p>
                <p className="text-[11px] text-gray-400">{emp.email}</p>
              </div>
            </div>
            <div className="flex justify-center">
              <span className={`text-[11px] font-medium rounded-full px-3 py-1 ${emp.deptColor}`}>
                {emp.dept}
              </span>
            </div>
            <p className="text-sm text-gray-600 text-center">{emp.job}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Work Hours Chart Card ──────────────────────────────────────────────
function WorkHoursCard() {
  const days = [
    { label: "Jan 24", work: 60, overtime: 0 },
    { label: "Jan 25", work: 75, overtime: 10 },
    { label: "Jan 26", work: 50, overtime: 0 },
    { label: "Jan 27", work: 85, overtime: 0 },
    { label: "Jan 28", work: 70, overtime: 0 },
    { label: "Jan 29", work: 65, overtime: 0 },
    { label: "Jan 30", work: 45, overtime: 0 },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <h3 className="font-semibold text-[15px] text-gray-900">Member Work Hours</h3>
          <Info className="w-3.5 h-3.5 text-gray-400" />
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-gray-400">View by We..</span>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              Work Time
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              Ov..
            </span>
          </div>
        </div>
      </div>

      {/* Total */}
      <div className="mb-4">
        <span className="text-3xl font-bold text-gray-900">120</span>
        <span className="text-lg text-gray-400">h </span>
        <span className="text-3xl font-bold text-gray-900">54</span>
        <span className="text-lg text-gray-400">m</span>
      </div>

      {/* Chart */}
      <div className="flex items-end gap-2 h-[120px]">
        {days.map((day) => (
          <div key={day.label} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex flex-col items-center justify-end h-[100px]">
              {day.overtime > 0 && (
                <div className="w-full max-w-[32px] bg-red-400 rounded-t-md" style={{ height: `${day.overtime}%` }} />
              )}
              <div
                className={`w-full max-w-[32px] bg-indigo-400 ${day.overtime > 0 ? "" : "rounded-t-md"} rounded-b-md`}
                style={{ height: `${day.work}%` }}
              />
            </div>
            <span className="text-[10px] text-gray-400 mt-1">{day.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Brooklyn Simmons Card ──────────────────────────────────────────────
function BrooklynCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-xs font-semibold text-pink-600">
            BS
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Brooklyn Simmons</p>
            <p className="text-[11px] text-gray-400">brok-simms@mail.com</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <ChevronUp className="w-4 h-4 text-gray-400" />
          <MoreVertical className="w-4 h-4 text-gray-400" />
        </div>
      </div>
      <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
        <div className="flex items-center gap-1">
          <Phone className="w-3 h-3" />
          (+62) 928 7273 7262
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          120h 32m
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="text-gray-400 mb-1">Department:</p>
          <span className="bg-blue-100 text-blue-700 rounded-full px-3 py-1 font-medium text-[11px]">Design</span>
        </div>
        <div>
          <p className="text-gray-400 mb-1">Job Title:</p>
          <p className="text-sm font-medium text-gray-900">Creative Director</p>
        </div>
      </div>
      <div className="mt-3 text-xs">
        <p className="text-gray-400 mb-1">Contract Type:</p>
        <p className="text-sm font-medium text-gray-900">Onsite · Fulltime</p>
      </div>
    </div>
  );
}

// ─── Leave Request Card ─────────────────────────────────────────────────
function LeaveRequestCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="bg-orange-100 text-orange-600 text-[11px] font-medium rounded-full px-3 py-1">
          Sick Leave
        </span>
        <span className="bg-yellow-100 text-yellow-700 text-[11px] font-medium rounded-full px-3 py-1">
          Pending
        </span>
      </div>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-xs font-semibold text-purple-600">
          RE
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">Ralph Edwards</p>
          <p className="text-[11px] text-gray-400">Leave for 4 day(s)</p>
        </div>
      </div>
      <div className="flex gap-3 mb-4">
        <button className="flex-1 text-xs font-medium text-green-600 border border-green-300 bg-green-50 rounded-lg py-2 hover:bg-green-100">
          Approve
        </button>
        <button className="flex-1 text-xs font-medium text-red-500 border border-red-300 bg-red-50 rounded-lg py-2 hover:bg-red-100">
          Reject
        </button>
      </div>
      <div className="grid grid-cols-2 text-xs">
        <div>
          <p className="text-gray-400 mb-0.5">Leave From:</p>
          <p className="font-medium text-gray-900">Jan 23, 2024</p>
        </div>
        <div>
          <p className="text-gray-400 mb-0.5">Leave To:</p>
          <p className="font-medium text-gray-900">Jan 27, 2024</p>
        </div>
      </div>
    </div>
  );
}

// ─── Annual Leave / Activity Card ───────────────────────────────────────
function AnnualLeaveCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      {/* Lisa Harvey */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-xs font-semibold text-teal-600">
          LH
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">Lisa Harvey</p>
          <p className="text-[11px] text-gray-400">belo-lisaa@hotmail.com</p>
        </div>
        <span className="bg-green-100 text-green-700 text-[11px] font-medium rounded-full px-3 py-1">
          Annual Leave
        </span>
      </div>
      <div className="flex items-center gap-4 text-[11px] text-gray-400 mb-4 pl-12">
        <span className="flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
          Linkedin
        </span>
        <span className="flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
          4
        </span>
        <span className="flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          1
        </span>
      </div>
      <div className="border-t border-gray-100 pt-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-600">
            LA
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900">Leslie Alexander</p>
              <span className="bg-green-100 text-green-700 text-[11px] font-medium rounded-full px-3 py-1">
                Annual Leave
              </span>
            </div>
            <p className="text-[11px] text-gray-400">Leave for 2 day(s)</p>
          </div>
        </div>
        <p className="text-[11px] text-gray-400 mt-2 pl-12">Leave From:</p>
        <p className="text-xs font-medium text-gray-900 pl-12">Jan 12, 2024</p>
      </div>
      <div className="border-t border-gray-100 pt-3 mt-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-pink-100 flex items-center justify-center text-xs font-semibold text-pink-600">
            BS
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Brooklyn Simmons</p>
            <p className="text-[11px] text-gray-400">Creative Director</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard Page ─────────────────────────────────────────────────────
export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-gray-50/80">
        <Sidebar active="Dashboard" />

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-[1200px] space-y-4">
          {/* Row 1: Payment Method */}
          <PaymentMethodCard />

          {/* Row 2: What's On + Schedule + Job */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-3">
              <WhatsOnCard />
            </div>
            <div className="col-span-5">
              <TodayScheduleCard />
            </div>
            <div className="col-span-4">
              <JobCard />
            </div>
          </div>

          {/* Row 3: Employee + Work Hours */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-5">
              <EmployeeCard />
            </div>
            <div className="col-span-7">
              <WorkHoursCard />
            </div>
          </div>

          {/* Row 4: Brooklyn + Leave Request + Annual Leave */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-4">
              <BrooklynCard />
            </div>
            <div className="col-span-3">
              <LeaveRequestCard />
            </div>
            <div className="col-span-5">
              <AnnualLeaveCard />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
