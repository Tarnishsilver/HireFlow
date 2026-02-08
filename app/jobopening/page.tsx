'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { Briefcase, MapPin, Clock, Building2, Loader2, LogOut, Search, LayoutDashboard, Video, Calendar } from 'lucide-react';

interface Job {
    id: string;
    title: string;
    company_name: string;
    location: string;
    job_type: string;
    experience_level: string;
    description: string;
    stipend: string | null;
    created_at: string;
}

export default function JobOpeningsPage() {
    const { user, role, signOut } = useAuth();

    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [interviews, setInterviews] = useState<any[]>([]);
    const [loadingInterviews, setLoadingInterviews] = useState(false);

    useEffect(() => {
        async function fetchJobs() {
            try {
                const response = await fetch('/api/job/list?status=LIVE');
                const data = await response.json();

                if (response.ok) {
                    setJobs(data.jobs);
                } else {
                    setError(data.error || 'Failed to fetch jobs');
                }
            } catch (err) {
                setError('Failed to fetch jobs');
            } finally {
                setLoading(false);
            }
        }

        fetchJobs();
    }, []);

    useEffect(() => {
        async function fetchInterviews() {
            if (!user || role !== 'CANDIDATE') return;
            setLoadingInterviews(true);
            try {
                const response = await fetch(`/api/interview/list?candidateId=${user.email}`);
                const data = await response.json();
                if (response.ok) {
                    setInterviews(data.interviews);
                }
            } catch (err) {
                console.error('Failed to fetch interviews:', err);
            } finally {
                setLoadingInterviews(false);
            }
        }

        if (user && role === 'CANDIDATE') {
            fetchInterviews();
        }
    }, [user, role]);

    const filteredJobs = jobs.filter((job) => {
        const searchLower = search.toLowerCase();
        return (
            job.title.toLowerCase().includes(searchLower) ||
            job.company_name.toLowerCase().includes(searchLower) ||
            job.location.toLowerCase().includes(searchLower)
        );
    });

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 bg-primary/10 rounded-xl flex items-center justify-center">
                                <Briefcase className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h1 className="font-bold">Job Openings</h1>
                                <p className="text-xs text-muted-foreground">Find your next opportunity</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {user ? (
                                <>
                                    {role === 'HR' && (
                                        <Link
                                            href="/dashboard"
                                            className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                                        >
                                            <LayoutDashboard className="h-4 w-4" />
                                            Dashboard
                                        </Link>
                                    )}
                                    <button
                                        onClick={() => signOut()}
                                        className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Sign Out
                                    </button>
                                </>
                            ) : (
                                <Link
                                    href="/"
                                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                                >
                                    Sign In
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* My Interviews (for Candidates) */}
                {user && role === 'CANDIDATE' && interviews.length > 0 && (
                    <div className="mb-12">
                        <div className="flex items-center gap-2 mb-6 text-primary">
                            <Video className="h-6 w-6" />
                            <h2 className="text-2xl font-bold">Your Scheduled Interviews</h2>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            {interviews.map((interview) => (
                                <div key={interview.id} className="bg-primary/5 border border-primary/20 rounded-2xl p-6 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Calendar className="h-16 w-16" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-1">{interview.application.job.title}</h3>
                                    <p className="text-muted-foreground mb-4">{interview.application.job.company_name}</p>

                                    <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground mb-6">
                                        <span className="flex items-center gap-1.5">
                                            <Calendar className="h-4 w-4" />
                                            {new Date(interview.scheduled_at).toLocaleDateString()}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Clock className="h-4 w-4" />
                                            {new Date(interview.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>

                                    <Link
                                        href={`/meetings/${interview.meeting_id}`}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
                                    >
                                        <Video className="h-5 w-5" />
                                        Join Video Interview
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Search */}
                <div className="mb-8">
                    <div className="relative max-w-xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search jobs by title, company, or location..."
                            className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>
                </div>

                {/* Error State */}
                {error && (
                    <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* Loading State */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : filteredJobs.length === 0 ? (
                    /* Empty State */
                    <div className="text-center py-16 bg-card border border-border rounded-2xl">
                        <div className="inline-flex items-center justify-center h-16 w-16 bg-muted rounded-2xl mb-4">
                            <Briefcase className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">
                            {search ? 'No Jobs Found' : 'No Open Positions'}
                        </h3>
                        <p className="text-muted-foreground max-w-sm mx-auto">
                            {search
                                ? 'Try adjusting your search terms'
                                : 'Check back later for new opportunities'}
                        </p>
                    </div>
                ) : (
                    /* Jobs List */
                    <div className="space-y-4">
                        {filteredJobs.map((job) => (
                            <Link
                                key={job.id}
                                href={`/jobopening/${job.id}`}
                                className="block bg-card border border-border rounded-xl p-6 hover:border-primary/30 hover:shadow-sm transition-all group"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                                            {job.title}
                                        </h3>
                                        <div className="flex items-center gap-2 text-muted-foreground mt-1">
                                            <Building2 className="h-4 w-4" />
                                            <span>{job.company_name}</span>
                                        </div>

                                        <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1.5">
                                                <MapPin className="h-4 w-4" />
                                                {job.location}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Clock className="h-4 w-4" />
                                                {job.job_type}
                                            </span>
                                            <span className="px-2 py-0.5 bg-muted rounded-full text-xs">
                                                {job.experience_level}
                                            </span>
                                        </div>

                                        <p className="text-muted-foreground mt-4 line-clamp-2">
                                            {job.description}
                                        </p>
                                    </div>

                                    <div className="flex flex-col items-end gap-2">
                                        {job.stipend && (
                                            <span className="text-sm font-medium text-green-600">
                                                {job.stipend}
                                            </span>
                                        )}
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(job.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
