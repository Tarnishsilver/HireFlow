import { ChevronUp, MoreVertical, Phone, Clock } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useEffect, useState } from "react";

export function BrooklynCard() {
    const { user } = useAuth();
    const [employee, setEmployee] = useState<any>(null);

    useEffect(() => {
        if (user?.email) {
            // Find employee by email
            async function fetchMyEmployee() {
                if (!user?.email) return;
                try {
                    const res = await fetch('/api/employees');
                    if (res.ok) {
                        const data = await res.json();
                        const found = data.employees.find((e: any) => e.email === user.email);
                        if (found) {
                            setEmployee(found);
                        } else {
                            // If no matching employee found, maybe just use the first one as fallback for demo
                            if (data.employees.length > 0) setEmployee(data.employees[0]);
                        }
                    }
                } catch (error) {
                    console.error("Failed to load my employee profile", error);
                }
            }
            fetchMyEmployee();
        }
    }, [user]);

    // Fallback data if still loading or no match
    const data = employee || {
        name: user?.displayName || "Brooklyn Simmons",
        email: user?.email || "brok-simms@mail.com",
        role: "Creative Director",
        department: "Design",
        avatar: "BS"
    };

    const initials = data.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

    return (
        <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border p-5 shadow-sm h-full">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-xs font-semibold text-pink-600 dark:text-pink-300">
                        {initials}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-foreground truncate">{data.name}</p>
                        <p className="text-[11px] text-gray-400 truncate">{data.email}</p>
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
                    (+91) 98765 43210
                </div>
                <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    120h 32m
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                    <p className="text-gray-400 mb-1">Department:</p>
                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full px-3 py-1 font-medium text-[11px]">
                        {data.department}
                    </span>
                </div>
                <div>
                    <p className="text-gray-400 mb-1">Job Title:</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-foreground">{data.role}</p>
                </div>
            </div>
            <div className="mt-3 text-xs">
                <p className="text-gray-400 mb-1">Contract Type:</p>
                <p className="text-sm font-medium text-gray-900 dark:text-foreground">Onsite · Fulltime</p>
            </div>
        </div>
    );
}
