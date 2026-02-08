"use client";

import {
  LayoutDashboard,
  Users,
  UserCheck,
  DollarSign,
  CalendarDays,
  Plus,
  Settings,
  HelpCircle,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";

const mainMenu = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Users, label: "Employee", href: "/employee" },
  { icon: UserCheck, label: "Recruitment", href: "/recruitment" },
  { icon: DollarSign, label: "Payroll", href: "#" },
  { icon: CalendarDays, label: "Schedule", href: "/schedule" },
];

const departments = [
  { color: "bg-orange-400", label: "Bussines and Marketing" },
  { color: "bg-green-500", label: "Design" },
  { color: "bg-purple-500", label: "Project Manager" },
  { color: "bg-pink-400", label: "Human Resource" },
  { color: "bg-blue-600", label: "Development" },
];

export default function Sidebar({ active }: { active: string }) {
  return (
    <aside className="w-[240px] min-h-screen bg-white border-r border-gray-100 flex flex-col py-6 px-4 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-2 mb-6">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="2" y="2" width="6" height="6" rx="1.5" fill="white" />
            <rect x="10" y="2" width="6" height="6" rx="1.5" fill="white" opacity="0.5" />
            <rect x="2" y="10" width="6" height="6" rx="1.5" fill="white" opacity="0.5" />
            <rect x="10" y="10" width="6" height="6" rx="1.5" fill="white" />
          </svg>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-bold text-[15px] text-gray-900">BordUp</span>
          <span className="text-[10px] align-super text-gray-400">™</span>
        </div>
        <button className="ml-auto text-gray-400 hover:text-gray-600">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 3v18" />
          </svg>
        </button>
      </div>

      {/* Team Selector */}
      <div className="flex items-center gap-3 px-2 py-2.5 mb-6 bg-gray-50 rounded-xl">
        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm">
          RC
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">Rocks Company</p>
          <p className="text-xs text-gray-400">Team - 20 Members</p>
        </div>
        <ChevronUp className="w-4 h-4 text-gray-400" />
      </div>

      {/* Main Menu */}
      <div className="mb-6">
        <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider px-2 mb-2">
          Main Menu
        </p>
        <nav className="space-y-0.5">
          {mainMenu.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                item.label === active
                  ? "bg-indigo-600 text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <item.icon className="w-[18px] h-[18px]" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Department */}
      <div className="mb-6">
        <div className="flex items-center justify-between px-2 mb-2">
          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
            Department
          </p>
          <Plus className="w-4 h-4 text-gray-400" />
        </div>
        <nav className="space-y-0.5">
          {departments.map((dept) => (
            <a
              key={dept.label}
              href="#"
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
            >
              <span className={`w-2.5 h-2.5 rounded-full ${dept.color}`} />
              {dept.label}
            </a>
          ))}
        </nav>
      </div>

      {/* Other */}
      <div className="mt-auto">
        <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider px-2 mb-2">
          Other
        </p>
        <nav className="space-y-0.5">
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
            <Settings className="w-[18px] h-[18px]" />
            Setting
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
            <HelpCircle className="w-[18px] h-[18px]" />
            Help Center
          </a>
        </nav>
      </div>
    </aside>
  );
}
