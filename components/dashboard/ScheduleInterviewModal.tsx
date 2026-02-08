'use client';

import React, { useState } from 'react';
import { X, Calendar as CalendarIcon, Clock, Loader2 } from 'lucide-react';

interface ScheduleInterviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { scheduledAt: string }) => Promise<void>;
    candidateName: string;
}

export function ScheduleInterviewModal({ isOpen, onClose, onSubmit, candidateName }: ScheduleInterviewModalProps) {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!date || !time) return;

        setSubmitting(true);
        try {
            const scheduledAt = `${date}T${time}:00`;
            await onSubmit({ scheduledAt });
            onClose();
        } catch (error) {
            console.error('Failed to schedule interview:', error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-card border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-6 border-b border-border bg-muted/30">
                    <h2 className="text-xl font-bold">Schedule Interview</h2>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <p className="text-sm text-muted-foreground mb-4">
                            Schedule a 10-minute video interview with <span className="font-semibold text-foreground">{candidateName}</span>.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4 text-primary" />
                                Date
                            </label>
                            <input
                                type="date"
                                required
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <Clock className="h-4 w-4 text-primary" />
                                Time
                            </label>
                            <input
                                type="time"
                                required
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 px-4 rounded-xl border border-border font-medium hover:bg-muted transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || !date || !time}
                            className="flex-1 py-2.5 px-4 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Scheduling...
                                </>
                            ) : (
                                'Confirm Schedule'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
