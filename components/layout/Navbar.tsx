'use client';

import React from 'react';
import { User, LogOut, LogIn } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';

interface NavbarProps {
  user?: FirebaseUser | null;
  onSignIn?: () => void;
  onSignOut?: () => void;
}

export const Navbar = ({ user, onSignIn, onSignOut }: NavbarProps) => {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background">
      <div className="flex h-14 items-center px-6 md:px-8">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 bg-foreground flex items-center justify-center">
            <span className="text-background font-bold text-sm">HR</span>
          </div>
          <span className="text-sm font-bold uppercase tracking-widest">Dashboard</span>
        </div>

        {/* Right Side */}
        <div className="ml-auto flex items-center gap-4">
          {user ? (
            <>
              <div className="h-6 w-px bg-border"></div>

              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-medium leading-none">{user.displayName}</p>
                  <p className="text-[10px] text-muted-foreground">{user.email}</p>
                </div>
                <div className="h-7 w-7 bg-muted flex items-center justify-center border border-border overflow-hidden">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="User" className="h-full w-full object-cover" />
                  ) : (
                    <User size={14} className="text-muted-foreground" />
                  )}
                </div>
                <button
                  onClick={onSignOut}
                  className="p-1.5 text-muted-foreground hover:bg-muted transition-colors border border-transparent hover:border-border"
                  title="Sign Out"
                >
                  <LogOut size={14} />
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={onSignIn}
              className="flex items-center gap-2 px-4 py-2 bg-foreground text-background text-xs font-bold uppercase tracking-wider hover:opacity-80 transition-opacity"
            >
              <LogIn size={14} />
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
