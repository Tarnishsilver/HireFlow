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
        if (tab && (tab === 'overview' || tab === 'jobs')) {
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
        <div className="min-h-screen bg-background flex flex-col">
            {/* Floating Navbar */}
            <FadeIn direction="down" className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-6xl">
                <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl px-8 py-4 flex items-center justify-between transition-all duration-300 hover:bg-black/40 hover:border-white/20">

                    {/* Left: Branding */}
                    <div className="flex items-center gap-4">

                        <span className="font-bold text-xl tracking-tight hidden sm:block text-white/90">HR Dashboard</span>
                    </div>

                    {/* Center: Navigation Links - Colored Glassy Buttons */}
                    <div className="hidden lg:flex items-center gap-4 absolute left-1/2 -translate-x-1/2">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-4 py-2 rounded-full text-sm font-bold tracking-wide transition-all hover:scale-105 flex items-center gap-2 ${activeTab === 'overview'
                                ? 'bg-purple-500/30 text-purple-300 border border-purple-500/30'
                                : 'bg-purple-500/10 text-purple-400 border border-transparent hover:bg-purple-500/20'
                                }`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('jobs')}
                            className={`px-4 py-2 rounded-full text-sm font-bold tracking-wide transition-all hover:scale-105 flex items-center gap-2 ${activeTab === 'jobs'
                                ? 'bg-orange-500/30 text-orange-300 border border-orange-500/30'
                                : 'bg-orange-500/10 text-orange-400 border border-transparent hover:bg-orange-500/20'
                                }`}
                        >
                            Jobs ({jobs.length})
                        </button>
                        <Link
                            href="/policy"
                            className="px-4 py-2 rounded-full text-sm font-bold tracking-wide bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all hover:scale-105 flex items-center gap-2"
                        >
                            <FileText className="w-4 h-4" />
                            Policy Center
                        </Link>
                        <Link
                            href="/jobopening"
                            className="px-4 py-2 rounded-full text-sm font-bold tracking-wide text-muted-foreground hover:bg-white/10 hover:text-white transition-all hover:scale-105 flex items-center gap-2"
                        >
                            Public View <Eye className="w-4 h-4" />
                        </Link>
                    </div>

                    {/* Right: Actions & Profile */}
                    <div className="flex items-center gap-4">
                        <Link
                            href="/jobopening/create"
                            className="hidden sm:flex items-center gap-2 px-6 py-2.5 bg-white/90 hover:bg-white text-black rounded-full text-sm font-bold transition-all shadow-lg hover:shadow-white/20 hover:-translate-y-0.5"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Create Job</span>
                        </Link>

                        {/* Profile Pill */}
                        <div className="flex items-center gap-3 pl-4 border-l border-white/10 ml-2">
                            <div className="hidden xl:flex flex-col items-end leading-tight">
                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Logged in as</span>
                                <span className="text-sm font-medium max-w-[120px] truncate text-white">{user.email?.split('@')[0]}</span>
                            </div>
                            <button
                                onClick={() => signOut()}
                                className="h-10 w-10 rounded-full bg-white/5 hover:bg-red-500/20 hover:text-red-500 flex items-center justify-center transition-all border border-white/5 hover:border-red-500/20"
                                title="Sign Out"
                            >
                                <LogOut className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </FadeIn>

            {/* Mobile Nav Overlay (Bottom fixed?) or just stacking? */}
            {/* For now, keep simple mobile nav if needed, or rely on the floating nav scaling down. 
                The floating nav above has hidden classes for some elements. 
                Let's add a small mobile menu if needed, but the user image showed desktop. 
                I'll leave the floating nav as the primary.
            */}

            {/* Mobile Bottom Bar for Tabs (since they are hidden in floating nav on small screens) */}
            <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] bg-black/80 backdrop-blur-md border border-white/10 rounded-full p-2 flex justify-between shadow-xl">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`flex-1 flex flex-col items-center justify-center text-xs py-2 rounded-full ${activeTab === 'overview' ? 'bg-white/10 text-white' : 'text-muted-foreground'}`}
                >
                    <Calendar className="h-4 w-4 mb-1" />
                    Overview
                </button>
                <button
                    onClick={() => setActiveTab('jobs')}
                    className={`flex-1 flex flex-col items-center justify-center text-xs py-2 rounded-full ${activeTab === 'jobs' ? 'bg-white/10 text-white' : 'text-muted-foreground'}`}
                >
                    <Briefcase className="h-4 w-4 mb-1" />
                    Jobs
                </button>
                <Link href="/jobopening/create" className="flex-1 flex flex-col items-center justify-center text-xs py-2 text-green-500">
                    <Plus className="h-4 w-4 mb-1" />
                    Create
                </Link>
            </div>

            {/* Main Content */}
            <main className="flex-1 max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 pt-24 pb-6 relative bg-background">
                {/* Loading Overlay - Removed per request */}

                {activeTab === 'overview' ? (
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
                ) : (
                    /* Jobs Tab */
                    <FadeInStagger key="jobs">
                        <FadeIn>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold">Your Job Openings</h2>
                                    <p className="text-muted-foreground">Manage your job postings and view applications</p>
                                </div>
                            </div>
                        </FadeIn>

                        {loadingJobs ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : jobs.length === 0 ? (
                            <FadeIn>
                                <div className="text-center py-16 bg-card border border-border rounded-2xl">
                                    <div className="inline-flex items-center justify-center h-16 w-16 bg-muted rounded-2xl mb-4">
                                        <Briefcase className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">No Job Openings Yet</h3>
                                    <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                                        Create your first job opening to start receiving applications.
                                    </p>
                                    <Link
                                        href="/jobopening/create"
                                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
                                    >
                                        <Plus className="h-5 w-5" />
                                        Create Job Opening
                                    </Link>
                                </div>
                            </FadeIn>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {jobs.map((job) => (
                                    <FadeIn
                                        key={job.id}
                                        className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h3 className="font-semibold line-clamp-1">{job.title}</h3>
                                                <p className="text-sm text-muted-foreground">{job.company_name}</p>
                                            </div>
                                            <span
                                                className={`px-2 py-0.5 text-xs font-medium rounded-full ${job.status === 'LIVE'
                                                    ? 'bg-green-500/10 text-green-600'
                                                    : job.status === 'CLOSED'
                                                        ? 'bg-red-500/10 text-red-600'
                                                        : 'bg-yellow-500/10 text-yellow-600'
                                                    }`}
                                            >
                                                {job.status}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-4">
                                            <span className="flex items-center gap-1">
                                                <MapPin className="h-4 w-4" />
                                                {job.location}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-4 w-4" />
                                                {job.job_type}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between pt-3 border-t border-border">
                                            <Link
                                                href={`/applications/${job.id}`}
                                                className="flex items-center gap-1.5 text-sm hover:underline group"
                                            >
                                                <Users className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                                <span className="font-medium group-hover:text-primary transition-colors">{job._count?.applications || 0}</span>
                                                <span className="text-muted-foreground group-hover:text-primary transition-colors">applications</span>
                                            </Link>
                                            <div className="flex items-center gap-3">
                                                <Link
                                                    href={`/jobopening/${job.id}`}
                                                    className="text-sm text-primary font-medium hover:underline"
                                                >
                                                    Details
                                                </Link>
                                            </div>
                                        </div>
                                    </FadeIn>
                                ))}
                            </div>
                        )}
                    </FadeInStagger>
                )}
            </main>



            {/* Event Creation Modal */}
            <CreateEventModal
                isOpen={isEventModalOpen}
                onClose={() => setIsEventModalOpen(false)}
                onSubmit={handleCreateEventSubmit}
                isLoading={creatingEvent}
            />
        </div>
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
