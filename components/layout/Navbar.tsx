'use client';

import React, { useEffect, useState } from 'react';
import { User as UserIcon, LogOut, Plus, Sun, Moon } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useTheme } from 'next-themes';

// ... imports
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
  const searchParams = useSearchParams();
  const { setTheme, theme } = useTheme();
  const { toggleNavbarPosition } = useUIStore();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { name: 'OVERVIEW', href: '/dashboard', isActive: pathname === '/dashboard' },
    { name: 'RECRUITMENT', href: '/recruitment/jobs', isActive: pathname?.startsWith('/recruitment') },
    { name: 'INTERVIEWS', href: '/interview', isActive: pathname?.startsWith('/interview') },
    { name: 'PAYROLL', href: '/payroll', isActive: pathname?.startsWith('/payroll') },
    { name: 'SCHEDULE', href: '/meetings', isActive: pathname?.startsWith('/meetings') },
    { name: 'EMPLOYEE', href: '/employee', isActive: pathname?.startsWith('/employee') },
    { name: 'ANALYTICS', href: '/analytics', isActive: pathname?.startsWith('/analytics') },
  ];

  // Helper for conditional classes
  const isLeft = position === 'left';

  return (
    <nav
      className={`
        bg-background text-foreground transition-all duration-300 border-border
        ${isLeft
          ? 'h-screen w-64 border-r fixed left-0 top-0 flex flex-col p-4 z-50'
          : 'sticky top-0 z-50 w-full h-[56px] border-b flex items-center px-6'
        }
      `}
    >
      {/* Container - flex-col for left, flex-row for top */}
      <div
        className={`
          w-full h-full flex 
          ${isLeft ? 'flex-col gap-6' : 'flex-row items-center max-w-[1920px] mx-auto'}
        `}
      >

        {/* LOGO */}
        <div className={`flex items-center justify-between ${isLeft ? 'w-full mb-2' : 'mr-12'}`}>
          <Link href="/" className="flex items-center group">
            <div className="h-6 w-6 bg-foreground flex items-center justify-center mr-3 group-hover:opacity-90 transition-opacity rounded-[2px]">
              <span className="text-background text-[10px] font-bold">HR</span>
            </div>
            <span className="font-semibold text-sm tracking-wide uppercase">Hireflow</span>
          </Link>

          {/* Position Toggle (Only visible if mounted to avoid hydration mismatch) */}
          {mounted && (
            <button
              onClick={toggleNavbarPosition}
              className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors"
              title={isLeft ? "Move to Top" : "Move to Side"}
            >
              {isLeft ? <PanelTop size={16} /> : <PanelLeft size={16} />}
            </button>
          )}
        </div>


        {/* NAVIGATION */}
        <div
          className={`
                flex 
                ${isLeft ? 'flex-col space-y-1 w-full' : 'hidden md:flex h-full items-center space-x-1'}
            `}
        >
          {navLinks.map((link) => {
            const linkContent = (
              <>
                {link.name}
                {!isLeft && link.isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-foreground" />
                )}
              </>
            );

            const linkClass = `
                relative flex items-center text-[13px] font-medium tracking-[0.04em] transition-colors
                ${isLeft
                ? `px-3 py-2 rounded-md w-full ${link.isActive ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`
                : `h-full px-4 ${link.isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`
              }
            `;



            return (
              <Link key={link.name} href={link.href} className={linkClass}>
                {linkContent}
              </Link>
            );
          })}
        </div>

        {/* RIGHT ACTIONS */}
        <div className={`flex items-center gap-4 ${isLeft ? 'mt-auto flex-col-reverse w-full items-start pt-4 border-t border-border' : 'ml-auto'}`}>

          <div className={`flex items-center gap-2 ${isLeft ? 'w-full justify-between' : ''}`}>

            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            )}

            {/* Sign In/Out */}
            {user ? (
              <>
                {/* Create Job Button (Desktop) */}


                {/* User Profile */}
                <div className={`flex items-center gap-4 ${isLeft ? 'flex-row-reverse w-full justify-end' : ''}`}>
                  <div className={`text-right ${isLeft ? 'text-left' : 'hidden sm:block'}`}>
                    <p className="text-[13px] font-medium leading-tight">{user.displayName}</p>
                  </div>

                  <div className="relative group cursor-pointer">
                    <div className="h-8 w-8 bg-muted flex items-center justify-center border border-border overflow-hidden rounded-[2px]">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt="User" className="h-full w-full object-cover" />
                      ) : (
                        <UserIcon size={16} className="text-muted-foreground" />
                      )}
                    </div>

                    {/* Dropdown */}
                    <div className={`absolute ${isLeft ? 'bottom-full left-0 mb-2' : 'right-0 top-full mt-1'} w-48 bg-card border border-border shadow-sm hidden group-hover:block p-1`}>
                      <button
                        onClick={onSignOut}
                        className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-muted-foreground hover:bg-muted hover:text-foreground text-left"
                      >
                        <LogOut size={14} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <button
                onClick={onSignIn}
                className="px-5 py-2 bg-foreground text-background text-[13px] font-medium uppercase tracking-wider hover:opacity-90 transition-opacity rounded-none"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Create Job (Sidebar Mobile/Desktop) */}


        </div>

      </div>
    </nav>
  );
};
