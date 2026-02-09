'use client';

import React, { useEffect, useState } from 'react';
import { useUIStore } from '@/lib/store/useUIStore';
import { Navbar } from '@/components/layout/Navbar';
import { CopilotWidget } from '@/components/copilot/CopilotWidget';
import { User } from 'firebase/auth';

interface MainLayoutProps {
    children: React.ReactNode;
    user?: User | null;
    onSignIn?: () => void;
    onSignOut?: () => void;
}

export const MainLayout = ({ children, user, onSignIn, onSignOut }: MainLayoutProps) => {
    const { navbarPosition } = useUIStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent hydration mismatch for position preference
    if (!mounted) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Navbar user={user} onSignIn={onSignIn} onSignOut={onSignOut} />
                <main className="flex-1 w-full relative">
                    {children}
                </main>
            </div>
        );
    }

    if (navbarPosition === 'left') {
        return (
            <div className="min-h-screen bg-background flex flex-row">
                <Navbar user={user} onSignIn={onSignIn} onSignOut={onSignOut} position="left" />
                <main className="flex-1 min-w-0 transition-all duration-300 ml-64">
                    {children}
                </main>
                <CopilotWidget />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar user={user} onSignIn={onSignIn} onSignOut={onSignOut} position="top" />
            <main className="flex-1 w-full relative transition-all duration-300">
                {children}
            </main>
            <CopilotWidget />
        </div>
    );
};
