'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from './layout/Navbar';
import { EmailPanel } from './dashboard/EmailPanel';
import { CalendarPanel } from './dashboard/CalendarPanel';
import { CandidatesPanel } from './dashboard/CandidatesPanel';
import { getDashboardData, createSingleCalendarEvent } from '@/app/actions';
import { RefreshCw, Lock, LogOut, Users } from 'lucide-react';
import { PrismFluxLoader } from '@/components/ui/prism-flux-loader';
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

    // Cache key for localStorage
    const getCacheKey = (uid: string) => `hrtech_dashboard_cache_${uid}`;

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
            setLoadingAuth(false);

            // Load cached data immediately if user is logged in
            if (currentUser) {
                const cacheKey = getCacheKey(currentUser.uid);
                const cached = localStorage.getItem(cacheKey);
                if (cached) {
                    try {
                        const parsedCache = JSON.parse(cached);
                        setData(parsedCache.data);
                        setLastSync(new Date(parsedCache.timestamp));
                        console.log('[Dashboard] Loaded cached data from', new Date(parsedCache.timestamp));
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

            // Save to localStorage cache
            if (user) {
                const cacheKey = getCacheKey(user.uid);
                localStorage.setItem(cacheKey, JSON.stringify({
                    data: result,
                    timestamp: Date.now()
                }));
                console.log('[Dashboard] Cached data to localStorage');
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to fetch dashboard data. Your session may have expired.');
        } finally {
            setLoadingData(false);
        }
    };

    // Fetch applications for HR users
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

    // Fetch applications when authUser changes
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

            // First, try to get stored token from backend (from HR login)
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
                        console.log('[Dashboard] Using stored Google token');
                    }
                }
            }

            // Only if no stored token, prompt for re-auth
            if (!token) {
                console.log('[Dashboard] No stored token, prompting for OAuth');
                const result = await signInWithPopup(auth, googleProvider);
                const credential = GoogleAuthProvider.credentialFromResult(result);
                token = credential?.accessToken || null;

                if (!token) throw new Error("Failed to get access token");
                setAccessToken(token);
            }

            const res = await import('@/app/actions').then(mod => mod.syncEmailsToCalendar(token));

            if (res.success) {
                alert(`Successfully created ${res.count} calendar events from emails!`);
                // Refresh data
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
        // Prompt user for event details
        const title = prompt('Event title:');
        if (!title) return;

        const dateStr = prompt('Event date (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
        if (!dateStr) return;

        const timeStr = prompt('Event time (HH:MM):', '10:00');
        if (!timeStr) return;

        const duration = prompt('Duration in minutes:', '60');

        try {
            let token = accessToken;

            // If we don't have a token, we need to re-authenticate
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

            // Refresh calendar data
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

            // If we don't have a token, we need to re-authenticate
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

            // Refresh calendar data
            if (token) fetchData(token);
        } catch (err: any) {
            console.error('Failed to add event:', err);
            alert('Failed to add event to calendar: ' + err.message);
        }
    };

    if (loadingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <PrismFluxLoader size={40} speed={4} />
            </div>
        );
    }

    return (
        <div className="dashboard min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20">
            <Navbar user={user} onSignIn={handleLogin} onSignOut={handleLogout} />

            <main className="flex-1 flex flex-col md:flex-row gap-6 p-6 md:p-8 max-w-7xl mx-auto w-full overflow-hidden">
                {!user ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-card rounded-2xl border border-border shadow-sm">
                        <div className="h-16 w-16 bg-primary/10 flex items-center justify-center rounded-2xl mb-6">
                            <Lock className="text-primary" size={32} />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Secure HR Dashboard</h2>
                        <p className="text-muted-foreground max-w-md mb-8">
                            Access your personalized HR digest and calendar by signing in with your corporate Google account.
                        </p>
                        <button
                            onClick={handleLogin}
                            className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
                        >
                            Sign In with Google
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Loading Overlay for Sync Operations */}
                        {loadingData && (
                            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
                                <PrismFluxLoader size={60} speed={4} />
                                <p className="mt-6 text-lg font-medium text-foreground">Syncing with Google Workspace...</p>
                                <p className="mt-2 text-sm text-muted-foreground">Fetching emails, calendar events, and generating summaries</p>
                            </div>
                        )}

                        {/* Always show dashboard layout - calendar visible even before sync */}
                        <div className="flex flex-col md:flex-row gap-4 flex-1 min-h-0">
                            {/* Left Panel: Calendar (2/4 of screen) - ALWAYS VISIBLE */}
                            <section className="flex-[2] min-w-0 h-[calc(100vh-120px)] md:h-[calc(100vh-100px)] flex flex-col">
                                <div className="mb-2 flex justify-between items-center">
                                    <h3 className="font-bold text-xs uppercase tracking-wider px-1">Calendar</h3>
                                    {lastSync && (
                                        <span className="text-[10px] text-muted-foreground">
                                            Last synced: {lastSync.toLocaleTimeString()}
                                        </span>
                                    )}
                                </div>
                                <CalendarPanel events={data?.events || []} loading={loadingData} onAddEvent={handleNewEvent} />
                            </section>

                            {/* Middle Panel: Candidates (1/4 of screen) */}
                            <section className="flex-1 min-w-0 w-full md:w-80 h-[calc(100vh-120px)] md:h-[calc(100vh-100px)] flex flex-col">
                                <div className="mb-2 flex justify-between items-center">
                                    <h3 className="font-bold text-xs uppercase tracking-wider px-1 flex items-center gap-1">
                                        <Users size={12} />
                                        Candidates
                                    </h3>
                                    <button
                                        onClick={fetchApplications}
                                        disabled={loadingApplications}
                                        className="text-[10px] border border-foreground/20 text-foreground px-2 py-1 hover:bg-foreground hover:text-background transition-colors font-medium flex items-center gap-1"
                                    >
                                        <RefreshCw size={10} className={loadingApplications ? "animate-spin" : ""} />
                                        Refresh
                                    </button>
                                </div>
                                <div className="flex-1 min-h-0">
                                    <CandidatesPanel applications={applications} loading={loadingApplications} />
                                </div>
                            </section>

                            {/* Right Panel: Email Summary (1/4 of screen) */}
                            <section className="flex-1 min-w-0 w-full md:w-80 h-[calc(100vh-120px)] md:h-[calc(100vh-100px)] flex flex-col">
                                <div className="mb-2 flex justify-between items-center">
                                    <h3 className="font-bold text-xs uppercase tracking-wider px-1">Emails</h3>
                                    <button
                                        onClick={!data ? handleLogin : handleSync}
                                        disabled={loadingData}
                                        className="text-[10px] border border-foreground/20 text-foreground px-2 py-1 hover:bg-foreground hover:text-background transition-colors font-medium flex items-center gap-1"
                                    >
                                        <RefreshCw size={10} className={loadingData ? "animate-spin" : ""} />
                                        {!data ? 'Sync Now' : 'Sync'}
                                    </button>
                                </div>
                                <div className="flex-1 min-h-0">
                                    {!data && !loadingData ? (
                                        <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-card border border-border rounded-lg">
                                            <p className="text-sm text-muted-foreground mb-4">
                                                Sync with Google to load emails
                                            </p>
                                            <button
                                                onClick={handleLogin}
                                                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90"
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

            <footer className="h-10 border-t border-border bg-card/50 flex items-center px-8 text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${user ? 'bg-green-500 animate-pulse' : 'bg-muted'}`}></span>
                        {user ? 'Systems Active' : 'Waiting for Auth'}
                    </div>
                    {user && (
                        <>
                            <div className="h-3 w-px bg-border"></div>
                            <div>Cloud sync: {data ? 'Online' : 'Pending'}</div>
                            <div className="h-3 w-px bg-border"></div>
                            <button onClick={handleLogout} className="hover:text-foreground flex items-center gap-1">
                                <LogOut size={10} />
                                Sign Out
                            </button>
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
