'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Settings, Sparkles } from 'lucide-react';
import RoleSwitcher from '@/components/interview/RoleSwitcher';
import AnonymousToggle from '@/components/interview/AnonymousToggle';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRoleStore } from '@/lib/store/useRoleStore';

export default function InterviewLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { currentRole } = useRoleStore();
    const { user, signOut } = useAuth(); // Needed for Navbar

    const isActive = (path: string) => pathname?.startsWith(path);

    return (
        <MainLayout user={user} onSignIn={() => { }} onSignOut={signOut}>
            <div className="flex flex-col min-h-[calc(100vh-56px)] font-sans text-slate-900 dark:text-foreground transition-colors duration-300">
                {/* Sub-header / Toolbar for Interview Section */}
                <div className="bg-transparent px-6 py-4">
                    <div className="max-w-[1920px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                        {/* Local Navigation */}
                        <div className="flex items-center gap-3">
                            <Link
                                href="/interview/dashboard"
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border ${isActive('/interview/dashboard')
                                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm'
                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                                    }`}
                            >
                                <LayoutDashboard className="w-4 h-4" />
                                Dashboard
                            </Link>
                            {currentRole === 'HR' && (
                                <Link
                                    href="/interview/config"
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border ${isActive('/interview/config')
                                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm'
                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                                        }`}
                                >
                                    <Settings className="w-4 h-4" />
                                    Configuration
                                </Link>
                            )}
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-4">
                            {currentRole === 'HR' && <AnonymousToggle />}
                            <RoleSwitcher />
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <main className="flex-1 max-w-[1920px] mx-auto w-full p-6">
                    {children}
                </main>
            </div>
        </MainLayout>
    );
}
