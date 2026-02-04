'use client';

import React from 'react';
import { Users, FileText, Github, Globe, Calendar, Briefcase, ExternalLink } from 'lucide-react';

interface Application {
    id: string;
    candidate_name: string;
    candidate_email: string;
    resume_url: string;
    github_url: string | null;
    linkedin_url: string | null;
    portfolio_url: string | null;
    social_data: any; // Using any for simplicity in UI component, or define interface
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

                        {/* Social Analysis (New) */}
                        {app.social_data && (
                            <div className="mb-3 p-3 bg-muted/30 rounded-lg border border-border">
                                <h5 className="text-xs font-semibold mb-2 flex items-center justify-between">
                                    <span>Social Analysis ({app.social_data.platform})</span>
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${app.social_data.harassment_risk === 'High' ? 'bg-red-50 text-red-600 border-red-200' :
                                        app.social_data.harassment_risk === 'Medium' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                                            'bg-green-50 text-green-600 border-green-200'
                                        }`}>
                                        {app.social_data.harassment_risk} Risk
                                    </span>
                                </h5>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Toxicity:</span>
                                        <span className={app.social_data.average_toxicity > 0.5 ? 'text-red-500 font-medium' : 'text-green-500 font-medium'}>
                                            {(app.social_data.average_toxicity * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Profanity:</span>
                                        <span>{(app.social_data.profane_ratio * 100).toFixed(0)}%</span>
                                    </div>
                                </div>
                                {/* Recent Posts Preview */}
                                {app.social_data.posts && app.social_data.posts.length > 0 && (
                                    <div className="mt-2 text-[10px] text-muted-foreground border-t border-border/50 pt-2">
                                        <p className="line-clamp-2 italic">"{app.social_data.posts[0].text}"</p>
                                    </div>
                                )}
                            </div>
                        )}

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

                            {app.linkedin_url && (
                                <a
                                    href={app.linkedin_url.startsWith('http') ? app.linkedin_url : `https://${app.linkedin_url}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[#0077b5]/10 text-[#0077b5] rounded-md text-xs font-medium hover:bg-[#0077b5]/20 transition-colors"
                                >
                                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                                    LinkedIn
                                </a>
                            )}

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
