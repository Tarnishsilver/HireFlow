'use client';

import React from 'react';
import { Mail, Clock, ExternalLink, CalendarPlus, Users, MapPin } from 'lucide-react';
import { EmailSummary } from '@/lib/summarizer-scrape/gmail';

interface EmailPanelProps {
    emails: EmailSummary[];
    loading?: boolean;
    onAddToCalendar?: (email: EmailSummary) => void;
}

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
    Interviews: { bg: 'bg-chart-1/10', text: 'text-chart-1', border: 'border-l-chart-1' },
    Offers: { bg: 'bg-chart-2/10', text: 'text-chart-2', border: 'border-l-chart-2' },
    Onboarding: { bg: 'bg-chart-3/10', text: 'text-chart-3', border: 'border-l-chart-3' },
    'Internal HR': { bg: 'bg-chart-4/10', text: 'text-chart-4', border: 'border-l-chart-4' },
    Rejections: { bg: 'bg-chart-5/10', text: 'text-chart-5', border: 'border-l-chart-5' },
    Applications: { bg: 'bg-primary/10', text: 'text-primary', border: 'border-l-primary' },
    Scheduling: { bg: 'bg-chart-3/10', text: 'text-chart-3', border: 'border-l-chart-3' },
    General: { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-l-muted-foreground' },
};

const getCategoryStyle = (category: string) => {
    return categoryColors[category] || categoryColors.General;
};

export const EmailPanel = ({ emails, loading, onAddToCalendar }: EmailPanelProps) => {
    if (loading) {
        return (
            <div className="flex flex-col h-full items-center justify-center p-8">
                <div className="h-8 w-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                <p className="mt-4 text-sm text-muted-foreground font-light">Loading emails...</p>
            </div>
        );
    }

    const formatEventDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
            });
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-border/50 flex items-center gap-2.5">
                <Mail size={14} strokeWidth={1.5} className="text-muted-foreground" />
                <span className="text-caption text-muted-foreground">Email Digest</span>
                <span className="ml-auto text-[11px] text-muted-foreground font-light">{emails.length} emails</span>
            </div>

            {/* Email List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {emails.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                        <Mail size={28} className="text-muted-foreground/30 mb-4" strokeWidth={1.5} />
                        <p className="text-sm text-muted-foreground font-light">No emails from last 24h</p>
                    </div>
                ) : (
                    <div className="p-3 space-y-2">
                        {emails.map((email) => {
                            const style = getCategoryStyle(email.category);
                            return (
                                <div
                                    key={email.id}
                                    className={`p-4 rounded-xl border-l-[3px] ${style.border} bg-card/50 hover:bg-muted/30 transition-all animate-premium-fade`}
                                >
                                    {/* Header Row */}
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>
                                            {email.category}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-light">
                                            <Clock size={10} strokeWidth={1.5} />
                                            {new Date(email.timestamp).toLocaleDateString()}
                                        </span>
                                    </div>

                                    {/* Subject */}
                                    <h3 className="font-medium text-[13px] mb-1.5 leading-snug line-clamp-2">{email.subject}</h3>

                                    {/* Sender */}
                                    <p className="text-[11px] text-muted-foreground mb-2 truncate font-light">From: {email.sender}</p>

                                    {/* Summary */}
                                    <p className="text-[11px] text-muted-foreground/80 leading-relaxed line-clamp-2 mb-3 font-light">
                                        {email.summary}
                                    </p>

                                    {/* Meeting Detection */}
                                    {email.suggested_event && (
                                        <div className="mb-3 p-3 glass rounded-lg">
                                            <div className="flex items-center gap-1.5 mb-2">
                                                <CalendarPlus size={11} className="text-primary" strokeWidth={1.5} />
                                                <span className="text-caption text-primary">Meeting Detected</span>
                                            </div>
                                            <p className="text-[12px] font-medium mb-1">{email.suggested_event.title}</p>
                                            <div className="space-y-1">
                                                <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 font-light">
                                                    <Clock size={10} strokeWidth={1.5} />
                                                    {formatEventDate(email.suggested_event.date_str)}
                                                </p>
                                                {email.suggested_event.attendees && email.suggested_event.attendees.length > 0 && (
                                                    <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 font-light">
                                                        <Users size={10} strokeWidth={1.5} />
                                                        {email.suggested_event.attendees.slice(0, 2).join(', ')}
                                                    </p>
                                                )}
                                                {email.suggested_event.location && (
                                                    <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 font-light">
                                                        <MapPin size={10} strokeWidth={1.5} />
                                                        {email.suggested_event.location}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <a
                                            href={`https://mail.google.com/mail/u/0/#inbox/${email.threadId}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-medium text-muted-foreground hover:text-foreground border border-border/50 hover:border-border rounded-lg transition-all"
                                        >
                                            View
                                            <ExternalLink size={10} strokeWidth={1.5} />
                                        </a>
                                        {email.suggested_event && onAddToCalendar && (
                                            <button
                                                onClick={() => onAddToCalendar(email)}
                                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-all"
                                            >
                                                <CalendarPlus size={10} strokeWidth={1.5} />
                                                Add
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
