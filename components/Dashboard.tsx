'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from './layout/Navbar';
import { EmailPanel } from './dashboard/EmailPanel';
import { CalendarPanel } from './dashboard/CalendarPanel';
import { useSession, signIn } from 'next-auth/react';
import { getDashboardData } from '@/app/actions';
import { ShieldAlert, RefreshCw, Lock } from 'lucide-react';

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (status === 'authenticated') {
            fetchData();
        }
    }, [status]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await getDashboardData();
            setData(result);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to fetch dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <RefreshCw className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20">
            <Navbar />

            <main className="flex-1 flex flex-col md:flex-row gap-6 p-6 md:p-8 max-w-7xl mx-auto w-full overflow-hidden">
                {!session ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-card rounded-2xl border border-border shadow-sm">
                        <div className="h-16 w-16 bg-primary/10 flex items-center justify-center rounded-2xl mb-6">
                            <Lock className="text-primary" size={32} />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Secure HR Dashboard</h2>
                        <p className="text-muted-foreground max-w-md mb-8">
                            Access your personalized HR digest and calendar by signing in with your corporate Google account.
                        </p>
                        <button
                            onClick={() => signIn('google')}
                            className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
                        >
                            Sign In to Continue
                        </button>
                    </div>
                ) : error ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-card rounded-2xl border border-destructive/20 select-none">
                        <ShieldAlert className="text-destructive mb-4" size={48} />
                        <h2 className="text-xl font-bold mb-2 text-destructive">Connection Error</h2>
                        <p className="text-muted-foreground max-w-md mb-6">{error}</p>
                        <button
                            onClick={fetchData}
                            className="px-6 py-2 bg-muted rounded-md font-semibold hover:bg-muted/80 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Left Panel: Email Summary */}
                        <section className="flex-1 min-w-0 h-[calc(100vh-160px)] md:h-[calc(100vh-140px)]">
                            <EmailPanel emails={data?.emails || []} loading={loading} />
                        </section>

                        {/* Right Panel: Calendar */}
                        <section className="flex-1 min-w-0 h-[calc(100vh-160px)] md:h-[calc(100vh-140px)]">
                            <CalendarPanel events={data?.events || []} loading={loading} />
                        </section>
                    </>
                )}
            </main>

            <footer className="h-10 border-t border-border bg-card/50 flex items-center px-8 text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${session ? 'bg-green-500 animate-pulse' : 'bg-muted'}`}></span>
                        {session ? 'Systems Active' : 'Waiting for Auth'}
                    </div>
                    {session && (
                        <>
                            <div className="h-3 w-px bg-border"></div>
                            <div>Cloud sync: Online</div>
                        </>
                    )}
                </div>
                <div className="ml-auto">
                    © 2026 HR Pulse Enterprise
                </div>
            </footer>
        </div>
    );
}
