import React from 'react';
import { Mail, Clock, ExternalLink } from 'lucide-react';
import { EmailSummary } from '@/lib/summarizer-scrape/gmail';

interface EmailPanelProps {
    emails: EmailSummary[];
    loading?: boolean;
}

const categoryColors = {
    Interviews: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    Offers: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    Onboarding: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    'Internal HR': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
};

export const EmailPanel = ({ emails, loading }: EmailPanelProps) => {
    if (loading) {
        return (
            <div className="flex flex-col h-full bg-card rounded-xl border border-border animate-pulse">
                <div className="h-16 border-b border-border m-6 bg-muted/50 rounded"></div>
                <div className="flex-1 p-4 space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 bg-muted/30 rounded-lg border border-border"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-card rounded-xl border border-border overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Mail className="text-primary" size={20} />
                    <h2 className="text-lg font-semibold">HR Email Digest</h2>
                </div>
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    Daily Summary
                </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {emails.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                        <Mail size={40} className="text-muted mb-4 opacity-20" />
                        <p className="text-sm font-medium text-muted-foreground">No HR-related emails found from the last 14 days.</p>
                    </div>
                ) : (
                    emails.map((email) => (
                        <div key={email.id} className="group p-4 rounded-lg border border-border hover:border-primary/50 hover:shadow-sm transition-all bg-background/50">
                            <div className="flex items-start justify-between mb-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${categoryColors[email.category]}`}>
                                    {email.category}
                                </span>
                                <div className="flex items-center gap-1 text-muted-foreground group-hover:text-primary transition-colors">
                                    <Clock size={12} />
                                    <span className="text-[10px] font-medium">{email.timestamp}</span>
                                </div>
                            </div>

                            <h3 className="font-semibold text-sm mb-1 leading-tight">{email.subject}</h3>
                            <p className="text-xs text-muted-foreground mb-3 font-medium">From: {email.sender}</p>

                            <div className="p-3 bg-muted/30 rounded border border-border/50 mb-3 italic text-xs leading-relaxed text-foreground/80">
                                "{email.summary}"
                            </div>

                            <a
                                href={`https://mail.google.com/mail/u/0/#inbox/${email.threadId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-md border border-border hover:bg-muted transition-colors group-hover:border-primary/20"
                            >
                                View Original Email
                                <ExternalLink size={14} />
                            </a>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
