'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { ArrowLeft, Loader2, ExternalLink, Github, Globe, FileText } from 'lucide-react';

interface Application {
    id: string;
    candidate_name: string;
    candidate_email: string;
    resume_url: string;
    github_url: string | null;
    portfolio_url: string | null;
    created_at: string;
    ats_score: number | null;
    ats_decision: string | null;
    ats_missing_skills: string[];
    ats_reasons: string[];
    linkedin_url: string | null;
    social_data: any;
}

export default function ApplicationsPage({ params }: { params: Promise<{ jobId: string }> }) {
    const { jobId } = use(params);
    const router = useRouter();
    const { user, role, loading: authLoading } = useAuth();

    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // Protect route - HR only
    useEffect(() => {
        if (!authLoading && (!user || role !== 'HR')) {
            router.push('/login');
        }
    }, [user, role, authLoading, router]);

    // Fetch applications
    useEffect(() => {
        async function fetchApplications() {
            if (!user) return;

            try {
                const token = await user.getIdToken();
                const response = await fetch(`/api/applications/${jobId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                const data = await response.json();

                if (response.ok) {
                    setApplications(data.applications);
                } else {
                    setError(data.error || 'Failed to fetch applications');
                }
            } catch (err) {
                setError('Failed to fetch applications');
            } finally {
                setLoading(false);
            }
        }

        if (!authLoading && user && role === 'HR') {
            fetchApplications();
        }
    }, [jobId, user, role, authLoading]);

    // Get score badge color
    const getScoreBadgeClass = (score: number | null) => {
        if (score === null) return 'bg-gray-500/10 text-gray-600';
        if (score >= 80) return 'bg-green-500/10 text-green-600';
        if (score >= 60) return 'bg-yellow-500/10 text-yellow-600';
        return 'bg-red-500/10 text-red-600';
    };

    // Get score label
    const getScoreLabel = (score: number | null) => {
        if (score === null) return 'Pending';
        if (score >= 80) return 'Strong Match';
        if (score >= 60) return 'Potential Match';
        return 'Weak Match';
    };

    if (authLoading || loading) {
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
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center gap-4">
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            <span>Back to Dashboard</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold">Applications</h1>
                    <p className="text-muted-foreground">
                        {applications.length} {applications.length === 1 ? 'applicant' : 'applicants'} • Sorted by ATS Score
                    </p>
                </div>

                {error && (
                    <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {applications.length === 0 ? (
                    <div className="bg-card border border-border rounded-xl p-12 text-center">
                        <p className="text-muted-foreground">No applications yet</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {applications.map((app) => (
                            <div
                                key={app.id}
                                className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors"
                            >
                                {/* Application Header */}
                                {app.social_data && (
                                    <div className="mb-4 p-4 bg-muted/30 rounded-lg border border-border">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="font-semibold text-sm flex items-center gap-2">
                                                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                                                Social Media Analysis
                                                <span className="text-xs font-normal text-muted-foreground">({(app.social_data as any).platform})</span>
                                            </h4>
                                            <span className={`px-2 py-1 rounded text-xs font-medium border ${(app.social_data as any).harassment_risk === 'High' ? 'bg-red-50 text-red-600 border-red-200' :
                                                (app.social_data as any).harassment_risk === 'Medium' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                                                    'bg-green-50 text-green-600 border-green-200'
                                                }`}>
                                                {(app.social_data as any).harassment_risk} Risk
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-muted-foreground text-xs uppercase tracking-wider">Toxicity Score</span>
                                                <div className="flex items-baseline gap-2">
                                                    <span className={`text-lg font-bold ${(app.social_data as any).average_toxicity > 0.5 ? 'text-red-500' : 'text-green-500'
                                                        }`}>
                                                        {((app.social_data as any).average_toxicity * 100).toFixed(0)}%
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">average</span>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-1">
                                                <span className="text-muted-foreground text-xs uppercase tracking-wider">Profanity Ratio</span>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-lg font-bold text-foreground">
                                                        {((app.social_data as any).profane_ratio * 100).toFixed(0)}%
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-1">
                                                <span className="text-muted-foreground text-xs uppercase tracking-wider">Posts Analyzed</span>
                                                <span className="text-lg font-bold text-foreground">{(app.social_data as any).total_posts_analyzed}</span>
                                            </div>
                                        </div>

                                        {/* Recent Post Snippet */}
                                        {(app.social_data as any).posts && (app.social_data as any).posts.length > 0 && (
                                            <div className="mt-3 pt-3 border-t border-border/50">
                                                <p className="text-xs text-muted-foreground mb-1">Latest Post:</p>
                                                <p className="text-sm italic text-foreground/80 line-clamp-2">
                                                    "{(app.social_data as any).posts[0].text}"
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {/* Application Header */}
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-start gap-3 mb-2">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold">{app.candidate_name}</h3>
                                                <p className="text-sm text-muted-foreground">{app.candidate_email}</p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Applied {new Date(app.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Links */}
                                        <div className="flex flex-wrap gap-3 mt-3">
                                            <a
                                                href={app.resume_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                                            >
                                                <FileText className="h-4 w-4" />
                                                Resume
                                                <ExternalLink className="h-3 w-3" />
                                            </a>
                                            {app.github_url && (
                                                <a
                                                    href={app.github_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                                                >
                                                    <Github className="h-4 w-4" />
                                                    GitHub
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                            )}
                                            {app.portfolio_url && (
                                                <a
                                                    href={app.portfolio_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                                                >
                                                    <Globe className="h-4 w-4" />
                                                    Portfolio
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    {/* ATS Score Section */}
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="text-right">
                                            {app.ats_score !== null ? (
                                                <>
                                                    <div className="text-3xl font-bold">{app.ats_score}</div>
                                                    <div className="text-xs text-muted-foreground">ATS Score</div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="text-lg font-medium text-muted-foreground">—</div>
                                                    <div className="text-xs text-muted-foreground">No Score</div>
                                                </>
                                            )}
                                        </div>
                                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getScoreBadgeClass(app.ats_score)}`}>
                                            {getScoreLabel(app.ats_score)}
                                        </span>
                                        {app.ats_decision && (
                                            <span className="text-xs text-muted-foreground">
                                                Decision: {app.ats_decision}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Expandable Details */}
                                {app.ats_score !== null && (app.ats_missing_skills.length > 0 || app.ats_reasons.length > 0) && (
                                    <>
                                        <button
                                            onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                                            className="mt-4 text-sm text-primary hover:underline"
                                        >
                                            {expandedId === app.id ? 'Hide Details' : 'Show ATS Details'}
                                        </button>

                                        {expandedId === app.id && (
                                            <div className="mt-4 pt-4 border-t border-border space-y-4">
                                                {app.ats_missing_skills.length > 0 && (
                                                    <div>
                                                        <h4 className="text-sm font-semibold mb-2">Missing Skills</h4>
                                                        <div className="flex flex-wrap gap-2">
                                                            {app.ats_missing_skills.map((skill, i) => (
                                                                <span
                                                                    key={i}
                                                                    className="px-2 py-1 bg-red-500/10 text-red-600 rounded text-xs"
                                                                >
                                                                    {skill}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {app.ats_reasons.length > 0 && (
                                                    <div>
                                                        <h4 className="text-sm font-semibold mb-2">Scoring Reasons</h4>
                                                        <ul className="space-y-1">
                                                            {app.ats_reasons.map((reason, i) => (
                                                                <li key={i} className="text-sm text-muted-foreground">
                                                                    • {reason}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
