'use client';


import React from 'react';
import { User, Bell, LogOut, LogIn } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';

interface NavbarProps {
  user?: FirebaseUser | null;
  onSignIn?: () => void;
  onSignOut?: () => void;
}

export const Navbar = ({ user, onSignIn, onSignOut }: NavbarProps) => {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-sm">
      <div className="flex h-16 items-center px-6 md:px-8">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">H</span>
          </div>
          <span className="text-xl font-semibold tracking-tight">HR Pulse</span>
        </div>

        <div className="ml-auto flex items-center gap-4">
          {user ? (
            <>
              <button className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors relative">
                <Bell size={20} />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive border-2 border-card"></span>
              </button>

              <div className="h-8 w-px bg-border mx-2"></div>

              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium leading-none">{user.displayName}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center border border-border overflow-hidden">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="User" className="h-full w-full object-cover" />
                  ) : (
                    <User size={20} className="text-muted-foreground" />
                  )}
                </div>
                <button
                  onClick={onSignOut}
                  className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors"
                  title="Sign Out"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={onSignIn}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <LogIn size={18} />
              Sign In with Google
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

