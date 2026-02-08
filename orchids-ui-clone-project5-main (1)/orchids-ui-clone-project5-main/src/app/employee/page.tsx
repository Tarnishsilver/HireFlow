"use client";

import { useState } from "react";
import {
  Search,
  Bell,
  Share2,
  Users,
  Download,
  Plus,
  Phone,
  Clock,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Filter,
  ZoomIn,
  ZoomOut,
  Pencil,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";

// ─── Top Bar ─────────────────────────────────────────────────────────────
function TopBar() {
  return (
    <div className="flex items-center justify-between mb-6">
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

// ─── Employee Header ─────────────────────────────────────────────────────
function EmployeeHeader() {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
          <Users className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Employee</h1>
          <p className="text-sm text-gray-400">Manage your employee</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 bg-white rounded-xl px-4 py-2.5 hover:bg-gray-50 font-medium">
          <Download className="w-4 h-4" />
          Export
        </button>
        <button className="flex items-center gap-2 text-sm text-white bg-indigo-600 rounded-xl px-4 py-2.5 hover:bg-indigo-700 font-medium">
          <Plus className="w-4 h-4" />
          Add Employee
        </button>
      </div>
    </div>
  );
}

// ─── Tab Navigation ──────────────────────────────────────────────────────
function TabNav({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) {
  const tabs = [
    { id: "manage", icon: Users, label: "Manage Employees" },
    { id: "orgchart", icon: GitBranch, label: "Organization Chart" },
    { id: "timeoff", icon: UserClock, label: "Request Time Off" },
  ];
  return (
    <div className="flex border-b border-gray-200 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === tab.id
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          <tab.icon className="w-4 h-4" />
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// Icon placeholders for tabs
function GitBranch({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="6" y1="3" x2="6" y2="15" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M18 9a9 9 0 0 1-9 9" />
    </svg>
  );
}

function UserClock({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <polyline points="16 3 16 7 20 7" />
    </svg>
  );
}

// ─── Avatar Component ────────────────────────────────────────────────────
function Avatar({
  initials,
  color,
  size = "sm",
  image,
}: {
  initials: string;
  color: string;
  size?: "sm" | "md";
  image?: string;
}) {
  const sizeClass = size === "md" ? "w-10 h-10 text-xs" : "w-8 h-8 text-[10px]";
  if (image) {
    return (
      <div className={`${sizeClass} rounded-full overflow-hidden bg-gray-200 shrink-0`}>
        <img src={image} alt={initials} className="w-full h-full object-cover" />
      </div>
    );
  }
  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center font-semibold shrink-0 ${color}`}
    >
      {initials}
    </div>
  );
}

// ─── Employee Data ───────────────────────────────────────────────────────
const employees = [
  {
    name: "Brooklyn Simmons",
    email: "brok-simms@mail.com",
    phone: "(+62) 928 7273 7262",
    department: "Design",
    deptColor: "bg-green-100 text-green-700",
    jobTitle: "Creative Direc...",
    contractType: "Onsite · Fulltime",
    attendance: "120h 32m",
    initials: "BS",
    avatarColor: "bg-pink-100 text-pink-600",
  },
  {
    name: "Cody Fisher",
    email: "cody_fisher99@mail.com",
    phone: "(+62) 928 7273 7262",
    department: "Development",
    deptColor: "bg-blue-100 text-blue-700",
    jobTitle: "Head of Devel...",
    contractType: "Onsite · Fulltime",
    attendance: "120h 32m",
    initials: "CF",
    avatarColor: "bg-orange-100 text-orange-600",
  },
  {
    name: "Ralph Edwards",
    email: "ralp_uxdsg@mail.com",
    phone: "(+62) 928 7273 7262",
    department: "Design",
    deptColor: "bg-green-100 text-green-700",
    jobTitle: "Sr. UIX Designer",
    contractType: "Onsite · Fulltime",
    attendance: "120h 32m",
    initials: "RE",
    avatarColor: "bg-purple-100 text-purple-600",
  },
  {
    name: "Bessie Cooper",
    email: "bess_coo@mail.com",
    phone: "(+62) 928 7273 7262",
    department: "HR",
    deptColor: "bg-pink-100 text-pink-700",
    jobTitle: "Sr. HR",
    contractType: "Onsite · Fulltime",
    attendance: "120h 32m",
    initials: "BC",
    avatarColor: "bg-teal-100 text-teal-600",
  },
  {
    name: "Leslie Alexander",
    email: "alexander_le@mail.com",
    phone: "(+62) 928 7273 7262",
    department: "PM",
    deptColor: "bg-purple-100 text-purple-700",
    jobTitle: "Head of PM",
    contractType: "Onsite · Fulltime",
    attendance: "120h 32m",
    initials: "LA",
    avatarColor: "bg-indigo-100 text-indigo-600",
  },
  {
    name: "Mariana Jade",
    email: "hai-codyf1@mail.com",
    phone: "(+62) 928 7273 7262",
    department: "PM",
    deptColor: "bg-purple-100 text-purple-700",
    jobTitle: "Sr. Project Man...",
    contractType: "Onsite · Fulltime",
    attendance: "120h 32m",
    initials: "MJ",
    avatarColor: "bg-yellow-100 text-yellow-600",
  },
  {
    name: "Jenny Wilson",
    email: "jenni_wil_32@mail.com",
    phone: "(+62) 928 7273 7262",
    department: "Development",
    deptColor: "bg-blue-100 text-blue-700",
    jobTitle: "QA Engineering",
    contractType: "Onsite · Fulltime",
    attendance: "120h 32m",
    initials: "JW",
    avatarColor: "bg-green-100 text-green-600",
  },
  {
    name: "Arlene McCoy",
    email: "arlene_MCD1@mail.com",
    phone: "(+62) 928 7273 7262",
    department: "Business & ...",
    deptColor: "bg-orange-100 text-orange-700",
    jobTitle: "Business Dev.",
    contractType: "Onsite · Fulltime",
    attendance: "120h 32m",
    initials: "AM",
    avatarColor: "bg-red-100 text-red-600",
  },
];

// ─── Manage Employees Tab ────────────────────────────────────────────────
function ManageEmployeesTab() {
  return (
    <div>
      {/* Title + Search */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-gray-900">Manage Employees</h2>
        <div className="flex items-center gap-3">
          <div className="relative w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search keyword..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <button className="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 bg-white rounded-xl px-4 py-2 hover:bg-gray-50 font-medium">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[2fr_1.3fr_1fr_1.3fr_1fr_1fr_0.5fr] gap-2 px-5 py-3 text-[11px] text-gray-400 font-medium border-b border-gray-100">
          <span>Employee Name</span>
          <span>Phone Number</span>
          <span>Department</span>
          <span>Job Title</span>
          <span>Contract Type</span>
          <span>Attendance</span>
          <span></span>
        </div>

        {/* Table Rows */}
        {employees.map((emp) => (
          <div
            key={emp.name}
            className="grid grid-cols-[2fr_1.3fr_1fr_1.3fr_1fr_1fr_0.5fr] gap-2 items-center px-5 py-3.5 border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
          >
            {/* Name */}
            <div className="flex items-center gap-3">
              <Avatar initials={emp.initials} color={emp.avatarColor} />
              <div>
                <p className="text-sm font-semibold text-gray-900">{emp.name}</p>
                <p className="text-[11px] text-gray-400">{emp.email}</p>
              </div>
            </div>
            {/* Phone */}
            <span className="text-sm text-gray-600">{emp.phone}</span>
            {/* Department */}
            <div>
              <span
                className={`text-[11px] font-medium rounded-full px-3 py-1 ${emp.deptColor}`}
              >
                {emp.department}
              </span>
            </div>
            {/* Job Title */}
            <span className="text-sm text-gray-600">{emp.jobTitle}</span>
            {/* Contract */}
            <span className="text-sm text-gray-600">{emp.contractType}</span>
            {/* Attendance */}
            <span className="text-sm text-gray-600">{emp.attendance}</span>
            {/* Actions */}
            <div className="flex items-center gap-2">
              <button className="text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50">
                See Details
              </button>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 text-sm">
        <p className="text-gray-400">Showing 1 to 8 of 40 employees</p>
        <div className="flex items-center gap-1">
          <button className="px-3 py-1.5 rounded-lg text-gray-500 hover:bg-gray-100">
            Previous
          </button>
          <button className="w-8 h-8 rounded-lg bg-indigo-600 text-white text-sm font-medium flex items-center justify-center">
            1
          </button>
          <button className="w-8 h-8 rounded-lg text-gray-600 hover:bg-gray-100 text-sm flex items-center justify-center">
            2
          </button>
          <span className="px-1 text-gray-400">...</span>
          <button className="w-8 h-8 rounded-lg text-gray-600 hover:bg-gray-100 text-sm flex items-center justify-center">
            5
          </button>
          <button className="px-3 py-1.5 rounded-lg text-gray-500 hover:bg-gray-100">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Organization Chart Tab ──────────────────────────────────────────────

interface OrgPerson {
  name: string;
  role: string;
  initials: string;
  avatarColor: string;
}

const orgData = {
  ceo: {
    name: "Cameron Williamson",
    role: "Founder · CEO",
    initials: "CW",
    avatarColor: "bg-gray-200 text-gray-700",
  },
  departments: [
    {
      name: "Bussines and Marketing",
      color: "bg-orange-500",
      head: {
        name: "Leslie Alexander",
        role: "Head of Project Manager",
        initials: "LA",
        avatarColor: "bg-indigo-100 text-indigo-600",
      },
      members: [
        {
          name: "Cody Firmansyah",
          role: "Senior Project Manager",
          initials: "CF",
          avatarColor: "bg-orange-100 text-orange-600",
        },
        {
          name: "Jenni William",
          role: "Project Manager",
          initials: "JW",
          avatarColor: "bg-green-100 text-green-600",
        },
      ],
    },
    {
      name: "Design",
      color: "bg-green-500",
      head: {
        name: "Brooklyn Simmons",
        role: "Creative Director",
        initials: "BS",
        avatarColor: "bg-pink-100 text-pink-600",
      },
      members: [
        {
          name: "Ralph Edwards",
          role: "Senior UIX Designer",
          initials: "RE",
          avatarColor: "bg-purple-100 text-purple-600",
        },
        {
          name: "Brooklyn Hehe",
          role: "Senior Graphic Design",
          initials: "BH",
          avatarColor: "bg-pink-100 text-pink-600",
        },
        {
          name: "Vidi Gutillerezz",
          role: "UIX Designer",
          initials: "VG",
          avatarColor: "bg-teal-100 text-teal-600",
        },
        {
          name: "Pablo Hive",
          role: "Graphic Design",
          initials: "PH",
          avatarColor: "bg-yellow-100 text-yellow-600",
        },
      ],
    },
    {
      name: "Development",
      color: "bg-indigo-500",
      head: {
        name: "Cody Fisher",
        role: "Head of Development",
        initials: "CF",
        avatarColor: "bg-orange-100 text-orange-600",
      },
      members: [
        {
          name: "Asther Mulyani",
          role: "Senior Front-End",
          initials: "AM",
          avatarColor: "bg-red-100 text-red-600",
        },
        {
          name: "Jenny Wilson",
          role: "QA Engineering",
          initials: "JW",
          avatarColor: "bg-green-100 text-green-600",
        },
        {
          name: "Eden Khoiruddin",
          role: "Back-End",
          initials: "EK",
          avatarColor: "bg-blue-100 text-blue-600",
        },
      ],
    },
  ],
};

function OrgPersonCard({ person }: { person: OrgPerson }) {
  return (
    <div className="flex items-center gap-2.5 bg-white rounded-xl border border-gray-100 px-3 py-2.5 shadow-sm min-w-[200px]">
      <Avatar initials={person.initials} color={person.avatarColor} size="md" />
      <div>
        <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
          {person.name}
        </p>
        <p className="text-[11px] text-gray-400">{person.role}</p>
      </div>
    </div>
  );
}

function OrganizationChartTab() {
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-gray-900">Organization Chart</h2>
        <button className="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 bg-white rounded-xl px-4 py-2 hover:bg-gray-50 font-medium">
          <Pencil className="w-4 h-4" />
          Edit Organization
        </button>
      </div>

      {/* Chart */}
      <div className="relative bg-white rounded-2xl border border-gray-100 p-8 overflow-auto">
        {/* Dot grid pattern background */}
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #d1d5db 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        <div className="relative flex flex-col items-center">
          {/* CEO */}
          <OrgPersonCard person={orgData.ceo} />

          {/* Vertical line from CEO */}
          <div className="w-[2px] h-8 bg-gray-200" />

          {/* Horizontal connector line */}
          <div className="relative w-full flex justify-center">
            <div
              className="h-[2px] bg-gray-200"
              style={{ width: "66%" }}
            />
          </div>

          {/* Department heads row */}
          <div className="grid grid-cols-3 gap-6 w-full mt-0">
            {orgData.departments.map((dept) => (
              <div key={dept.name} className="flex flex-col items-center">
                {/* Vertical line down to dept label */}
                <div className="w-[2px] h-6 bg-gray-200" />

                {/* Department label */}
                <div
                  className={`${dept.color} text-white text-xs font-medium rounded-full px-5 py-2 mb-4 text-center whitespace-nowrap`}
                >
                  {dept.name}
                </div>

                {/* Department Head */}
                <OrgPersonCard person={dept.head} />

                {/* Vertical line to members */}
                <div className="w-[2px] h-4 bg-gray-200" />

                {/* Members */}
                <div className="space-y-3 w-full flex flex-col items-center">
                  {dept.members.map((member) => (
                    <div key={member.name} className="flex flex-col items-center">
                      <div className="w-[2px] h-3 bg-gray-200" />
                      <OrgPersonCard person={member} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Zoom buttons */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-1">
          <button className="w-9 h-9 rounded-lg bg-gray-800 text-white flex items-center justify-center hover:bg-gray-700">
            <ZoomIn className="w-4 h-4" />
          </button>
          <button className="w-9 h-9 rounded-lg bg-gray-800 text-white flex items-center justify-center hover:bg-gray-700">
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Request Time Off Tab ────────────────────────────────────────────────

const timeOffData = [
  {
    name: "Brooklyn Simmons",
    initials: "BS",
    avatarColor: "bg-pink-100 text-pink-600",
    leaveType: "Annual Leave",
    leaveTypeColor: "bg-indigo-100 text-indigo-700",
    leaveFrom: "Jan 23, 2024",
    leaveTo: "Jan 24, 2024",
    days: 1,
    status: "Pending",
    statusColor: "text-yellow-600 bg-yellow-50",
    hasDot: true,
  },
  {
    name: "Ralph Edwards",
    initials: "RE",
    avatarColor: "bg-purple-100 text-purple-600",
    leaveType: "Sick Leave",
    leaveTypeColor: "bg-green-100 text-green-700",
    leaveFrom: "Jan 23, 2024",
    leaveTo: "Jan 27, 2024",
    days: 4,
    status: "Pending",
    statusColor: "text-yellow-600 bg-yellow-50",
    hasDot: true,
  },
  {
    name: "Leslie Alexander",
    initials: "LA",
    avatarColor: "bg-indigo-100 text-indigo-600",
    leaveType: "Annual Leave",
    leaveTypeColor: "bg-indigo-100 text-indigo-700",
    leaveFrom: "Jan 12, 2024",
    leaveTo: "Jan 14, 2024",
    days: 2,
    status: "Approved",
    statusColor: "text-green-600 bg-green-50",
    hasDot: false,
  },
  {
    name: "Cody Fisher",
    initials: "CF",
    avatarColor: "bg-orange-100 text-orange-600",
    leaveType: "Sick Leave",
    leaveTypeColor: "bg-green-100 text-green-700",
    leaveFrom: "Jan 04, 2024",
    leaveTo: "Jan 06, 2024",
    days: 2,
    status: "Approved",
    statusColor: "text-green-600 bg-green-50",
    hasDot: false,
  },
  {
    name: "Arlene McCoy",
    initials: "AM",
    avatarColor: "bg-red-100 text-red-600",
    leaveType: "Annual Leave",
    leaveTypeColor: "bg-indigo-100 text-indigo-700",
    leaveFrom: "Jan 03, 2024",
    leaveTo: "Jan 08, 2024",
    days: 5,
    status: "Approved",
    statusColor: "text-green-600 bg-green-50",
    hasDot: false,
  },
];

function RequestTimeOffTab() {
  return (
    <div>
      {/* Title + Search */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-gray-900">Request Time Off</h2>
        <div className="flex items-center gap-3">
          <div className="relative w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search keyword..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <button className="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 bg-white rounded-xl px-4 py-2 hover:bg-gray-50 font-medium">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[2fr_1.2fr_1.2fr_1.2fr_0.6fr_0.8fr_1.2fr] gap-2 px-5 py-3 text-[11px] text-gray-400 font-medium border-b border-gray-100">
          <span>Employee Name</span>
          <span>Leave Type</span>
          <span>Leave From</span>
          <span>Leave To</span>
          <span>Days</span>
          <span>Status</span>
          <span></span>
        </div>

        {/* Rows */}
        {timeOffData.map((row) => (
          <div
            key={row.name}
            className="grid grid-cols-[2fr_1.2fr_1.2fr_1.2fr_0.6fr_0.8fr_1.2fr] gap-2 items-center px-5 py-3.5 border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
          >
            {/* Name */}
            <div className="flex items-center gap-3">
              <Avatar initials={row.initials} color={row.avatarColor} />
              <span className="text-sm font-semibold text-gray-900">
                {row.name}
              </span>
              {row.hasDot && (
                <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
              )}
            </div>
            {/* Leave Type */}
            <div>
              <span
                className={`text-[11px] font-medium rounded-full px-3 py-1 ${row.leaveTypeColor}`}
              >
                {row.leaveType}
              </span>
            </div>
            {/* Leave From */}
            <span className="text-sm text-gray-600">{row.leaveFrom}</span>
            {/* Leave To */}
            <span className="text-sm text-gray-600">{row.leaveTo}</span>
            {/* Days */}
            <span className="text-sm text-gray-600">{row.days}</span>
            {/* Status */}
            <div>
              <span
                className={`text-[11px] font-medium rounded-full px-3 py-1 ${row.statusColor}`}
              >
                {row.status}
              </span>
            </div>
            {/* Actions */}
            <div className="flex items-center gap-2 justify-end">
              {row.status === "Pending" ? (
                <>
                  <button className="text-xs font-medium text-green-600 border border-green-300 bg-green-50 rounded-lg px-3.5 py-1.5 hover:bg-green-100">
                    Approve
                  </button>
                  <button className="text-xs font-medium text-red-500 border border-red-300 bg-red-50 rounded-lg px-3.5 py-1.5 hover:bg-red-100">
                    Reject
                  </button>
                </>
              ) : (
                <button className="text-xs text-gray-500 border border-gray-200 rounded-lg px-3.5 py-1.5 hover:bg-gray-50">
                  Edit
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Employee Page ───────────────────────────────────────────────────────
export default function EmployeePage() {
  const [activeTab, setActiveTab] = useState("manage");

  return (
    <div className="flex min-h-screen bg-gray-50/80">
      <Sidebar active="Employee" />

      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-[1100px]">
          <TopBar />
          <EmployeeHeader />
          <TabNav activeTab={activeTab} setActiveTab={setActiveTab} />

          {activeTab === "manage" && <ManageEmployeesTab />}
          {activeTab === "orgchart" && <OrganizationChartTab />}
          {activeTab === "timeoff" && <RequestTimeOffTab />}
        </div>
      </main>
    </div>
  );
}
