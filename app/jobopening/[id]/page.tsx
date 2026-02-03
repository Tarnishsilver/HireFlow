'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import {
    Briefcase, MapPin, Clock, Building2, Loader2, ArrowLeft,
    CheckCircle2, DollarSign, Users
} from 'lucide-react';

interface Job {
    id: string;
    title: string;
    company_name: string;
    location: string;
    job_type: string;
    experience_level: string;
    description: string;
    responsibilities: string[];
    required_skills: string[];
    preferred_skills: string[];
    stipend: string | null;
    status: string;
    created_at: string;
    creator: {
        name: string | null;
        email: string;
    };
    _count: {
        applications: number;
    };
}

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { user, role } = useAuth();

    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchJob() {
            try {
                const response = await fetch(`/api/job/${id}`);
                const data = await response.json();

                if (response.ok) {
                    setJob(data.job);
                } else {
                    setError(data.error || 'Failed to fetch job');
                }
            } catch (err) {
                setError('Failed to fetch job');
            } finally {
                setLoading(false);
            }
        }

        fetchJob();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <h2 className="text-xl font-semibold mb-2">Job Not Found</h2>
                    <p className="text-muted-foreground mb-6">{error || 'This job may have been removed'}</p>
                    <Link
                        href="/jobopening"
                        className="text-primary font-medium hover:underline"
                    >
                        ← Back to Job Listings
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center gap-4">
                        <Link
                            href="/jobopening"
                            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            <span>Back to Jobs</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Job Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="bg-card border border-border rounded-xl p-6 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span
                                    className={`px-2 py-0.5 text-xs font-medium rounded-full ${job.status === 'LIVE'
                                        ? 'bg-green-500/10 text-green-600'
                                        : 'bg-red-500/10 text-red-600'
                                        }`}
                                >
                                    {job.status}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    Posted {new Date(job.created_at).toLocaleDateString()}
                                </span>
                            </div>

                            <h1 className="text-2xl font-bold mb-2">{job.title}</h1>

                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Building2 className="h-5 w-5" />
                                <span className="text-lg">{job.company_name}</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 items-end">
                            {job.stipend && (
                                <div className="flex items-center gap-1.5 text-green-600 font-medium">
                                    <DollarSign className="h-5 w-5" />
                                    <span>{job.stipend}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                                <Users className="h-4 w-4" />
                                <span>{job._count.applications} applications</span>
                            </div>
                            {role === 'HR' && job._count.applications > 0 && (
                                <Link
                                    href={`/applications/${job.id}`}
                                    className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors"
                                >
                                    View Applications
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-border">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-5 w-5" />
                            <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-5 w-5" />
                            <span>{job.job_type}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Briefcase className="h-5 w-5" />
                            <span>{job.experience_level} Level</span>
                        </div>
                    </div>
                </div>

                {/* Apply Button - Fixed on mobile */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border sm:relative sm:p-0 sm:border-0 sm:bg-transparent sm:mb-6">
                    {job.status === 'LIVE' ? (
                        <Link
                            href={user ? `/apply/${job.id}` : `/login?redirect=/apply/${job.id}`}
                            className="block w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium text-center hover:opacity-90 transition-opacity"
                        >
                            {user ? 'Apply Now' : 'Sign In to Apply'}
                        </Link>
                    ) : (
                        <button
                            disabled
                            className="block w-full py-3 bg-muted text-muted-foreground rounded-lg font-medium text-center cursor-not-allowed"
                        >
                            Applications Closed
                        </button>
                    )}
                </div>

                {/* Description */}
                <section className="bg-card border border-border rounded-xl p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4">About the Role</h2>
                    <p className="text-muted-foreground whitespace-pre-wrap">{job.description}</p>
                </section>

                {/* Responsibilities */}
                {job.responsibilities.length > 0 && (
                    <section className="bg-card border border-border rounded-xl p-6 mb-6">
                        <h2 className="text-lg font-semibold mb-4">Responsibilities</h2>
                        <ul className="space-y-3">
                            {job.responsibilities.map((item, i) => (
                                <li key={i} className="flex gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-muted-foreground">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {/* Required Skills */}
                {job.required_skills.length > 0 && (
                    <section className="bg-card border border-border rounded-xl p-6 mb-6">
                        <h2 className="text-lg font-semibold mb-4">Required Skills</h2>
                        <div className="flex flex-wrap gap-2">
                            {job.required_skills.map((skill, i) => (
                                <span
                                    key={i}
                                    className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </section>
                )}

                {/* Preferred Skills */}
                {job.preferred_skills.length > 0 && (
                    <section className="bg-card border border-border rounded-xl p-6 mb-24 sm:mb-6">
                        <h2 className="text-lg font-semibold mb-4">Nice to Have</h2>
                        <div className="flex flex-wrap gap-2">
                            {job.preferred_skills.map((skill, i) => (
                                <span
                                    key={i}
                                    className="px-3 py-1.5 bg-muted text-muted-foreground rounded-lg text-sm"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}
