'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Settings, FileText, Menu, Sparkles } from 'lucide-react';
import RoleSwitcher from '@/components/interview/RoleSwitcher';
import AnonymousToggle from '@/components/interview/AnonymousToggle';
import { useRoleStore } from '@/lib/store/useRoleStore';

export default function InterviewLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { currentRole } = useRoleStore();

    const isActive = (path: string) => pathname?.startsWith(path);

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
            {/* Sidebar - Only visible for HR Role */}
            {currentRole === 'HR' && (
                <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-10">
                    <div className="p-6 border-b border-slate-100 flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-lg tracking-tight">TalentAI</span>
                    </div>

                    <nav className="flex-1 p-4 space-y-1">
                        <Link
                            href="/interview/dashboard"
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive('/interview/dashboard')
                                    ? 'bg-indigo-50 text-indigo-700'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            Dashboard
                        </Link>
                        <Link
                            href="/interview/config"
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive('/interview/config')
                                    ? 'bg-indigo-50 text-indigo-700'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            <Settings className="w-4 h-4" />
                            Configuration
                        </Link>
                    </nav>

                    <div className="p-4 border-t border-slate-100">
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <p className="text-xs font-medium text-slate-500 uppercase mb-2">
                                Demo Controls
                            </p>
                            <div className="space-y-3">
                                <RoleSwitcher />
                            </div>
                        </div>
                    </div>
                </aside>
            )}

            {/* Main Content */}
            <main className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${currentRole === 'HR' ? 'ml-64' : 'ml-0'
                }`}>
                {/* Header */}
                <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-20 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {currentRole === 'CANDIDATE' && (
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <span className="font-bold text-lg tracking-tight">TalentAI Interview</span>
                            </div>
                        )}
                        <h1 className="text-xl font-semibold text-slate-800">
                            {currentRole === 'HR' ? 'Hiring Workspace' : ''}
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        {currentRole === 'HR' && <AnonymousToggle />}
                        {/* Show Role Switcher in header for Candidate view too for easy access during demo */}
                        {currentRole === 'CANDIDATE' && <RoleSwitcher />}
                        <div className="w-8 h-8 rounded-full bg-slate-200 border border-white shadow-sm overflow-hidden">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="User" />
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 p-6 relative">
                    {children}
                </div>
            </main>
        </div>
    );
}
