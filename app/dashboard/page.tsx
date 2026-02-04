'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { EmailPanel } from '@/components/dashboard/EmailPanel';
import { CalendarPanel } from '@/components/dashboard/CalendarPanel';
import { getDashboardData, createSingleCalendarEvent } from '@/app/actions';
import {
    Briefcase, Plus, MapPin, Clock, Users, Loader2, LogOut, Eye,
    RefreshCw, ShieldAlert, Calendar, Mail
} from 'lucide-react';
import { PrismFluxLoader } from '@/components/ui/prism-flux-loader';
import { auth, googleProvider } from '@/app/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { EmailSummary } from '@/lib/summarizer-scrape/gmail';

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
    const [loadingData, setLoadingData] = useState(false);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Jobs state
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loadingJobs, setLoadingJobs] = useState(true);

    const searchParams = useSearchParams();
    const defaultTab = searchParams.get('tab') as DashboardTab || 'overview';

    // Tab state
    const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

    // Sync state with URL
    useEffect(() => {
        const tab = searchParams.get('tab') as DashboardTab;
        if (tab && (tab === 'overview' || tab === 'jobs')) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    // Protect route - redirect if not HR
    useEffect(() => {
        if (!loading && (!user || role !== 'HR')) {
            router.push('/login');
        }
    }, [user, role, loading, router]);

    // Fetch HR's jobs
    useEffect(() => {
        async function fetchJobs() {
            if (!dbUser?.id) return;

            try {
                // Fetch all jobs for the organization (internal view)
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

    // Connect to Google Workspace
    const handleConnectGoogle = async () => {
        setError(null);
        try {
            const result = await signInWithPopup(auth, googleProvider);
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
            setError(err.message || 'Failed to connect to Google Workspace');
        }
    };

    // Fetch dashboard data (emails, calendar)
    const fetchDashboardData = async (token: string) => {
        setLoadingData(true);
        setError(null);
        try {
            const result = await getDashboardData(token);
            setData(result);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to fetch dashboard data');
        } finally {
            setLoadingData(false);
        }
    };

    // Handle sync button
    const handleSync = async () => {
        setLoadingData(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential?.accessToken;

            if (!token) throw new Error("Failed to get access token");
            setAccessToken(token);

            const res = await import('@/app/actions').then(mod => mod.syncEmailsToCalendar(token));

            if (res.success) {
                alert(`Successfully created ${res.count} calendar events from emails!`);
                fetchDashboardData(token);
            }
        } catch (err: any) {
            console.error(err);
            alert("Failed to sync: " + err.message);
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
        } catch (err: any) {
            console.error('Failed to add event:', err);
            alert('Failed to add event to calendar: ' + err.message);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user || role !== 'HR') {
        return null;
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 bg-primary/10 rounded-xl flex items-center justify-center">
                                <Briefcase className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h1 className="font-bold">HR Dashboard</h1>
                                <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Tab Navigation */}
                            <div className="hidden sm:flex items-center bg-muted rounded-lg p-1 mr-4">
                                <button
                                    onClick={() => setActiveTab('overview')}
                                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'overview'
                                        ? 'bg-background shadow text-foreground'
                                        : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    <Calendar className="h-4 w-4 inline mr-1.5" />
                                    Overview
                                </button>
                                <button
                                    onClick={() => setActiveTab('jobs')}
                                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'jobs'
                                        ? 'bg-background shadow text-foreground'
                                        : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    <Briefcase className="h-4 w-4 inline mr-1.5" />
                                    Jobs ({jobs.length})
                                </button>
                            </div>

                            <Link
                                href="/jobopening/create"
                                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                            >
                                <Plus className="h-4 w-4" />
                                <span className="hidden sm:inline">Create Job</span>
                            </Link>

                            <Link
                                href="/jobopening"
                                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5 px-3 py-2"
                            >
                                <Eye className="h-4 w-4" />
                                <span className="hidden sm:inline">Public View</span>
                            </Link>

                            <button
                                onClick={() => signOut()}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                            >
                                <LogOut className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Tab Navigation */}
            <div className="sm:hidden border-b border-border bg-background">
                <div className="flex">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'overview'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground'
                            }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('jobs')}
                        className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'jobs'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground'
                            }`}
                    >
                        Jobs ({jobs.length})
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
                {/* Loading Overlay */}
                {loadingData && (
                    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
                        <PrismFluxLoader size={60} speed={4} />
                        <p className="mt-6 text-lg font-medium">Syncing with Google Workspace...</p>
                        <p className="mt-2 text-sm text-muted-foreground">Fetching emails, calendar events, and generating summaries</p>
                    </div>
                )}

                {activeTab === 'overview' ? (
                    /* Overview Tab - Email & Calendar */
                    <>
                        {!data && !loadingData && !error && (
                            <div className="flex flex-col items-center justify-center text-center p-12 bg-card rounded-2xl border border-border shadow-sm">
                                <div className="h-16 w-16 bg-primary/10 flex items-center justify-center rounded-2xl mb-6">
                                    <Mail className="text-primary" size={32} />
                                </div>
                                <h2 className="text-2xl font-bold mb-2">Connect Google Workspace</h2>
                                <p className="text-muted-foreground max-w-md mb-8">
                                    Sync your emails and calendar to get AI-powered summaries and event suggestions.
                                </p>
                                <button
                                    onClick={handleConnectGoogle}
                                    className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
                                >
                                    Connect Google Workspace
                                </button>
                            </div>
                        )}

                        {error && (
                            <div className="flex flex-col items-center justify-center text-center p-12 bg-card rounded-2xl border border-destructive/20">
                                <ShieldAlert className="text-destructive mb-4" size={48} />
                                <h2 className="text-xl font-bold mb-2 text-destructive">Connection Error</h2>
                                <p className="text-muted-foreground max-w-md mb-6">{error}</p>
                                <button
                                    onClick={handleConnectGoogle}
                                    className="px-6 py-2 bg-muted rounded-md font-semibold hover:bg-muted/80 transition-colors"
                                >
                                    Reconnect
                                </button>
                            </div>
                        )}

                        {data && (
                            <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
                                {/* Left Panel: Calendar (3/4 of screen) */}
                                <section className="flex-[3] min-w-0 h-[calc(100vh-180px)] flex flex-col">
                                    <CalendarPanel events={data?.events || []} loading={loadingData} />
                                </section>

                                {/* Right Panel: Email Summary (1/4 of screen) */}
                                <section className="flex-1 min-w-0 w-full lg:w-80 h-[calc(100vh-180px)] flex flex-col">
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
                                        <EmailPanel emails={data?.emails || []} loading={loadingData} onAddToCalendar={handleAddToCalendar} />
                                    </div>
                                </section>
                            </div>
                        )}
                    </>
                ) : (
                    /* Jobs Tab */
                    <>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                            <div>
                                <h2 className="text-2xl font-bold">Your Job Openings</h2>
                                <p className="text-muted-foreground">Manage your job postings and view applications</p>
                            </div>
                        </div>

                        {loadingJobs ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : jobs.length === 0 ? (
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
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {jobs.map((job) => (
                                    <div
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
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Footer */}
            <footer className="h-10 border-t border-border bg-card/50 flex items-center px-8 text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        Systems Active
                    </div>
                    <div className="h-3 w-px bg-border"></div>
                    <div>Cloud sync: {data ? 'Online' : 'Pending'}</div>
                </div>
                <div className="ml-auto">© 2026 HR Pulse Enterprise</div>
            </footer>
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
