'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { EmailPanel } from '@/components/dashboard/EmailPanel';
import { CalendarPanel } from '@/components/dashboard/CalendarPanel';
import { getDashboardData, createSingleCalendarEvent, getDashboardCache } from '@/app/actions';
import {
    Briefcase, Plus, MapPin, Clock, Users, Loader2, LogOut, Eye,
    RefreshCw, ShieldAlert, Calendar, Mail, FileText, Flame, Share2
} from 'lucide-react';

// import { PrismFluxLoader } from '@/components/ui/prism-flux-loader'; // Removed per user request
import { auth, googleProvider } from '@/app/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { EmailSummary } from '@/lib/summarizer-scrape/gmail';
import { FadeIn, FadeInStagger } from '@/components/animations/FadeIn';
import { CreateEventModal } from '@/components/dashboard/CreateEventModal';
import { MainLayout } from '@/components/layout/MainLayout';

interface Job {
    id: string;
    title: string;
    company_name: string;
    location: string;
    job_type: string;
    experience_level: string;
    status: string;
    created_at: string;
    _count: {
        applications: number;
    };
}

type DashboardTab = 'overview' | 'jobs';

function DashboardContent() {
    const router = useRouter();
    const { user, dbUser, role, loading, signOut } = useAuth();

    // Dashboard data state
    const [data, setData] = useState<any>(null);
    const [cacheLoaded, setCacheLoaded] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Jobs state
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loadingJobs, setLoadingJobs] = useState(true);

    // Modal state
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [creatingEvent, setCreatingEvent] = useState(false);

    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

    // Sync state with URL
    useEffect(() => {
        const tab = searchParams.get('tab') as DashboardTab;
        if (tab && (tab === 'overview')) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    // Load from cache on mount
    useEffect(() => {
        async function loadCache() {
            if (user?.uid && !cacheLoaded) {
                try {
                    const cachedData = await getDashboardCache(user.uid);
                    if (cachedData) {
                        setData(cachedData);
                    }
                } catch (err) {
                    console.error('Failed to load cache:', err);
                }
                setCacheLoaded(true);
            }
        }
        loadCache();
    }, [user?.uid, cacheLoaded]);

    // Auto-fetch data using stored token on mount
    useEffect(() => {
        async function autoFetchWithStoredToken() {
            // Only skip if no user or if we ALREADY have the token
            if (!user || accessToken) return;

            try {
                const firebaseToken = await user.getIdToken();
                const tokenRes = await fetch('/api/auth/store-token', {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${firebaseToken}` }
                });

                if (tokenRes.ok) {
                    const tokenData = await tokenRes.json();
                    if (tokenData.hasToken && tokenData.google_access_token) {
                        console.log('[Dashboard] Auto-fetching with stored token');
                        setAccessToken(tokenData.google_access_token);
                        // Only fetch fresh data if we don't have any data yet
                        if (!data) {
                            fetchDashboardData(tokenData.google_access_token);
                        }
                    }
                }
            } catch (err) {
                console.error('Failed to auto-fetch:', err);
            }
        }

        // Wait a bit for cache to load first
        const timer = setTimeout(autoFetchWithStoredToken, 500);
        return () => clearTimeout(timer);
    }, [user, accessToken, data]);

    // Protect route - redirect if not HR
    useEffect(() => {
        if (!loading && (!user || role !== 'HR')) {
            router.push('/');
        }
    }, [user, role, loading, router]);

    // Fetch HR's jobs
    useEffect(() => {
        async function fetchJobs() {
            if (!dbUser?.id) return;

            try {
                const response = await fetch(`/api/job/list?internal=true`);
                const data = await response.json();

                if (response.ok) {
                    setJobs(data.jobs);
                }
            } catch (err) {
                console.error('Failed to fetch jobs:', err);
            } finally {
                setLoadingJobs(false);
            }
        }

        if (dbUser?.id) {
            fetchJobs();
        } else if (!loading) {
            setLoadingJobs(false);
        }
    }, [dbUser?.id, loading]);

    // Connect to Google Workspace with dynamic scopes
    const handleConnectGoogle = async () => {
        setError(null);
        try {
            const workspaceProvider = new GoogleAuthProvider();
            workspaceProvider.addScope('https://www.googleapis.com/auth/gmail.readonly');
            workspaceProvider.addScope('https://www.googleapis.com/auth/gmail.send');
            workspaceProvider.addScope('https://www.googleapis.com/auth/calendar');
            workspaceProvider.addScope('https://www.googleapis.com/auth/userinfo.email');

            workspaceProvider.setCustomParameters({
                access_type: 'offline',
                prompt: 'consent'
            });

            const result = await signInWithPopup(auth, workspaceProvider);
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential?.accessToken;

            if (token) {
                setAccessToken(token);
                fetchDashboardData(token);
            } else {
                throw new Error("Could not retrieve Google Access Token. Please try again.");
            }
        } catch (err: any) {
            console.error(err);
            if (err.code !== 'auth/cancelled-popup-request') {
                const message = err instanceof Error ? err.message : 'Unknown error';
                setError(message || 'Failed to connect to Google Workspace');
            }
        }
    };

    // Fetch dashboard data (emails, calendar)
    const fetchDashboardData = async (token: string) => {
        setLoadingData(true);
        setError(null);
        try {
            const result = await getDashboardData(token, user?.uid);
            setData(result);
        } catch (err: unknown) {
            console.error(err);
            const message = err instanceof Error ? err.message : 'Unknown error';
            if (!data) {
                setError(message || 'Failed to fetch dashboard data');
            }
        } finally {
            setLoadingData(false);
        }
    };

    // Handle sync button
    const handleSync = async () => {
        setLoadingData(true);
        try {
            let token = accessToken;

            // Check if we need to sign in (synchronous check against state)
            if (!token) {
                console.log('[Dashboard] No stored token found in state, prompting for OAuth');
                const result = await signInWithPopup(auth, googleProvider);
                const credential = GoogleAuthProvider.credentialFromResult(result);
                token = credential?.accessToken || null;

                if (!token) throw new Error("Failed to get access token");
                setAccessToken(token);

                // Store token in background (don't await)
                if (user) {
                    user.getIdToken().then(firebaseToken => {
                        fetch('/api/auth/store-token', {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${firebaseToken}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                google_access_token: token,
                                token_expiry: Date.now() + 3600 * 1000 // approx 1 hour
                            })
                        }).catch(e => console.error('Background token store failed:', e));
                    });
                }
            }

            const res = await import('@/app/actions').then(mod => mod.syncEmailsToCalendar(token));

            if (res.success) {
                alert(`Successfully created ${res.count} calendar events from emails!`);
                fetchDashboardData(token);
            }
        } catch (err: any) {
            console.error(err);
            if (err.code !== 'auth/cancelled-popup-request') {
                const message = err instanceof Error ? err.message : 'Unknown error';
                alert("Failed to sync: " + message);
            }
        } finally {
            setLoadingData(false);
        }
    };

    // Handle adding email event to calendar
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

            if (token) fetchDashboardData(token);
        } catch (err: unknown) {
            console.error('Failed to add event:', err);
            const message = err instanceof Error ? err.message : 'Unknown error';
            alert('Failed to add event to calendar: ' + message);
        }
    };

    // Handle create event click (opens modal)
    const handleNewEvent = () => {
        setIsEventModalOpen(true);
    };

    // Handle form submission from modal
    const handleCreateEventSubmit = async (data: { title: string; date: string; time: string; duration: string }) => {
        setCreatingEvent(true);
        try {
            let token = accessToken;

            // Check if we need to sign in
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

            const startTime = new Date(`${data.date}T${data.time}:00`);
            const durationMs = (parseInt(data.duration || '60')) * 60 * 1000;
            const endTime = new Date(startTime.getTime() + durationMs);

            await createSingleCalendarEvent(token, {
                summary: data.title,
                description: 'Created via HR Dashboard',
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
            });

            alert(`✅ Added "${data.title}" to your Google Calendar!`);
            setIsEventModalOpen(false);

            if (token) fetchDashboardData(token);
        } catch (err: unknown) {
            console.error('Failed to create event:', err);
            const message = err instanceof Error ? err.message : 'Unknown error';
            alert('Failed to create event: ' + message);
        } finally {
            setCreatingEvent(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }



    // ... (other imports remain, but I need to make sure I don't delete them. I'll just replace the component render part mainly, but since I have to replace a large chunk, I'll be careful)

    if (!user || role !== 'HR') {
        return null;
    }

    return (
        <MainLayout user={user} onSignIn={() => { }} onSignOut={signOut}>
            {/* Main Content */}
            <div className="px-4 sm:px-6 lg:px-8 py-6 relative bg-background">
                /* Overview Tab - Email & Calendar */
                <FadeInStagger key="overview">
                    <FadeIn>
                        {/* Dashboard Cards Removed per request - moved Policy to Nav */}
                    </FadeIn>
                    <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0 relative">

                        {/* Left Panel: Calendar (3/4 of screen) - Always present */}
                        <div className="flex-[3] min-w-0 h-[calc(100vh-130px)] flex flex-col">
                            <CalendarPanel events={data?.events || []} loading={loadingData && !data} onAddEvent={handleNewEvent} />
                        </div>

                        {/* Right Panel: Email Summary (1/4 of screen) - Always present */}
                        <div className="flex-1 min-w-0 w-full lg:w-80 h-[calc(100vh-130px)] flex flex-col">
                            <div className="mb-2 flex justify-between items-center">
                                <h3 className="font-bold text-xs uppercase tracking-wider px-1">Emails</h3>
                                <button
                                    onClick={handleSync}
                                    disabled={loadingData}
                                    className="text-[10px] border border-foreground/20 text-foreground px-2 py-1 hover:bg-foreground hover:text-background transition-colors font-medium flex items-center gap-1"
                                >
                                    <RefreshCw size={10} className={loadingData ? "animate-spin" : ""} />
                                    Sync
                                </button>
                            </div>
                            <div className="flex-1 min-h-0">
                                <EmailPanel emails={data?.emails || []} loading={loadingData && !data} onAddToCalendar={handleAddToCalendar} />
                            </div>
                        </div>
                    </div>

                    {/* Sync Status Footer - inside Overview Tab */}
                    {data?.last_sync && (
                        <div className="mt-4 flex items-center justify-between px-1">
                            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1.5">
                                <Clock size={10} />
                                Last synced: {new Date(data.last_sync).toLocaleString()}
                            </span>
                            {loadingData && (
                                <span className="text-[10px] text-primary font-bold uppercase tracking-widest flex items-center gap-2">
                                    <RefreshCw size={10} className="animate-spin" />
                                    Syncing fresh data...
                                </span>
                            )}
                        </div>
                    )}

                    {error && (
                        <FadeIn>
                            <div className="mt-4 flex flex-col items-center justify-center text-center p-6 bg-card rounded-2xl border border-destructive/20">
                                <ShieldAlert className="text-destructive mb-2" size={32} />
                                <h2 className="text-lg font-bold mb-1 text-destructive">Connection Error</h2>
                                <p className="text-xs text-muted-foreground max-w-md mb-4">{error}</p>
                                <button
                                    onClick={handleConnectGoogle}
                                    className="px-4 py-1.5 bg-muted rounded-md font-semibold hover:bg-muted/80 transition-colors text-xs"
                                >
                                    Reconnect
                                </button>
                            </div>
                        </FadeIn>
                    )}
                </FadeInStagger>
            </div>

            {/* Event Creation Modal */}
            <CreateEventModal
                isOpen={isEventModalOpen}
                onClose={() => setIsEventModalOpen(false)}
                onSubmit={handleCreateEventSubmit}
                isLoading={creatingEvent}
            />
        </MainLayout>
    );
}

export default function HRDashboardPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <DashboardContent />
        </Suspense>
    );
}
