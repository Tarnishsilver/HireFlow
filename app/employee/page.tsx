"use client";

import { useState, useEffect } from "react";
import Link from 'next/link';
import {
    Search,
    Bell,
    Share2,
    Users,
    Download,
    Plus,
    Filter,
    ZoomIn,
    ZoomOut,
    Pencil,
    GitBranch,
    Loader2,
    MoreVertical
} from "lucide-react";
import { useAuth } from '@/lib/auth/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { AddEmployeeModal } from "@/components/orchids/employee/AddEmployeeModal";

// Local icon definition for UserClock (missing in some lucide versions)
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

// ─── Top Bar ─────────────────────────────────────────────────────────────
function TopBar() {
    return (
        <div className="flex items-center justify-between mb-6">
            <div className="relative w-[320px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search keyword..."
                    className="w-full pl-10 pr-16 py-2.5 bg-white dark:bg-card border border-gray-200 dark:border-border rounded-xl text-sm text-gray-600 dark:text-muted-foreground placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[11px] text-gray-400 bg-gray-100 dark:bg-muted rounded-md px-1.5 py-0.5">
                    <span>&#8984;</span>
                    <span>K</span>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <button className="w-10 h-10 rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-card flex items-center justify-center text-gray-500 dark:text-muted-foreground hover:bg-gray-50 dark:hover:bg-accent">
                    <Bell className="w-[18px] h-[18px]" />
                </button>
                <button className="w-10 h-10 rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-card flex items-center justify-center text-gray-500 dark:text-muted-foreground hover:bg-gray-50 dark:hover:bg-accent">
                    <Share2 className="w-[18px] h-[18px]" />
                </button>
            </div>
        </div>
    );
}

