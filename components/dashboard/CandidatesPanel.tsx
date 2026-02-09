'use client';

import React from 'react';
import { Users, FileText, Github, Globe, Calendar, Briefcase, ExternalLink, ChevronRight } from 'lucide-react';

interface Application {
    id: string;
    candidate_name: string;
    candidate_email: string;
    resume_url: string;
    github_url: string | null;
    linkedin_url: string | null;
    portfolio_url: string | null;
    social_data: any;
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
            <div className="h-full flex items-center justify-center p-8">
                <div className="text-center">
                    <div className="h-8 w-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground font-light">Loading candidates...</p>
                </div>
            </div>
        );
    }

    if (applications.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                <div className="h-14 w-14 bg-muted/30 rounded-2xl flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-muted-foreground/50" strokeWidth={1.5} />
                </div>
                <h3 className="font-medium text-base mb-2">No Applications Yet</h3>
                <p className="text-sm text-muted-foreground font-light max-w-xs leading-relaxed">
                    When candidates apply to your job postings, they will appear here.
                </p>
            </div>
        );
    }

    const getRiskBadgeStyle = (risk: string) => {
        switch (risk) {
            case 'High':
                return 'badge-error';
            case 'Medium':
                return 'badge-warning';
            default:
                return 'badge-success';
        }
    };

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <Users className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                    <span className="text-caption text-muted-foreground">Candidates</span>
                </div>
                <span className="text-[11px] badge-info px-2.5 py-1 rounded-full font-medium">
                    {applications.length} total
                </span>
            </div>

            {/* Applications List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                {applications.map((app) => (
                    <div
                        key={app.id}
                        className="p-4 bg-card/50 rounded-xl hover:bg-muted/30 transition-all animate-premium-fade group"
                    >
                        {/* Candidate Info */}
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <span className="text-sm font-medium text-primary">
                                        {app.candidate_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </span>
                                </div>
                                <div>
                                    <h4 className="font-medium text-[13px]">{app.candidate_name}</h4>
                                    <p className="text-[11px] text-muted-foreground font-light truncate max-w-[160px]">{app.candidate_email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-light">
                                <Calendar className="h-3 w-3" strokeWidth={1.5} />
                                {new Date(app.created_at).toLocaleDateString()}
                            </div>
                        </div>

                        {/* Social Analysis */}
                        {app.social_data && (
                            <div className="mb-3 p-3 glass rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-caption text-muted-foreground">Social Analysis</span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getRiskBadgeStyle(app.social_data.harassment_risk)}`}>
                                        {app.social_data.harassment_risk} Risk
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-[11px]">
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground font-light">Toxicity</span>
                                        <span className={`font-medium ${app.social_data.average_toxicity > 0.5 ? 'text-chart-5' : 'text-chart-2'}`}>
                                            {(app.social_data.average_toxicity * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground font-light">Profanity</span>
                                        <span className="font-medium">{(app.social_data.profane_ratio * 100).toFixed(0)}%</span>
                                    </div>
                                </div>
                                {app.social_data.posts && app.social_data.posts.length > 0 && (
                                    <div className="mt-2 pt-2 border-t border-border/30">
                                        <p className="text-[10px] text-muted-foreground/70 line-clamp-2 italic font-light">
                                            "{app.social_data.posts[0].text}"
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Job Applied For */}
                        <div className="flex items-center gap-2 mb-3 p-2 bg-muted/20 rounded-lg">
                            <Briefcase className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
                            <span className="text-[11px] text-muted-foreground font-light">Applied for:</span>
                            <span className="text-[11px] font-medium text-primary">{app.job.title}</span>
                        </div>

                        {/* Links */}
                        <div className="flex flex-wrap gap-1.5">
                            <a
                                href={app.resume_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-primary/10 text-primary rounded-lg text-[10px] font-medium hover:bg-primary/15 transition-all"
                            >
                                <FileText className="h-3 w-3" strokeWidth={1.5} />
                                Resume
                                <ExternalLink className="h-2.5 w-2.5" strokeWidth={1.5} />
                            </a>

                            {app.linkedin_url && (
                                <a
                                    href={app.linkedin_url.startsWith('http') ? app.linkedin_url : `https://${app.linkedin_url}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[#0077b5]/10 text-[#0077b5] rounded-lg text-[10px] font-medium hover:bg-[#0077b5]/15 transition-all"
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
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-muted/50 text-foreground rounded-lg text-[10px] font-medium hover:bg-muted transition-all"
                                >
                                    <Github className="h-3 w-3" strokeWidth={1.5} />
                                    GitHub
                                </a>
                            )}

                            {app.portfolio_url && (
                                <a
                                    href={app.portfolio_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-muted/50 text-foreground rounded-lg text-[10px] font-medium hover:bg-muted transition-all"
                                >
                                    <Globe className="h-3 w-3" strokeWidth={1.5} />
                                    Portfolio
                                </a>
                            )}
                        </div>

                        {/* See Details - calm secondary action */}
                        <button className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 text-[11px] text-muted-foreground hover:text-foreground font-light border border-border/30 hover:border-border/50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                            See Details
                            <ChevronRight className="h-3 w-3" strokeWidth={1.5} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
