'use client';

import React from 'react';
import { Mail, Clock, ExternalLink, CalendarPlus, Users, MapPin } from 'lucide-react';
import { EmailSummary } from '@/lib/summarizer-scrape/gmail';
import { PrismFluxLoader } from '@/components/ui/prism-flux-loader';

interface EmailPanelProps {
    emails: EmailSummary[];
    loading?: boolean;
    onAddToCalendar?: (email: EmailSummary) => void;
}

const categoryColors: Record<string, string> = {
    Interviews: 'border-l-[4px] border-l-[#3b82f6]', // Blue
    Offers: 'border-l-[4px] border-l-[#22c55e]',     // Green
    Onboarding: 'border-l-[4px] border-l-[#eab308]', // Yellow
    'Internal HR': 'border-l-[4px] border-l-[#a855f7]', // Purple
    Rejections: 'border-l-[4px] border-l-[#ef4444]', // Red
    Applications: 'border-l-[4px] border-l-[#06b6d4]', // Cyan
    Scheduling: 'border-l-[4px] border-l-[#f97316]', // Orange
    General: 'border-l-[4px] border-l-[#6b7280]',    // Gray
};

const getCategoryColor = (category: string): string => {
    return categoryColors[category] || 'border-l-[4px] border-l-[#6b7280]';
};

export const EmailPanel = ({ emails, loading, onAddToCalendar }: EmailPanelProps) => {
    if (loading) {
        return (
            <div className="flex flex-col h-full bg-card border border-border items-center justify-center">
                <PrismFluxLoader size={30} speed={4} />
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
        <div className="flex flex-col h-full bg-card border border-border overflow-hidden text-foreground">
            <div className="p-3 border-b border-border flex items-center gap-2">
                <Mail size={14} />
                <span className="text-xs font-bold uppercase tracking-wider">Email Digest</span>
            </div>

            <div className="flex-1 overflow-y-auto">
                {emails.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                        <Mail size={24} className="text-muted-foreground mb-2 opacity-30" />
                        <p className="text-xs text-muted-foreground">No emails from last 24h</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {emails.map((email) => (
                            <div key={email.id} className={`p-4 hover:bg-muted/50 transition-colors bg-card border-b border-border last:border-b-0 ${getCategoryColor(email.category)}`}>
                                {/* Category Tag */}
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                                        {email.category}
                                    </span>
                                    <span className="text-[9px] text-muted-foreground flex items-center gap-1">
                                        <Clock size={8} />
                                        {new Date(email.timestamp).toLocaleDateString()}
                                    </span>
                                </div>

                                {/* Subject */}
                                <h3 className="font-semibold text-xs mb-1 leading-tight line-clamp-2">{email.subject}</h3>

                                {/* Sender */}
                                <p className="text-[10px] text-muted-foreground mb-2 truncate">From: {email.sender}</p>

                                {/* Summary */}
                                <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2 mb-2">
                                    {email.summary}
                                </p>

                                {/* Meeting Detection */}
                                {email.suggested_event && (
                                    <div className="mb-3 p-2.5 border border-dashed border-primary/40 bg-muted/50 rounded-sm">
                                        <div className="flex items-center gap-1 mb-1">
                                            <CalendarPlus size={10} />
                                            <span className="text-[9px] font-bold uppercase">Meeting</span>
                                        </div>
                                        <p className="text-[10px] font-medium">{email.suggested_event.title}</p>
                                        <p className="text-[9px] text-muted-foreground flex items-center gap-1">
                                            <Clock size={8} />
                                            {formatEventDate(email.suggested_event.date_str)}
                                        </p>
                                        {email.suggested_event.attendees && email.suggested_event.attendees.length > 0 && (
                                            <p className="text-[9px] text-muted-foreground flex items-center gap-1">
                                                <Users size={8} />
                                                {email.suggested_event.attendees.slice(0, 2).join(', ')}
                                            </p>
                                        )}
                                        {email.suggested_event.location && (
                                            <p className="text-[9px] text-muted-foreground flex items-center gap-1">
                                                <MapPin size={8} />
                                                {email.suggested_event.location}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-1">
                                    <a
                                        href={`https://mail.google.com/mail/u/0/#inbox/${email.threadId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-[9px] font-medium border border-border hover:bg-muted transition-colors"
                                    >
                                        View
                                        <ExternalLink size={8} />
                                    </a>
                                    {email.suggested_event && onAddToCalendar && (
                                        <button
                                            onClick={() => onAddToCalendar(email)}
                                            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-[9px] font-medium bg-foreground text-background hover:bg-foreground/80 transition-colors"
                                        >
                                            <CalendarPlus size={8} />
                                            Add
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
