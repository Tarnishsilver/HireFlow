'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { Briefcase, MapPin, Clock, Plus, Loader2, Users, Building2, Search } from 'lucide-react';
import { motion } from 'framer-motion';

interface Job {
    id: string;
    title: string;
    company_name: string;
    location: string;
    job_type: string;
    experience_level: string;
    status: string;
    created_at: string;
    _count: {
        applications: number;
    };
}

export default function RecruitmentJobsPage() {
    const { user, dbUser, signOut } = useAuth();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        async function fetchJobs() {
            try {
                // Fetch internal jobs (for HR)
                const response = await fetch(`/api/job/list?internal=true`);
                const data = await response.json();
                if (response.ok) {
                    setJobs(data.jobs);
                }
            } catch (err) {
                console.error('Failed to fetch jobs:', err);
            } finally {
                setLoading(false);
            }
        }
        if (user) fetchJobs();
    }, [user]);

    const filteredJobs = jobs.filter(job => {
        const matchesStatus = filterStatus === 'ALL' || job.status === filterStatus;
        const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.company_name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    return (
        <MainLayout user={user} onSignIn={() => { }} onSignOut={signOut}>
            <div className="max-w-[1920px] mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-foreground">Recruitment</h1>
                        <p className="text-slate-500 dark:text-muted-foreground">Manage job openings and track candidates</p>
                    </div>
                    <Link
                        href="/jobopening/create"
                        className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200 dark:shadow-none"
                    >
                        <Plus className="w-5 h-5" />
                        Create New Job
                    </Link>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-xl p-4 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search active jobs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-muted border border-slate-200 dark:border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <span className="text-sm font-medium text-slate-500 dark:text-muted-foreground whitespace-nowrap">Filter by:</span>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full md:w-48 px-3 py-2 bg-white dark:bg-background border border-slate-200 dark:border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        >
                            <option value="ALL">All Status</option>
                            <option value="LIVE">Active (Live)</option>
                            <option value="CLOSED">Closed</option>
                            <option value="DRAFT">Draft</option>
                        </select>
                    </div>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                    </div>
                ) : filteredJobs.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-card rounded-xl border border-dashed border-slate-300 dark:border-border">
                        <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-slate-900 dark:text-foreground">No jobs found</h3>
                        <p className="text-slate-500 dark:text-muted-foreground mb-6">Try adjusting your filters or create a new job.</p>
                        <Link href="/jobopening/create" className="text-indigo-600 font-medium hover:underline">Create Job</Link>
                    </div>
                ) : (
                    /* Job Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredJobs.map((job) => (
                            <Link
                                key={job.id}
                                href={`/recruitment/jobs/${job.id}`}
                                className="group block"
                            >
                                <motion.div
                                    whileHover={{ y: -2 }}
                                    className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-xl p-6 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-500 transition-all h-full flex flex-col"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                            <Briefcase className="w-5 h-5" />
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${job.status === 'LIVE' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                                            job.status === 'CLOSED' ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                                                'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                                            }`}>
                                            {job.status}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold text-slate-900 dark:text-foreground mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                                        {job.title}
                                    </h3>
                                    <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-muted-foreground mb-4">
                                        <Building2 className="w-3.5 h-3.5" />
                                        {job.company_name}
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-6">
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-muted rounded text-xs text-slate-600 dark:text-muted-foreground">
                                            <MapPin className="w-3 h-3" />
                                            {job.location}
                                        </span>
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-muted rounded text-xs text-slate-600 dark:text-muted-foreground">
                                            <Clock className="w-3 h-3" />
                                            {job.job_type}
                                        </span>
                                    </div>

                                    <div className="mt-auto pt-4 border-t border-slate-100 dark:border-border flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-muted-foreground">
                                            <Users className="w-4 h-4" />
                                            <span className="font-medium">{job._count?.applications || 0}</span>
                                            <span>Candidates</span>
                                        </div>

                                        <span className="text-indigo-600 dark:text-indigo-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                            View Details &rarr;
                                        </span>
                                    </div>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
