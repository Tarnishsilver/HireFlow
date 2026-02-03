'use client';

import React from 'react';
import { Users, FileText, Github, Globe, Calendar, Briefcase, ExternalLink } from 'lucide-react';

interface Application {
    id: string;
    candidate_name: string;
    candidate_email: string;
    resume_url: string;
    github_url: string | null;
    portfolio_url: string | null;
    created_at: string;
    job: {
        id: string;
        title: string;
        company_name: string;
    };
}

interface CandidatesPanelProps {
    applications: Application[];
    loading: boolean;
}

export function CandidatesPanel({ applications, loading }: CandidatesPanelProps) {
    if (loading) {
        return (
            <div className="h-full flex items-center justify-center bg-card rounded-xl border border-border">
                <div className="text-center">
                    <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-sm text-muted-foreground">Loading candidates...</p>
                </div>
            </div>
        );
    }

    if (applications.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-card rounded-xl border border-border p-8">
                <div className="h-16 w-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                    <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-1">No Applications Yet</h3>
                <p className="text-sm text-muted-foreground text-center max-w-xs">
                    When candidates apply to your job postings, they will appear here.
                </p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-card rounded-xl border border-border overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-border bg-muted/30">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        Candidates
                    </h3>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                        {applications.length} total
                    </span>
                </div>
            </div>

            {/* Applications List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {applications.map((app) => (
                    <div
                        key={app.id}
                        className="p-4 bg-background rounded-lg border border-border hover:border-primary/30 transition-colors"
                    >
                        {/* Candidate Info */}
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h4 className="font-semibold text-sm">{app.candidate_name}</h4>
                                <p className="text-xs text-muted-foreground">{app.candidate_email}</p>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {new Date(app.created_at).toLocaleDateString()}
                            </div>
                        </div>

                        {/* Job Applied For */}
                        <div className="flex items-center gap-2 mb-3 text-xs">
                            <Briefcase className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">Applied for:</span>
                            <span className="font-medium text-primary">{app.job.title}</span>
                        </div>

                        {/* Links */}
                        <div className="flex flex-wrap gap-2">
                            <a
                                href={app.resume_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-primary/10 text-primary rounded-md text-xs font-medium hover:bg-primary/20 transition-colors"
                            >
                                <FileText className="h-3 w-3" />
                                Resume
                                <ExternalLink className="h-3 w-3" />
                            </a>

                            {app.github_url && (
                                <a
                                    href={app.github_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-muted text-foreground rounded-md text-xs font-medium hover:bg-muted/80 transition-colors"
                                >
                                    <Github className="h-3 w-3" />
                                    GitHub
                                </a>
                            )}

                            {app.portfolio_url && (
                                <a
                                    href={app.portfolio_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-muted text-foreground rounded-md text-xs font-medium hover:bg-muted/80 transition-colors"
                                >
                                    <Globe className="h-3 w-3" />
                                    Portfolio
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
