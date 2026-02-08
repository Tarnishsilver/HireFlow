'use client';

import { MOCK_CANDIDATES } from '@/lib/mock-data/candidates';
import CandidateCard from '@/components/interview/CandidateCard';
import { Users, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { useDemoStore } from '@/lib/store/useDemoStore';
import React from 'react';

export default function HRDashboard() {
    const { isAnonymousMode } = useDemoStore();

    // Simple stats based on mock data
    const totalCandidates = MOCK_CANDIDATES.length;
    const interviewed = MOCK_CANDIDATES.filter(c => c.status === 'Interviewed' || c.status === 'Offer' || c.status === 'Rejected').length;
    const pending = totalCandidates - interviewed;
    const avgScore = Math.round(MOCK_CANDIDATES.reduce((acc, c) => acc + c.matchScore, 0) / (totalCandidates || 1));

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Welcome & Stats */}
            <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <StatCard
                        icon={<Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                        label="Total Candidates"
                        value={totalCandidates}
                        color="bg-blue-50 dark:bg-blue-900/20"
                    />
                    <StatCard
                        icon={<CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />}
                        label="Completed"
                        value={interviewed}
                        color="bg-green-50 dark:bg-green-900/20"
                    />
                    <StatCard
                        icon={<Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
                        label="Pending"
                        value={pending}
                        color="bg-amber-50 dark:bg-amber-900/20"
                    />
                    <StatCard
                        icon={<TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
                        label="Avg. Score"
                        value={`${avgScore}%`}
                        color="bg-indigo-50 dark:bg-indigo-900/20"
                    />
                </div>
            </div>

            {/* Candidates List */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-foreground">Recent Interviews</h2>
                    <div className="flex gap-2">
                        <select className="px-3 py-2 rounded-lg border border-border text-sm bg-card text-foreground outline-none focus:ring-2 focus:ring-primary/20">
                            <option>All Roles</option>
                            <option>Backend</option>
                            <option>Frontend</option>
                        </select>
                        <select className="px-3 py-2 rounded-lg border border-border text-sm bg-card text-foreground outline-none focus:ring-2 focus:ring-primary/20">
                            <option>Status: All</option>
                            <option>Pending</option>
                            <option>Completed</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {MOCK_CANDIDATES.map((candidate) => (
                        <CandidateCard key={candidate.id} candidate={candidate} />
                    ))}
                </div>
            </div>

            {/* Audit Log / Recent Activity */}
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-border bg-muted/30">
                    <h3 className="font-bold text-foreground">System Audit Log</h3>
                </div>
                <div className="divide-y divide-border">
                    {[
                        { action: "Anonymous Mode Enabled", user: "Admin User", time: "2 mins ago", type: "system" },
                        { action: "Interview Config Updated (FAANG - High)", user: "HR Manager", time: "15 mins ago", type: "config" },
                        { action: "Report Generated: Candidate-842", user: "System AI", time: "1 hour ago", type: "report" },
                        { action: "Plagiarism Warning Triggered: Session #9921", user: "Automated Check", time: "3 hours ago", type: "alert" }
                    ].map((log, idx) => (
                        <div key={idx} className="px-6 py-3 flex items-center justify-between text-sm hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${log.type === 'alert' ? 'bg-red-500' :
                                    log.type === 'system' ? 'bg-indigo-500' : 'bg-slate-400'
                                    }`} />
                                <span className="font-medium text-foreground">{log.action}</span>
                            </div>
                            <div className="flex items-center gap-4 text-muted-foreground">
                                <span>{log.user}</span>
                                <span className="font-mono text-xs">{log.time}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string | number, color: string }) {
    return (
        <div className="bg-card p-5 rounded-xl border border-border shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
            <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-muted-foreground">{label}</p>
                <p className="text-2xl font-bold text-foreground">{value}</p>
            </div>
        </div>
    );
}
