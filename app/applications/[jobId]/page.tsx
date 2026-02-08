'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState, use, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { ArrowLeft, Loader2, ExternalLink, Github, Globe, FileText, Video, Calendar } from 'lucide-react';
import { ScheduleInterviewModal } from '@/components/dashboard/ScheduleInterviewModal';

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
    interviews: Array<{
        id: string;
        meeting_id: string;
        scheduled_at: string;
        status: string;
    }>;
}

export default function ApplicationsPage({ params }: { params: Promise<{ jobId: string }> }) {
    const { jobId } = use(params);
    const router = useRouter();
    const { user, role, loading: authLoading } = useAuth();

    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

    // Protect route - HR only
    useEffect(() => {
        if (!authLoading && (!user || role !== 'HR')) {
            router.push('/');
        }
    }, [user, role, authLoading, router]);

    // Fetch applications
    const fetchApplications = useCallback(async () => {
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
    }, [user, jobId]);

    // Initial load
    useEffect(() => {
        if (!authLoading && user && role === 'HR') {
            fetchApplications();
        }
    }, [authLoading, user, role, fetchApplications]);

    // Poll for updates if any application has a linkedin_url but no social_data
    useEffect(() => {
        const hasPendingSocial = applications.some(app => app.linkedin_url && !app.social_data);

        if (hasPendingSocial) {
            const interval = setInterval(() => {
                fetchApplications();
            }, 5000); // Poll every 5 seconds

            return () => clearInterval(interval);
        }
    }, [applications, fetchApplications]);

    const handleScheduleInterview = async (data: { scheduledAt: string }) => {
        if (!selectedApplication || !user) return;

        try {
            const response = await fetch('/api/interview/schedule', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    applicationId: selectedApplication.id,
                    candidateId: selectedApplication.candidate_email, // Using email as candidateId for now if no uid
                    hrId: user.uid,
                    scheduledAt: data.scheduledAt,
                }),
            });

            if (response.ok) {
                // Refresh applications
                const token = await user.getIdToken();
                const refreshRes = await fetch(`/api/applications/${jobId}`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                const refreshData = await refreshRes.json();
                if (refreshRes.ok) setApplications(refreshData.applications);
                alert('Interview scheduled successfully!');
            }
        } catch (err) {
            console.error('Failed to schedule interview:', err);
            alert('Failed to schedule interview');
        }
    };

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
                                {app.social_data ? (
                                    <div className="mb-4 p-4 bg-muted/30 rounded-lg border border-border">
                                        {(app.social_data as any).error ? (
                                            /* Error State Display */
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${(app.social_data as any).error === 'No posts available'
                                                        ? 'bg-orange-500/10 text-orange-600'
                                                        : 'bg-red-500/10 text-red-600'
                                                        }`}>
                                                        <Loader2 className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-sm text-foreground">
                                                            {(app.social_data as any).error === 'User not found' ? 'Username Not Found' :
                                                                (app.social_data as any).error === 'No posts available' ? 'No Posts Available' :
                                                                    'Analysis Failed'}
                                                        </h4>
                                                        <p className="text-xs text-muted-foreground">
                                                            {(app.social_data as any).error === 'User not found' ? 'Could not locate this profile on LinkedIn' :
                                                                (app.social_data as any).error === 'No posts available' ? 'User has no recent activity to analyze' :
                                                                    'Something went wrong during analysis'}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* If profile was found but no posts, show what we got */}
                                                {(app.social_data as any).profile && (app.social_data as any).profile.name && (
                                                    <div className="text-right">
                                                        <p className="text-xs font-semibold">{(app.social_data as any).profile.name}</p>
                                                        <p className="text-[10px] text-muted-foreground">Profile Found</p>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            /* Normal Success State */
                                            <>
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

                                                {/* Profile Details (New) */}
                                                {(app.social_data as any).profile && (
                                                    <div className="mb-4 pb-4 border-b border-border/50">
                                                        <div className="flex items-start gap-3">
                                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                                {(app.social_data as any).profile.name ? (app.social_data as any).profile.name.charAt(0) : '?'}
                                                            </div>
                                                            <div>
                                                                <h5 className="font-semibold text-sm">{(app.social_data as any).profile.name || 'Unknown Name'}</h5>
                                                                {(app.social_data as any).profile.headline && (
                                                                    <p className="text-xs text-muted-foreground mt-0.5">{(app.social_data as any).profile.headline}</p>
                                                                )}
                                                                {(app.social_data as any).profile.location && (
                                                                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                                                                        <span className="inline-block h-1 w-1 rounded-full bg-muted-foreground"></span>
                                                                        {(app.social_data as any).profile.location}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {(app.social_data as any).profile.about && (
                                                            <p className="text-xs text-foreground/80 mt-2 line-clamp-3 italic">
                                                                "{(app.social_data as any).profile.about}"
                                                            </p>
                                                        )}
                                                    </div>
                                                )}

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mt-4">
                                                    {/* Posts Analysis */}
                                                    <div className="bg-background rounded p-3 border border-border">
                                                        <h5 className="font-semibold text-xs uppercase tracking-wider mb-2 text-muted-foreground">Posts Analysis</h5>
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="text-xs text-muted-foreground">Toxicity:</span>
                                                            <span className={`font-bold ${(app.social_data as any).average_toxicity > 0.5 ? 'text-red-500' : 'text-green-500'}`}>
                                                                {((app.social_data as any).average_toxicity * 100).toFixed(0)}%
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="text-xs text-muted-foreground">Profanity:</span>
                                                            <span className="font-bold">
                                                                {((app.social_data as any).profane_ratio * 100).toFixed(0)}%
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-xs text-muted-foreground">Count:</span>
                                                            <span className="font-bold">{(app.social_data as any).total_posts_analyzed}</span>
                                                        </div>
                                                    </div>

                                                    {/* Comments Analysis */}
                                                    <div className="bg-background rounded p-3 border border-border">
                                                        <h5 className="font-semibold text-xs uppercase tracking-wider mb-2 text-muted-foreground">Comments Analysis</h5>
                                                        {(app.social_data as any).comments_analysis ? (
                                                            <>
                                                                <div className="flex justify-between items-center mb-1">
                                                                    <span className="text-xs text-muted-foreground">Toxicity:</span>
                                                                    <span className={`font-bold ${(app.social_data as any).comments_analysis.average_toxicity > 0.5 ? 'text-red-500' : 'text-green-500'}`}>
                                                                        {((app.social_data as any).comments_analysis.average_toxicity * 100).toFixed(0)}%
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between items-center mb-1">
                                                                    <span className="text-xs text-muted-foreground">Profanity:</span>
                                                                    <span className="font-bold">
                                                                        {((app.social_data as any).comments_analysis.profane_ratio * 100).toFixed(0)}%
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between items-center">
                                                                    <span className="text-xs text-muted-foreground">Count:</span>
                                                                    <span className="font-bold">{(app.social_data as any).comments_analysis.total_comments_analyzed}</span>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div className="h-full flex items-center justify-center text-xs text-muted-foreground italic">
                                                                No comments analyzed
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Recent Post/Comment Snippet */}
                                                {(app.social_data as any).posts && (app.social_data as any).posts.length > 0 && (
                                                    <div className="mt-3 pt-3 border-t border-border/50">
                                                        <p className="text-xs text-muted-foreground mb-1">Latest Post:</p>
                                                        <p className="text-sm italic text-foreground/80 line-clamp-2">
                                                            "{(app.social_data as any).posts[0].text}"
                                                        </p>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                ) : app.linkedin_url ? (
                                    <div className="mb-4 p-4 bg-blue-500/5 rounded-lg border border-blue-200/50 flex items-center gap-3 animate-pulse">
                                        <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                                        <div>
                                            <h4 className="font-medium text-sm text-blue-700">Analyzing Social Profile...</h4>
                                            <p className="text-xs text-blue-600/80">Calculating toxicity score from LinkedIn</p>
                                        </div>
                                    </div>
                                ) : null}
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

                                        <div className="flex gap-2 mt-4">
                                            {app.interviews && app.interviews.length > 0 ? (
                                                <Link
                                                    href={`/meetings/${app.interviews[0].meeting_id}`}
                                                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-bold shadow-md hover:bg-green-600 transition-all"
                                                >
                                                    <Video className="h-4 w-4" />
                                                    Join Meeting
                                                </Link>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        setSelectedApplication(app);
                                                        setScheduleModalOpen(true);
                                                    }}
                                                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold shadow-md hover:opacity-90 transition-all"
                                                >
                                                    <Calendar className="h-4 w-4" />
                                                    Schedule Interview
                                                </button>
                                            )}
                                        </div>
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

            <ScheduleInterviewModal
                isOpen={scheduleModalOpen}
                onClose={() => setScheduleModalOpen(false)}
                onSubmit={handleScheduleInterview}
                candidateName={selectedApplication?.candidate_name || ''}
            />
        </div>
    );
}