// ─── Employee Header ─────────────────────────────────────────────────────
function EmployeeHeader({ setIsAddModalOpen }: { setIsAddModalOpen: (open: boolean) => void }) {
    return (
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-foreground">Employee</h1>
                    <p className="text-sm text-gray-400 dark:text-muted-foreground">Manage your employee</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-border bg-white dark:bg-card rounded-xl px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-accent font-medium">
                    <Download className="w-4 h-4" />
                    Export
                </button>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl px-4 py-2.5 font-medium transition-colors"
                >
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
        <div className="flex border-b border-gray-200 dark:border-border mb-6 overflow-x-auto">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                        ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                        : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        }`}
                >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                </button>
            ))}
        </div>
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
            <div className={`${sizeClass} rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 shrink-0`}>
                <img src={image} alt={initials} className="w-full h-full object-cover" />
            </div>
        );
    }
    return (
        <div
            className={`${sizeClass} rounded-full flex items-center justify-center font-semibold shrink-0 ${color}`}
            style={{ opacity: 0.9 }}
        >
            {initials}
        </div>
    );
}

// ─── Manage Employees Tab ────────────────────────────────────────────────
function ManageEmployeesTab({ employees }: { employees: any[] }) {
    return (
        <div>
            {/* Title + Search */}
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-gray-900 dark:text-foreground">Manage Employees</h2>
                <div className="flex items-center gap-3">
                    <div className="relative w-[220px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search keyword..."
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-card border border-gray-200 dark:border-border rounded-xl text-sm text-gray-600 dark:text-muted-foreground placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                    <button className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-border bg-white dark:bg-card rounded-xl px-4 py-2 hover:bg-gray-50 dark:hover:bg-accent font-medium">
                        <Filter className="w-4 h-4" />
                        Filter
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-[2fr_1.3fr_1fr_1.3fr_1fr_1fr_0.5fr] gap-2 px-5 py-3 text-[11px] text-gray-400 dark:text-gray-500 font-medium border-b border-gray-100 dark:border-border min-w-[800px]">
                    <span>Employee Name</span>
                    <span>Email</span>
                    <span>Department</span>
                    <span>Job Title</span>
                    <span>Role</span>
                    <span>Status</span>
                    <span></span>
                </div>

                {/* Table Rows */}
                <div className="min-w-[800px]">
                    {employees.map((emp) => {
                        // Generate Initials and Color if not present in API
                        const initials = emp.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
                        const color = emp.avatar || "bg-blue-100 text-blue-600";

                        return (
                            <div
                                key={emp.id}
                                className="grid grid-cols-[2fr_1.3fr_1fr_1.3fr_1fr_1fr_0.5fr] gap-2 items-center px-5 py-3.5 border-b border-gray-50 dark:border-border/50 hover:bg-gray-50/50 dark:hover:bg-accent/50 transition-colors"
                            >
                                {/* Name */}
                                <div className="flex items-center gap-3">
                                    <Avatar initials={initials} color={color} />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-foreground">{emp.name}</p>
                                    </div>
                                </div>
                                {/* Email */}
                                <span className="text-sm text-gray-600 dark:text-muted-foreground truncate" title={emp.email}>{emp.email}</span>
                                {/* Department */}
                                <div>
                                    <span
                                        className={`text-[11px] font-medium rounded-full px-3 py-1 bg-gray-100 dark:bg-muted text-gray-700 dark:text-gray-300`}
                                    >
                                        {emp.department}
                                    </span>
                                </div>
                                {/* Job Title */}
                                <span className="text-sm text-gray-600 dark:text-muted-foreground">{emp.role}</span>
                                {/* Role/Contract - Mock for now or map from API */}
                                <span className="text-sm text-gray-600 dark:text-muted-foreground">Full-time</span>

                                {/* Status */}
                                <span className="text-sm text-green-600 dark:text-green-400 font-medium">{emp.status}</span>
                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    <Link href={`/employee/${emp.id}`} className="block">
                                        <button className="text-xs text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-border rounded-lg px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-accent">
                                            See Details
                                        </button>
                                    </Link>
                                    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                    {employees.length === 0 && (
                        <div className="text-center py-10 text-gray-400">
                            No employees found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Organization Chart Tab ──────────────────────────────────────────────
// Mock data for Org Chart (can be replaced by API later)
const orgData = {
    ceo: {
        name: "Aarav Sharma",
        role: "Founder · CEO",
        initials: "AS",
        avatarColor: "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200",
    },
    departments: [
        {
            name: "Engineering",
            color: "bg-indigo-500",
            head: {
                name: "Rohan Verma",
                role: "Head of Engineering",
                initials: "RV",
                avatarColor: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300",
            },
            members: [],
        },
        {
            name: "Design",
            color: "bg-pink-500",
            head: {
                name: "Diya Patel",
                role: "Head of Design",
                initials: "DP",
                avatarColor: "bg-pink-100 text-pink-600 dark:bg-pink-900/40 dark:text-pink-300",
            },
            members: [],
        },
    ]
};

interface OrgPerson {
    name: string;
    role: string;
    initials: string;
    avatarColor: string;
}

function OrgPersonCard({ person }: { person: OrgPerson }) {
    return (
        <div className="flex items-center gap-2.5 bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-border px-3 py-2.5 shadow-sm min-w-[200px] z-10 relative">
            <Avatar initials={person.initials} color={person.avatarColor} size="md" />
            <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-foreground whitespace-nowrap">
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
                <h2 className="text-xl font-bold text-gray-900 dark:text-foreground">Organization Chart</h2>
                <button className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-border bg-white dark:bg-card rounded-xl px-4 py-2 hover:bg-gray-50 dark:hover:bg-accent font-medium">
                    <Pencil className="w-4 h-4" />
                    Edit Organization
                </button>
            </div>

            {/* Chart */}
            <div className="relative bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border p-8 overflow-auto min-h-[600px]">
                {/* Dot grid pattern background */}
                <div
                    className="absolute inset-0 opacity-[0.15]"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle, #888 1px, transparent 1px)",
                        backgroundSize: "20px 20px",
                    }}
                />

                <div className="relative flex flex-col items-center">
                    {/* CEO */}
                    <OrgPersonCard person={orgData.ceo} />

                    {/* Vertical line from CEO */}
                    <div className="w-[2px] h-8 bg-gray-200 dark:bg-border" />

                    {/* Horizontal connector line */}
                    <div className="relative w-full flex justify-center">
                        <div
                            className="h-[2px] bg-gray-200 dark:bg-border"
                            style={{ width: "33%" }}
                        />
                    </div>

                    {/* Department heads row */}
                    <div className="grid grid-cols-2 gap-6 w-full mt-0">
                        {orgData.departments.map((dept) => (
                            <div key={dept.name} className="flex flex-col items-center">
                                {/* Vertical line down to dept label */}
                                <div className="w-[2px] h-6 bg-gray-200 dark:bg-border" />

                                {/* Department label */}
                                <div
                                    className={`${dept.color} text-white text-xs font-medium rounded-full px-5 py-2 mb-4 text-center whitespace-nowrap z-10 w-auto`}
                                >
                                    {dept.name}
                                </div>

                                {/* Department Head */}
                                <OrgPersonCard person={dept.head} />
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
// Fallback / Mock Data for Time Off (replaced via API if needed)
const timeOffData = [
    {
        name: "Rohan Verma",
        initials: "RV",
        avatarColor: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300",
        leaveType: "Sick Leave",
        leaveTypeColor: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
        leaveFrom: "Feb 10, 2026",
        leaveTo: "Feb 12, 2026",
        days: 2,
        status: "Approved",
        statusColor: "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400",
        hasDot: false,
    }
];

function RequestTimeOffTab() {
    const [leaves, setLeaves] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchLeaves() {
            try {
                const res = await fetch('/api/leaves');
                if (res.ok) {
                    const data = await res.json();
                    if (data.leaves.length > 0) {
                        setLeaves(data.leaves);
                    } else {
                        setLeaves(timeOffData); // Fallback to mock if empty
                    }
                }
            } catch (e) {
                setLeaves(timeOffData);
            } finally {
                setLoading(false);
            }
        }
        fetchLeaves();
    }, []);

    return (
        <div>
            {/* Title + Search */}
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-gray-900 dark:text-foreground">Request Time Off</h2>
                <div className="flex items-center gap-3">
                    <div className="relative w-[220px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search keyword..."
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-card border border-gray-200 dark:border-border rounded-xl text-sm text-gray-600 dark:text-muted-foreground placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border overflow-hidden">
                {/* Header */}
                <div className="grid grid-cols-[2fr_1.2fr_1.2fr_1.2fr_0.6fr_0.8fr] gap-2 px-5 py-3 text-[11px] text-gray-400 font-medium border-b border-gray-100 dark:border-border min-w-[800px]">
                    <span>Employee Name</span>
                    <span>Leave Type</span>
                    <span>Leave Dates</span>
                    <span>Days</span>
                    <span>Status</span>
                    <span></span>
                </div>

                {/* Rows */}
                <div className="min-w-[800px]">
                    {leaves.map((row) => (
                        <div
                            key={row.id || row.name}
                            className="grid grid-cols-[2fr_1.2fr_1.2fr_1.2fr_0.6fr_0.8fr] gap-2 items-center px-5 py-3.5 border-b border-gray-50 dark:border-border/50 hover:bg-gray-50/50 dark:hover:bg-accent/50 transition-colors"
                        >
                            {/* Name */}
                            <div className="flex items-center gap-3">
                                <Avatar initials={row.employeeName ? row.employeeName.substring(0, 2).toUpperCase() : row.initials} color={row.avatarColor || "bg-gray-200 text-gray-700"} />
                                <span className="text-sm font-semibold text-gray-900 dark:text-foreground">
                                    {row.employeeName || row.name}
                                </span>
                            </div>
                            {/* Leave Type */}
                            <div>
                                <span className="text-[11px] font-medium rounded-full px-3 py-1 bg-gray-100 dark:bg-muted text-gray-700 dark:text-gray-300">
                                    {row.type || row.leaveType}
                                </span>
                            </div>
                            {/* Leave Dates */}
                            <span className="text-sm text-gray-600 dark:text-muted-foreground">{row.dates || `${row.leaveFrom} - ${row.leaveTo}`}</span>
                            {/* Days */}
                            <span className="text-sm text-gray-600 dark:text-muted-foreground">{row.days}</span>
                            {/* Status */}
                            <div>
                                <span className={`text-[11px] font-medium rounded-full px-3 py-1 ${(row.status === 'Approved') ? "bg-green-100 text-green-700" :
                                    (row.status === 'Pending') ? "bg-yellow-100 text-yellow-700" :
                                        "bg-red-100 text-red-700"
                                    }`}>
                                    {row.status}
                                </span>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 justify-end">
                                <button className="text-xs text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-border rounded-lg px-3.5 py-1.5 hover:bg-gray-50 dark:hover:bg-accent">
                                    Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Employee Page ───────────────────────────────────────────────────────
export default function EmployeePage() {
    const { user, signOut, loading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState("manage");
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        async function loadEmployees() {
            if (!user) return;
            try {
                const res = await fetch('/api/employees');
                if (res.ok) {
                    const data = await res.json();
                    setEmployees(data.employees);
                }
            } catch (error) {
                console.error("Failed to load employees", error);
            } finally {
                setLoading(false);
            }
        }
        loadEmployees();
    }, [user, refreshTrigger]);

    const handleEmployeeAdded = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <MainLayout user={user} onSignIn={() => { }} onSignOut={signOut}>
            <div className="bg-gray-50/80 dark:bg-background min-h-full">
                <div className="max-w-[1400px] mx-auto p-4 md:p-6 space-y-4">
                    <TopBar />
                    <EmployeeHeader setIsAddModalOpen={setIsAddModalOpen} />
                    <TabNav activeTab={activeTab} setActiveTab={setActiveTab} />

                    {activeTab === "manage" && <ManageEmployeesTab employees={employees} />}
                    {activeTab === "orgchart" && <OrganizationChartTab />}
                    {activeTab === "timeoff" && <RequestTimeOffTab />}

                    <AddEmployeeModal
                        isOpen={isAddModalOpen}
                        onClose={() => setIsAddModalOpen(false)}
                        onEmployeeAdded={handleEmployeeAdded}
                    />
                </div>
            </div>
        </MainLayout>
    );
}
