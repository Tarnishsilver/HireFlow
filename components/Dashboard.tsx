'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from './layout/Navbar';
import { EmailPanel } from './dashboard/EmailPanel';
import { CalendarPanel } from './dashboard/CalendarPanel';
import { CandidatesPanel } from './dashboard/CandidatesPanel';
import { getDashboardData, createSingleCalendarEvent } from '@/app/actions';
import { RefreshCw, Lock, LogOut, Users, Loader2 } from 'lucide-react';
import { auth, googleProvider } from '@/app/firebase';
import { signInWithPopup, User, signOut, GoogleAuthProvider } from 'firebase/auth';
import { EmailSummary } from '@/lib/summarizer-scrape/gmail';
import { useAuth } from '@/lib/auth/AuthContext';

export default function DashboardPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [data, setData] = useState<any>(null);
    const [loadingData, setLoadingData] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [applications, setApplications] = useState<any[]>([]);
    const [loadingApplications, setLoadingApplications] = useState(false);
    const [lastSync, setLastSync] = useState<Date | null>(null);
    const { user: authUser } = useAuth();

    const getCacheKey = (uid: string) => `hrtech_dashboard_cache_${uid}`;

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
            setLoadingAuth(false);

            if (currentUser) {
                const cacheKey = getCacheKey(currentUser.uid);
                const cached = localStorage.getItem(cacheKey);
                if (cached) {
                    try {
                        const parsedCache = JSON.parse(cached);
                        setData(parsedCache.data);
                        setLastSync(new Date(parsedCache.timestamp));
                    } catch (e) {
                        console.error('Failed to parse cached data:', e);
                    }
                }
            }
        });
        return () => unsubscribe();
    }, []);

    const handleLogin = async () => {
        setError(null);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential?.accessToken;

            if (token) {
                setAccessToken(token);
                fetchData(token);
            } else {
                throw new Error("Could not retrieve Google Access Token. Please try again.");
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to sign in');
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        setData(null);
    };

    const fetchData = async (token: string) => {
        setLoadingData(true);
        setError(null);
        try {
            const result = await getDashboardData(token);
            setData(result);
            setLastSync(new Date());

            if (user) {
                const cacheKey = getCacheKey(user.uid);
                localStorage.setItem(cacheKey, JSON.stringify({
                    data: result,
                    timestamp: Date.now()
                }));
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to fetch dashboard data.');
        } finally {
            setLoadingData(false);
        }
    };

    const fetchApplications = async () => {
        if (!authUser) return;

        setLoadingApplications(true);
        try {
            const idToken = await authUser.getIdToken();
            const response = await fetch('/api/applications', {
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setApplications(data.applications || []);
            }
        } catch (err) {
            console.error('Failed to fetch applications:', err);
        } finally {
            setLoadingApplications(false);
        }
    };

    useEffect(() => {
        if (authUser) {
            fetchApplications();
        }
    }, [authUser]);

    const handleSync = async () => {
        if (!user) return;
        setLoadingData(true);
        try {
            let token = accessToken;

            if (!token) {
                const firebaseToken = await user.getIdToken();
                const tokenRes = await fetch('/api/auth/store-token', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${firebaseToken}`
                    }
                });

                if (tokenRes.ok) {
                    const tokenData = await tokenRes.json();
                    if (tokenData.hasToken && tokenData.google_access_token) {
                        token = tokenData.google_access_token;
                        setAccessToken(token);
                    }
                }
            }

            if (!token) {
                const result = await signInWithPopup(auth, googleProvider);
                const credential = GoogleAuthProvider.credentialFromResult(result);
                token = credential?.accessToken || null;

                if (!token) throw new Error("Failed to get access token");
                setAccessToken(token);
            }

            const res = await import('@/app/actions').then(mod => mod.syncEmailsToCalendar(token));

            if (res.success) {
                alert(`Successfully created ${res.count} calendar events from emails!`);
                fetchData(token);
            }
        } catch (err: any) {
            console.error(err);
            alert("Failed to sync: " + err.message);
        } finally {
            setLoadingData(false);
        }
    };

    const handleNewEvent = async () => {
        const title = prompt('Event title:');
        if (!title) return;

        const dateStr = prompt('Event date (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
        if (!dateStr) return;

        const timeStr = prompt('Event time (HH:MM):', '10:00');
        if (!timeStr) return;

        const duration = prompt('Duration in minutes:', '60');

        try {
            let token = accessToken;

            if (!token) {
                const result = await signInWithPopup(auth, googleProvider);
                const credential = GoogleAuthProvider.credentialFromResult(result);
                token = credential?.accessToken || null;
                if (token) setAccessToken(token);
            }

            if (!token) {
                alert('Please sign in again to add events to calendar.');
                return;
            }

            const startTime = new Date(`${dateStr}T${timeStr}:00`);
            const durationMs = (parseInt(duration || '60')) * 60 * 1000;
            const endTime = new Date(startTime.getTime() + durationMs);

            await createSingleCalendarEvent(token, {
                summary: title,
                description: 'Created via HR Dashboard',
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
            });

            alert(`✅ Added "${title}" to your Google Calendar!`);

            if (token) fetchData(token);
        } catch (err: any) {
            console.error('Failed to create event:', err);
            alert('Failed to create event: ' + err.message);
        }
    };

    const handleAddToCalendar = async (email: EmailSummary) => {
        if (!email.suggested_event) return;

        try {
            let token = accessToken;

            if (!token) {
                const result = await signInWithPopup(auth, googleProvider);
                const credential = GoogleAuthProvider.credentialFromResult(result);
                token = credential?.accessToken || null;
                if (token) setAccessToken(token);
            }

            if (!token) {
                alert('Please sign in again to add events to calendar.');
                return;
            }

            const event = email.suggested_event;
            const startTime = new Date(event.date_str);
            const durationMs = (event.duration_minutes || 60) * 60 * 1000;
            const endTime = new Date(startTime.getTime() + durationMs);

            await createSingleCalendarEvent(token, {
                summary: event.title,
                description: `${event.description || ''}\n\nGenerated from email: ${email.subject}\nFrom: ${email.sender}\n\nAttendees: ${event.attendees?.join(', ') || 'N/A'}`,
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                location: event.location,
            });

            alert(`✅ Added "${event.title}" to your Google Calendar!`);

            if (token) fetchData(token);
        } catch (err: any) {
            console.error('Failed to add event:', err);
            alert('Failed to add event to calendar: ' + err.message);
        }
    };

    if (loadingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" strokeWidth={1.5} />
                    <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20">
            <Navbar user={user} onSignIn={handleLogin} onSignOut={handleLogout} />

            <main className="flex-1 flex flex-col md:flex-row gap-6 p-6 lg:p-8 max-w-[1800px] mx-auto w-full overflow-hidden">
                {!user ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                        <div className="glass-card rounded-3xl p-12 max-w-md">
                            <div className="h-16 w-16 bg-primary/10 flex items-center justify-center rounded-2xl mb-8 mx-auto">
                                <Lock className="text-primary" size={28} strokeWidth={1.5} />
                            </div>
                            <h2 className="text-2xl font-light mb-3">Secure HR Dashboard</h2>
                            <p className="text-muted-foreground text-sm font-light mb-8 leading-relaxed">
                                Access your personalized HR digest and calendar by signing in with your corporate Google account.
                            </p>
                            <button
                                onClick={handleLogin}
                                className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-medium shadow-premium hover:bg-primary/90 transition-all animate-premium-fade"
                            >
                                Sign In with Google
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Loading Overlay */}
                        {loadingData && (
                            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md">
                                <Loader2 className="h-12 w-12 text-primary animate-spin mb-6" strokeWidth={1.5} />
                                <p className="text-lg font-light text-foreground">Syncing with Google Workspace...</p>
                                <p className="mt-2 text-sm text-muted-foreground font-light">Fetching emails, calendar events, and generating summaries</p>
                            </div>
                        )}

                        {/* Dashboard Grid */}
                        <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
                            {/* Calendar Panel - Primary */}
                            <section className="flex-[2] min-w-0 h-[calc(100vh-140px)] flex flex-col">
                                <div className="mb-4 flex justify-between items-center">
                                    <h3 className="text-caption text-muted-foreground px-1">Calendar</h3>
                                    {lastSync && (
                                        <span className="text-[11px] text-muted-foreground font-light">
                                            Last synced: {lastSync.toLocaleTimeString()}
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1 glass-card rounded-2xl overflow-hidden">
                                    <CalendarPanel events={data?.events || []} loading={loadingData} onAddEvent={handleNewEvent} />
                                </div>
                            </section>

                            {/* Candidates Panel */}
                            <section className="flex-1 min-w-0 w-full lg:w-80 h-[calc(100vh-140px)] flex flex-col">
                                <div className="mb-4 flex justify-between items-center">
                                    <h3 className="text-caption text-muted-foreground px-1 flex items-center gap-2">
                                        <Users size={12} strokeWidth={1.5} />
                                        Candidates
                                    </h3>
                                    <button
                                        onClick={fetchApplications}
                                        disabled={loadingApplications}
                                        className="text-[11px] text-muted-foreground px-3 py-1.5 hover:bg-muted/40 rounded-lg transition-all flex items-center gap-1.5 font-medium"
                                    >
                                        <RefreshCw size={11} className={loadingApplications ? "animate-spin" : ""} strokeWidth={1.5} />
                                        Refresh
                                    </button>
                                </div>
                                <div className="flex-1 glass-card rounded-2xl overflow-hidden">
                                    <CandidatesPanel applications={applications} loading={loadingApplications} />
                                </div>
                            </section>

                            {/* Email Panel */}
                            <section className="flex-1 min-w-0 w-full lg:w-80 h-[calc(100vh-140px)] flex flex-col">
                                <div className="mb-4 flex justify-between items-center">
                                    <h3 className="text-caption text-muted-foreground px-1">Emails</h3>
                                    <button
                                        onClick={!data ? handleLogin : handleSync}
                                        disabled={loadingData}
                                        className="text-[11px] text-muted-foreground px-3 py-1.5 hover:bg-muted/40 rounded-lg transition-all flex items-center gap-1.5 font-medium"
                                    >
                                        <RefreshCw size={11} className={loadingData ? "animate-spin" : ""} strokeWidth={1.5} />
                                        {!data ? 'Sync Now' : 'Sync'}
                                    </button>
                                </div>
                                <div className="flex-1 glass-card rounded-2xl overflow-hidden">
                                    {!data && !loadingData ? (
                                        <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                                            <p className="text-sm text-muted-foreground font-light mb-6">
                                                Sync with Google to load emails
                                            </p>
                                            <button
                                                onClick={handleLogin}
                                                className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-all"
                                            >
                                                Sync Data
                                            </button>
                                        </div>
                                    ) : (
                                        <EmailPanel emails={data?.emails || []} loading={loadingData} onAddToCalendar={handleAddToCalendar} />
                                    )}
                                </div>
                            </section>
                        </div>
                    </>
                )}
            </main>

            {/* Footer */}
            <footer className="h-12 border-t border-border/50 glass flex items-center px-8">
                <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-light">
                    <div className="flex items-center gap-2">
                        <span className={`h-1.5 w-1.5 rounded-full ${user ? 'bg-chart-2 animate-pulse' : 'bg-muted-foreground/30'}`}></span>
                        {user ? 'Systems Active' : 'Waiting for Auth'}
                    </div>
                    {user && (
                        <>
                            <div className="h-3 w-px bg-border/50"></div>
                            <div>Cloud sync: {data ? 'Online' : 'Pending'}</div>
                            <div className="h-3 w-px bg-border/50"></div>
                            <button onClick={handleLogout} className="hover:text-foreground flex items-center gap-1.5 transition-colors">
                                <LogOut size={11} strokeWidth={1.5} />
                                Sign Out
                            </button>
                        </>
                    )}
                </div>
                <div className="ml-auto text-[11px] text-muted-foreground font-light">
                    © 2026 HR Pulse Enterprise
                </div>
            </footer>
        </div>
    );
}
