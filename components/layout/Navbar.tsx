'use client';

import React, { useEffect, useState } from 'react';
import { User as UserIcon, LogOut, Plus, Sun, Moon, Settings, HelpCircle, Search, Bell } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useUIStore } from '@/lib/store/useUIStore';
import { PanelLeft, PanelTop } from 'lucide-react';

interface NavbarProps {
  user?: FirebaseUser | null;
  onSignIn?: () => void;
  onSignOut?: () => void;
  position?: 'top' | 'left';
}

export const Navbar = ({ user, onSignIn, onSignOut, position = 'top' }: NavbarProps) => {
  const pathname = usePathname();
  const { setTheme, theme } = useTheme();
  const { toggleNavbarPosition } = useUIStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard', isActive: pathname === '/dashboard' },
    { name: 'Recruitment', href: '/recruitment/jobs', isActive: pathname?.startsWith('/recruitment') },
    { name: 'Interviews', href: '/interview', isActive: pathname?.startsWith('/interview') },
    { name: 'Payroll', href: '/payroll', isActive: pathname?.startsWith('/payroll') },
    { name: 'Schedule', href: '/meetings', isActive: pathname?.startsWith('/meetings') },
    { name: 'Employees', href: '/employee', isActive: pathname?.startsWith('/employee') },
    { name: 'Communication', href: '/communication', isActive: pathname?.startsWith('/communication') },
    { name: 'Analytics', href: '/analytics', isActive: pathname?.startsWith('/analytics') },
  ];

  const isLeft = position === 'left';

  // Vertical Sidebar Layout
  if (isLeft) {
    return (
      <nav className="h-screen w-64 fixed left-0 top-0 z-50 flex flex-col bg-white dark:bg-[#1a1a1a] border-r border-gray-200 dark:border-white/[0.06] overflow-hidden transition-colors duration-300">
        {/* Header */}
        <div className="p-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-8 w-8 bg-black dark:bg-white flex items-center justify-center rounded-lg transition-colors">
              <span className="text-white dark:text-black text-xs font-bold">HR</span>
            </div>
            <span className="font-bold text-sm tracking-wide text-black dark:text-white uppercase transition-colors">Hireflow</span>
          </Link>

          {mounted && (
            <button
              onClick={toggleNavbarPosition}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/[0.08] rounded-lg text-gray-400 dark:text-white/50 hover:text-black dark:hover:text-white/80 transition-all"
              title="Move to Top"
            >
              <PanelTop size={16} strokeWidth={1.5} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-2">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`
                  flex items-center px-4 py-3 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all duration-200
                  ${link.isActive
                    ? 'bg-black text-white shadow-lg shadow-black/10 dark:bg-white dark:text-black dark:shadow-white/10'
                    : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/[0.04]'
                  }
                `}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Department Section */}
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between px-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Department</span>
              <button className="p-1 hover:bg-gray-100 dark:hover:bg-white/[0.08] rounded-md text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white transition-colors">
                <Plus size={14} strokeWidth={1.5} />
              </button>
            </div>
            <div className="space-y-1">
              {[
                { name: 'Business and Marketing', color: 'bg-blue-500' },
                { name: 'Design', color: 'bg-emerald-500' },
                { name: 'Project Manager', color: 'bg-amber-500' },
                { name: 'Human Resource', color: 'bg-purple-500' },
                { name: 'Development', color: 'bg-cyan-500' },
              ].map((dept) => (
                <div
                  key={dept.name}
                  className="flex items-center gap-3 px-4 py-2 text-[11px] font-medium text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/[0.04] rounded-lg cursor-pointer transition-all"
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${dept.color}`} />
                  <span className="truncate">{dept.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Other Section */}
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between px-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Other</span>
            </div>
            <div className="space-y-1">
              <Link
                href="/settings"
                className="flex items-center gap-3 px-4 py-2 text-[11px] font-medium text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/[0.04] rounded-lg transition-all"
              >
                <Settings size={14} strokeWidth={1.5} />
                <span>Settings</span>
              </Link>
              <Link
                href="/help"
                className="flex items-center gap-3 px-4 py-2 text-[11px] font-medium text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/[0.04] rounded-lg transition-all"
              >
                <HelpCircle size={14} strokeWidth={1.5} />
                <span>Help Center</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-white/[0.06]">
          <div className="flex items-center justify-between mb-4">
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-white/[0.08] rounded-lg text-gray-500 hover:text-black dark:text-gray-500 dark:hover:text-white transition-all"
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}
              </button>
            )}
          </div>

          {user ? (
            <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-all cursor-pointer group">
              <div className="h-9 w-9 bg-gray-100 dark:bg-white/[0.08] flex items-center justify-center rounded-xl overflow-hidden border border-gray-200 dark:border-white/[0.08]">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="User" className="h-full w-full object-cover" />
                ) : (
                  <UserIcon size={16} className="text-gray-400 dark:text-white/50" strokeWidth={1.5} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-bold text-gray-900 dark:text-white/90 truncate">{user.displayName}</p>
                <p className="text-[10px] text-gray-500 box-border truncate">{user.email}</p>
              </div>
              <button
                onClick={onSignOut}
                className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-white/[0.08] rounded-lg text-gray-500 dark:text-white/50 hover:text-black dark:hover:text-white transition-all"
              >
                <LogOut size={14} strokeWidth={1.5} />
              </button>
            </div>
          ) : (
            <button
              onClick={onSignIn}
              className="w-full px-4 py-2.5 bg-black text-white dark:bg-white dark:text-black rounded-xl text-[11px] font-bold hover:bg-gray-800 dark:hover:bg-gray-100 transition-all uppercase tracking-wider"
            >
              Sign In
            </button>
          )}
        </div>
      </nav>
    );
  }

  // Horizontal Top Navbar
  return (
    <nav className="sticky top-0 z-50 w-full transition-colors duration-300">
      <div className="h-[60px] bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-white/[0.06] flex items-center px-6 transition-colors">
        <div className="w-full max-w-[1920px] mx-auto flex items-center">
          {/* Logo */}
          <div className="flex items-center gap-3 mr-10">
            <Link href="/" className="flex items-center group">
              <div className="h-8 w-8 bg-black dark:bg-white flex items-center justify-center rounded-lg mr-3 transition-colors">
                <span className="text-white dark:text-black text-xs font-bold">HR</span>
              </div>
              <span className="font-bold text-sm tracking-wide text-black dark:text-white uppercase transition-colors">Hireflow</span>
            </Link>

            {mounted && (
              <button
                onClick={toggleNavbarPosition}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/[0.08] rounded-lg text-gray-400 dark:text-white/50 hover:text-black dark:hover:text-white/80 transition-all ml-2"
                title="Move to Side"
              >
                <PanelLeft size={16} strokeWidth={1.5} />
              </button>
            )}
          </div>

          {/* Navigation - macOS bubble style */}
          <div className="hidden md:flex h-full items-center gap-1 bg-gray-100 dark:bg-white/[0.04] rounded-xl p-1 transition-colors">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`
                  flex items-center px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all duration-200
                  ${link.isActive
                    ? 'bg-black text-white shadow-sm dark:bg-white dark:text-black'
                    : 'text-gray-500 hover:text-black hover:bg-white/50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/[0.06]'
                  }
                `}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="ml-auto flex items-center gap-2">
            {/* Search */}
            <button className="p-2.5 hover:bg-white/[0.08] rounded-xl text-white/50 hover:text-white/80 transition-all">
              <Search size={18} strokeWidth={1.5} />
            </button>

            {/* Notifications */}
            <button className="p-2.5 hover:bg-white/[0.08] rounded-xl text-white/50 hover:text-white/80 transition-all relative">
              <Bell size={18} strokeWidth={1.5} />
              <span className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full" />
            </button>

            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2.5 hover:bg-white/[0.08] rounded-xl text-white/50 hover:text-white/80 transition-all"
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun size={18} strokeWidth={1.5} /> : <Moon size={18} strokeWidth={1.5} />}
              </button>
            )}

            {/* Divider */}
            <div className="h-6 w-px bg-white/[0.08] mx-2" />

            {/* User */}
            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-white/[0.06] transition-all">
                  <div className="h-8 w-8 bg-white/[0.08] flex items-center justify-center rounded-lg overflow-hidden border border-white/[0.08]">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="User" className="h-full w-full object-cover" />
                    ) : (
                      <UserIcon size={16} className="text-white/50" strokeWidth={1.5} />
                    )}
                  </div>
                  <span className="text-[13px] font-medium text-white/80 hidden sm:block">{user.displayName?.split(' ')[0]}</span>
                </button>

                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-2 w-48 bg-[#1a1a1a] border border-white/[0.08] rounded-xl p-1.5 hidden group-hover:block shadow-2xl">
                  <button
                    onClick={onSignOut}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] text-white/50 hover:text-white/80 hover:bg-white/[0.06] rounded-lg transition-all"
                  >
                    <LogOut size={14} strokeWidth={1.5} />
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={onSignIn}
                className="px-5 py-2 bg-primary text-primary-foreground rounded-xl text-[13px] font-medium hover:bg-primary/90 transition-all"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
