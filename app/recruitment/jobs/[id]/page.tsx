'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
import {
    Briefcase, MapPin, Clock, Building2, Loader2, Calendar,
    ChevronLeft, Mail, Linkedin, MoreVertical, FileText, CheckCircle2, Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface Job {
    id: string;
    title: string;
    company_name: string;
    location: string;
    job_type: string;
    description: string;
    department?: string;
    created_at: string;
    status: string;
}

interface Application {
    id: string;
    status: 'SOURCED' | 'IN_PROGRESS' | 'INTERVIEW' | 'HIRED' | 'REJECTED';
    candidate: {
        id: string;
        name: string;
        email: string;
        linkedin_url?: string;
        resume_url?: string;
        avatar?: string;
    };
    created_at: string;
    _count?: {
        interviews: number;
    }
}

// Kanban Column Component
const KanbanColumn = ({ title, count, color, applications }: { title: string, count: number, color: string, applications: Application[] }) => (
    <div className="flex-1 min-w-[280px] bg-slate-50 dark:bg-muted/30 rounded-xl p-4 flex flex-col h-full">
        <div className={`flex items-center justify-between mb-4 px-1`}>
            <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${color}`}></span>
                <h3 className="font-semibold text-slate-700 dark:text-slate-200 text-sm uppercase tracking-wide">{title}</h3>
            </div>
            <span className="bg-white dark:bg-muted text-slate-600 dark:text-slate-400 text-xs font-bold px-2 py-0.5 rounded-md border border-slate-200 dark:border-border">
                {count}
            </span>
        </div>

        <div className="space-y-3 overflow-y-auto pr-1 custom-scrollbar flex-1">
            {applications.map((app) => (
                <motion.div
                    layoutId={app.id}
                    key={app.id}
                    className="bg-white dark:bg-card p-4 rounded-lg border border-slate-200 dark:border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                >
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                                {app.candidate.avatar ? (
                                    <img src={app.candidate.avatar} alt={app.candidate.name} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    app.candidate.name.charAt(0)
                                )}
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm text-slate-900 dark:text-foreground line-clamp-1">{app.candidate.name}</h4>
                                <p className="text-xs text-slate-500 dark:text-muted-foreground line-clamp-1">{app.candidate.email}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100 dark:border-border/50">
                        {app.candidate.linkedin_url && (
                            <a href={app.candidate.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-slate-500 hover:text-[#0077b5] transition-colors">
                                <Linkedin className="w-3 h-3" />
                                <span className="hidden sm:inline">LinkedIn</span>
                            </a>
                        )}
                        <div className="flex items-center gap-1 text-xs text-slate-500 ml-auto">
                            <FileText className="w-3 h-3" />
                            <span>{app._count?.interviews || 0}</span>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    </div>
);

export default function JobRecruitmentPage() {
    const { id: jobId } = useParams();
    const { user, signOut } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Tab State
    const currentTab = searchParams.get('tab') || 'description';

    // Data State
    const [job, setJob] = useState<Job | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            if (!jobId) return;
            try {
                // Fetch Job Details
                const jobRes = await fetch(`/api/job/${jobId}`);
                const jobData = await jobRes.json();

                if (jobRes.ok) {
                    setJob(jobData.job);
                }

                // Fetch Applications for Kanban
                const appRes = await fetch(`/api/applications/list?jobId=${jobId}`);
                const appData = await appRes.json();

                if (appRes.ok) {
                    setApplications(appData.applications);
                }
            } catch (err) {
                console.error('Failed to fetch data:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [jobId]);

    const handleTabChange = (tab: string) => {
        router.push(`/recruitment/jobs/${jobId}?tab=${tab}`);
    };

    // Filter applications by status for Kanban
    const sourcedApps = applications.filter(a => a.status === 'SOURCED' || !a.status);
    const inProgressApps = applications.filter(a => a.status === 'IN_PROGRESS');
    const interviewApps = applications.filter(a => a.status === 'INTERVIEW');
    const hiredApps = applications.filter(a => a.status === 'HIRED');

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!job) return null;

    return (
        <MainLayout user={user} onSignIn={() => { }} onSignOut={signOut}>
            <div className="flex-1 max-w-[1920px] mx-auto w-full px-6 py-8 flex flex-col">
                {/* Breadcrumb & Header */}
                <div className="mb-6">
                    <Link href="/recruitment/jobs" className="inline-flex items-center text-sm text-slate-500 hover:text-indigo-600 mb-4 transition-colors">
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Back to Job List
                    </Link>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-foreground">{job.title}</h1>
                </div>

                {/* Tabs */}
                <div className="border-b border-slate-200 dark:border-border mb-6">
                    <nav className="flex items-center gap-8">
                        <button
                            onClick={() => handleTabChange('description')}
                            className={`pb-4 text-sm font-medium border-b-2 transition-colors ${currentTab === 'description'
                                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Briefcase className="w-4 h-4" />
                                Job Description
                            </div>
                        </button>
                        <button
                            onClick={() => handleTabChange('candidates')}
                            className={`pb-4 text-sm font-medium border-b-2 transition-colors ${currentTab === 'candidates'
                                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                Candidates
                            </div>
                        </button>
                    </nav>
                </div>

                {/* Content Area */}
                <div className="flex-1 min-h-0">
                    <AnimatePresence mode="wait">
                        {currentTab === 'description' ? (
                            <motion.div
                                key="description"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-white dark:bg-card rounded-xl border border-slate-200 dark:border-border p-8 shadow-sm"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-xl font-bold">Job Description</h2>
                                    <div className="flex gap-2">
                                        <Link href={`/jobopening/${job.id}/edit`} className="px-4 py-2 border border-slate-200 dark:border-border rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-muted transition-colors">
                                            Edit Description
                                        </Link>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                                    <div className="lg:col-span-2 space-y-8">
                                        <div>
                                            <h3 className="font-semibold text-lg mb-3">About Company</h3>
                                            <p className="text-slate-600 dark:text-muted-foreground leading-relaxed">
                                                {/* Placeholder if not in DB, else job.company_description */}
                                                We craft digital products for business and user goals. Help find solutions with UI / UX designs that are intuitive and in accordance with client business goals.
                                            </p>
                                        </div>

                                        <div>
                                            <h3 className="font-semibold text-lg mb-3">Job Details</h3>
                                            <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-muted-foreground">
                                                <p className="whitespace-pre-line">{job.description}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sidebar Info */}
                                    <div className="bg-slate-50 dark:bg-muted/30 rounded-xl p-6 h-fit border border-slate-100 dark:border-border">
                                        <div className="space-y-6">
                                            <div>
                                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Active until</label>
                                                <p className="font-medium text-slate-900 dark:text-foreground">Jan 31, 2024</p>
                                            </div>
                                            <div className="h-px bg-slate-200 dark:border-border w-full"></div>
                                            <div>
                                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Department Type</label>
                                                <p className="font-medium text-slate-900 dark:text-foreground">{job.department || 'Design'}</p>
                                            </div>
                                            <div className="h-px bg-slate-200 dark:border-border w-full"></div>
                                            <div>
                                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Job Type</label>
                                                <p className="font-medium text-slate-900 dark:text-foreground capitalize">{job.job_type}</p>
                                            </div>
                                            <div className="h-px bg-slate-200 dark:border-border w-full"></div>
                                            <div>
                                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Location</label>
                                                <p className="font-medium text-slate-900 dark:text-foreground">{job.location}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            /* Kanban Board */
                            <motion.div
                                key="candidates"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="h-[calc(100vh-280px)] overflow-x-auto pb-4"
                            >
                                <div className="flex gap-6 h-full min-w-[1000px]">
                                    <KanbanColumn
                                        title="Sourced"
                                        count={sourcedApps.length}
                                        color="bg-amber-400"
                                        applications={sourcedApps}
                                    />
                                    <KanbanColumn
                                        title="In Progress"
                                        count={inProgressApps.length}
                                        color="bg-blue-400"
                                        applications={inProgressApps}
                                    />
                                    <KanbanColumn
                                        title="Interview"
                                        count={interviewApps.length}
                                        color="bg-purple-400"
                                        applications={interviewApps}
                                    />
                                    <KanbanColumn
                                        title="Hired"
                                        count={hiredApps.length}
                                        color="bg-green-400"
                                        applications={hiredApps}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </MainLayout>
    );
}
