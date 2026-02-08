"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { MainLayout } from "@/components/layout/MainLayout";
import {
    Search,
    Bell,
    Share2,
    UserCheck,
    Plus,
    ChevronLeft,
    ChevronDown,
    FileText,
    MessageCircle,
    Pencil,
    Briefcase,
    MapPin,
    Clock,
    Loader2,
    Users,
    Building2,
    MoreVertical,
} from "lucide-react";

// ─── Interfaces ──────────────────────────────────────────────────────────

interface Job {
    id: string;
    title: string;
    description?: string;
    company_name: string;
    location: string;
    job_type: string;
    experience_level?: string;
    status: string;
    created_at: string;
    activeUntil?: string; // Derived or mock
    department?: string; // Derived or mock
    deptColor?: string; // Mock for UI
    deptBg?: string; // Mock for UI
    deptDot?: string; // Mock for UI
    _count?: {
        applications: number;
    };
}

interface Candidate {
    id: string;
    name: string;
    email: string;
    initials: string;
    avatarColor: string;
    source: string;
    files: number;
    comments: number;
    status: "SOURCED" | "IN_PROGRESS" | "INTERVIEW" | "HIRED" | "REJECTED"; // Mapped status
    ats_score?: number;
    ats_missing_skills?: string[];
    ats_reasons?: string[];
    social_data?: any;
    resume_url?: string;
}

// ─── Top Bar ─────────────────────────────────────────────────────────────
function TopBar() {
    return (
        <div className="flex items-center justify-between mb-6">
            <div className="relative w-[320px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search keyword..."
                    className="w-full pl-10 pr-16 py-2.5 bg-white dark:bg-card border border-gray-200 dark:border-border rounded-xl text-sm text-gray-600 dark:text-muted-foreground placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[11px] text-gray-400 bg-gray-100 dark:bg-muted rounded-md px-1.5 py-0.5">
                    <span>&#8984;</span>
                    <span>K</span>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <button className="w-10 h-10 rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-card flex items-center justify-center text-gray-500 dark:text-muted-foreground hover:bg-gray-50 dark:hover:bg-accent">
                    <Bell className="w-[18px] h-[18px]" />
                </button>
                <button className="w-10 h-10 rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-card flex items-center justify-center text-gray-500 dark:text-muted-foreground hover:bg-gray-50 dark:hover:bg-accent">
                    <Share2 className="w-[18px] h-[18px]" />
                </button>
            </div>
        </div>
    );
}

// ─── Job Card ────────────────────────────────────────────────────────────
function JobCard({ job, onClick }: { job: Job; onClick: () => void }) {
    // Mock UI properties based on real data if possible, or random standards
    const deptColor = job.deptColor || "text-indigo-700 dark:text-indigo-300";
    const deptBg = job.deptBg || "bg-indigo-50 dark:bg-indigo-900/20";
    const deptDot = job.deptDot || "bg-indigo-500";
    const department = job.department || "Development"; // Fallback/Mock
    const activeUntil = job.activeUntil || new Date(new Date(job.created_at).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString();

    return (
        <div
            onClick={onClick}
            className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border p-5 hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full"
        >
            <div className="flex items-center gap-1.5 mb-3">
                <span className="text-[11px] text-gray-400">Active until:</span>
                <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                    {activeUntil}
                </span>
            </div>
            <div className="flex justify-between items-start mb-2 gap-2">
                <h3 className="text-[15px] font-bold text-gray-900 dark:text-foreground line-clamp-2">{job.title}</h3>
                {job.status === 'LIVE' && <span className="w-2 h-2 rounded-full bg-green-500 shrink-0 mt-1.5" title="Live"></span>}
                {job.status === 'CLOSED' && <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 mt-1.5" title="Closed"></span>}
            </div>

            <p className="text-[13px] text-gray-500 dark:text-muted-foreground leading-relaxed mb-4 line-clamp-3 flex-1">
                {job.description || "No description provided."}
            </p>

            <div className="flex items-center gap-2 flex-wrap mt-auto">
                <span
                    className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${deptBg} ${deptColor}`}
                >
                    <span className={`w-1.5 h-1.5 rounded-full ${deptDot}`}></span>
                    {department}
                </span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-muted px-2.5 py-1 rounded-full">
                    {job.job_type}
                </span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-muted px-2.5 py-1 rounded-full">
                    {job._count?.applications || 0} Apps
                </span>
            </div>
        </div>
    );
}

// ─── Job List View ───────────────────────────────────────────────────────
function JobListView({
    jobs,
    loading,
    onSelectJob,
    onSearch,
    searchTerm
}: {
    jobs: Job[],
    loading: boolean,
    onSelectJob: (job: Job) => void,
    onSearch: (term: string) => void,
    searchTerm: string
}) {
    // Filter jobs strictly for display
    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                        <UserCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-foreground">Recruitment</h1>
                        <p className="text-sm text-gray-400 dark:text-muted-foreground">Manage recruitment process</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search jobs..."
                            value={searchTerm}
                            onChange={(e) => onSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-card border border-gray-200 dark:border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                    <Link href="/jobopening/create" className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 rounded-xl text-sm font-medium text-white hover:bg-indigo-700 whitespace-nowrap">
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">Create Job</span>
                    </Link>
                </div>
            </div>

            {/* Loading & Empty States */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                </div>
            ) : filteredJobs.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-card rounded-xl border border-dashed border-gray-300 dark:border-border">
                    <Briefcase className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-foreground">No jobs found</h3>
                    <p className="text-gray-500 dark:text-muted-foreground mb-6">Try adjusting your search or create a new job.</p>
                </div>
            ) : (
                /* Job Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredJobs.map((job) => (
                        <JobCard key={job.id} job={job} onClick={() => onSelectJob(job)} />
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Avatar ──────────────────────────────────────────────────────────────
function Avatar({
    initials,
    color,
    size = "sm",
    image,
}: {
    initials: string;
    color: string;
    size?: "sm" | "md" | "lg";
    image?: string;
}) {
    const sizeClass =
        size === "lg"
            ? "w-10 h-10 text-xs"
            : size === "md"
                ? "w-9 h-9 text-[11px]"
                : "w-8 h-8 text-[10px]";
    if (image) {
        return (
            <div className={`${sizeClass} rounded-full overflow-hidden bg-gray-200 dark:bg-muted shrink-0`}>
                <img src={image} alt={initials} className="w-full h-full object-cover" />
            </div>
        );
    }
    return (
        <div
            className={`${sizeClass} rounded-full flex items-center justify-center font-semibold shrink-0 ${color}`}
        >
            {initials}
        </div>
    );
}

// ─── Job Description Tab ─────────────────────────────────────────────────
function JobDescriptionTab({ job }: { job: Job }) {
    const activeUntil = job.activeUntil || new Date(new Date(job.created_at).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString();

    return (
        <div className="flex flex-col lg:flex-row gap-6">
            {/* Left content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-foreground">Job Description</h2>
                    <button className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-border bg-white dark:bg-card rounded-xl px-4 py-2 hover:bg-gray-50 dark:hover:bg-accent font-medium">
                        <Pencil className="w-4 h-4" />
                        Edit
                    </button>
                </div>

                {/* Description */}
                <div className="mb-6">
                    <h3 className="text-base font-bold text-gray-900 dark:text-foreground mb-3">About the Role</h3>
                    <div className="text-sm text-gray-600 dark:text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {job.description || "No description provided."}
                    </div>
                </div>

                {/* Requirements (Mock if not in DB, assuming description contains it) */}
                {/* <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-foreground mb-3">Requirements:</h3>
           <p className="text-sm text-gray-600 dark:text-muted-foreground">See description above.</p>
        </div> */}
            </div>

            {/* Right sidebar info */}
            <div className="w-full lg:w-[260px] shrink-0">
                <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border p-5 space-y-5">
                    <div>
                        <p className="text-xs text-gray-400 mb-1">Active until</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-foreground">{activeUntil}</p>
                    </div>
                    <div className="border-t border-gray-100 dark:border-border pt-4">
                        <p className="text-xs text-gray-400 mb-1">Company</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-foreground flex items-center gap-2">
                            <Building2 className="w-3.5 h-3.5" />
                            {job.company_name}
                        </p>
                    </div>
                    <div className="border-t border-gray-100 dark:border-border pt-4">
                        <p className="text-xs text-gray-400 mb-1">Job Type</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-foreground flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5" />
                            {job.job_type}
                        </p>
                    </div>
                    <div className="border-t border-gray-100 dark:border-border pt-4">
                        <p className="text-xs text-gray-400 mb-1">Location</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-foreground flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5" />
                            {job.location}
                        </p>
                    </div>
                    <div className="border-t border-gray-100 dark:border-border pt-4">
                        <p className="text-xs text-gray-400 mb-1">Experience</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-foreground">
                            {job.experience_level || "Not specified"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Candidate Details Modal ─────────────────────────────────────────────

function CandidateDetailsModal({
    candidate,
    isOpen,
    onClose
}: {
    candidate: Candidate | null;
    isOpen: boolean;
    onClose: () => void;
}) {
    if (!isOpen || !candidate) return null;

    // Helper for score badge
    const getScoreBadgeClass = (score: number | undefined) => {
        if (score === undefined) return 'bg-gray-100 text-gray-600 dark:bg-muted dark:text-muted-foreground';
        if (score >= 80) return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300';
        if (score >= 60) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300';
        return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';
    };

    const getScoreLabel = (score: number | undefined) => {
        if (score === undefined) return 'Pending';
        if (score >= 80) return 'Strong Match';
        if (score >= 60) return 'Potential Match';
        return 'Weak Match';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-card w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-border flex items-start justify-between bg-gray-50/50 dark:bg-muted/10">
                    <div className="flex items-center gap-4">
                        <Avatar initials={candidate.initials} color={candidate.avatarColor} size="lg" />
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-foreground">{candidate.name}</h2>
                            <p className="text-sm text-gray-500 dark:text-muted-foreground">{candidate.email}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-muted text-gray-600 dark:text-muted-foreground">
                                    {candidate.source}
                                </span>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreBadgeClass(candidate.ats_score)}`}>
                                    {candidate.ats_score !== undefined ? `${candidate.ats_score}% - ${getScoreLabel(candidate.ats_score)}` : 'ATS Pending'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-muted rounded-full transition-colors">
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* 1. Links & Resume */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {candidate.resume_url && (
                            <a href={candidate.resume_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-border hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all group">
                                <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-foreground">Resume</p>
                                    <p className="text-xs text-gray-500 dark:text-muted-foreground">View PDF</p>
                                </div>
                            </a>
                        )}
                        {/* Add GitHub/Portfolio if available in schema/interface */}
                    </div>

                    {/* 2. ATS Analysis */}
                    {candidate.ats_missing_skills && candidate.ats_missing_skills.length > 0 && (
                        <div>
                            <h3 className="text-base font-bold text-gray-900 dark:text-foreground mb-3 flex items-center gap-2">
                                <span className="w-1 h-4 bg-red-500 rounded-full"></span>
                                Missing Skills
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {candidate.ats_missing_skills.map((skill: string, i: number) => (
                                    <span key={i} className="px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-100 dark:border-red-900/30">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 3. Social Analysis */}
                    {candidate.social_data && (
                        <div className="bg-gray-50 dark:bg-muted/30 rounded-2xl p-5 border border-gray-100 dark:border-border">
                            <h3 className="text-base font-bold text-gray-900 dark:text-foreground mb-4 flex items-center gap-2">
                                <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                                Social Presence Analysis
                            </h3>

                            {candidate.social_data.error ? (
                                <div className="flex items-center gap-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/10 p-4 rounded-xl">
                                    <UserCheck className="w-5 h-5" />
                                    <span>{candidate.social_data.error}</span>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Risk Badge */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                                <Share2 className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900 dark:text-foreground">LinkedIn Activity</p>
                                                <p className="text-xs text-gray-500">Based on recent posts & comments</p>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${candidate.social_data.harassment_risk === 'High' ? 'bg-red-50 text-red-600 border-red-200' :
                                            candidate.social_data.harassment_risk === 'Medium' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                                                'bg-green-50 text-green-600 border-green-200'
                                            }`}>
                                            {candidate.social_data.harassment_risk} Risk
                                        </span>
                                    </div>

                                    {/* Metrics Grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white dark:bg-card p-4 rounded-xl border border-gray-100 dark:border-border">
                                            <p className="text-xs text-gray-500 mb-1">Avg. Toxicity</p>
                                            <p className={`text-2xl font-bold ${candidate.social_data.average_toxicity > 0.5 ? 'text-red-500' : 'text-green-500'}`}>
                                                {(candidate.social_data.average_toxicity * 100).toFixed(0)}%
                                            </p>
                                        </div>
                                        <div className="bg-white dark:bg-card p-4 rounded-xl border border-gray-100 dark:border-border">
                                            <p className="text-xs text-gray-500 mb-1">Profanity Ratio</p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-foreground">
                                                {(candidate.social_data.profane_ratio * 100).toFixed(0)}%
                                            </p>
                                        </div>
                                    </div>

                                    {/* Latest Post Snippet */}
                                    {candidate.social_data.posts && candidate.social_data.posts.length > 0 && (
                                        <div className="bg-white dark:bg-card p-4 rounded-xl border border-gray-100 dark:border-border">
                                            <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Latest Post Analysis</p>
                                            <p className="text-sm text-gray-600 dark:text-muted-foreground italic mb-3">
                                                "{candidate.social_data.posts[0].text.substring(0, 120)}..."
                                            </p>
                                            <div className="flex gap-2">
                                                <span className={`text-[10px] px-2 py-0.5 rounded bg-gray-100 dark:bg-muted ${candidate.social_data.posts[0].toxicity.toxicity > 0.5 ? 'text-red-600' : 'text-green-600'}`}>
                                                    Toxicity: {(candidate.social_data.posts[0].toxicity.toxicity * 100).toFixed(0)}%
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 dark:border-border bg-gray-50/50 dark:bg-muted/10 flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 dark:hover:bg-muted transition-colors">
                        Close
                    </button>
                    <button className="px-5 py-2.5 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none transition-all">
                        Schedule Interview
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Candidates Tab ──────────────────────────────────────────────────────

function CandidateCard({ candidate, onClick }: { candidate: Candidate; onClick: () => void }) {
    return (
        <div
            onClick={onClick}
            className="bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-border p-3.5 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-indigo-200 dark:hover:border-indigo-800/50 group"
        >
            <div className="flex items-center gap-2.5 mb-3">
                <Avatar initials={candidate.initials} color={candidate.avatarColor} size="md" />
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-foreground truncate group-hover:text-indigo-600 transition-colors" title={candidate.name}>{candidate.name}</p>
                    <p className="text-[11px] text-gray-400 truncate" title={candidate.email}>{candidate.email}</p>
                </div>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                    {/* Mock source icon/text */}
                    <span className="bg-gray-100 dark:bg-muted px-1.5 py-0.5 rounded text-[10px]">{candidate.source}</span>
                </div>
                {(candidate.files > 0 || candidate.comments > 0) && (
                    <div className="flex items-center gap-3 text-[11px] text-gray-400">
                        {candidate.files > 0 && (
                            <div className="flex items-center gap-1" title="Resume/Files">
                                <FileText className="w-3.5 h-3.5" />
                                <span>{candidate.files}</span>
                            </div>
                        )}
                        {candidate.comments > 0 && (
                            <div className="flex items-center gap-1" title="Comments">
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>{candidate.comments}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
            {candidate.ats_score !== undefined && (
                <div className="mt-2.5 pt-2 border-t border-gray-50 dark:border-border/50 flex justify-between items-center">
                    <span className="text-[10px] text-gray-400">ATS Score</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${candidate.ats_score >= 70 ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' :
                        candidate.ats_score >= 50 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300' :
                            'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                        }`}>
                        {candidate.ats_score}%
                    </span>
                </div>
            )}
        </div>
    );
}

function CandidatesTab({ jobId, userToken }: { jobId: string, userToken: string }) {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

    // Fetch candidates from API
    useEffect(() => {
        async function fetchCandidates() {
            setLoading(true);
            try {
                // Use the token in the header as required by the API
                const res = await fetch(`/api/applications/${jobId}`, {
                    headers: {
                        'Authorization': `Bearer ${userToken}`
                    }
                });

                if (res.ok) {
                    const data = await res.json();

                    // Map API response to Candidate interface
                    const mappedCandidates: Candidate[] = data.applications.map((app: any) => {
                        // Determine status
                        let status: Candidate['status'] = 'SOURCED';
                        if (app.interviews && app.interviews.length > 0) {
                            status = 'INTERVIEW';
                        } else if (app.ats_decision === 'Qualified' || (app.ats_score || 0) >= 70) {
                            status = 'IN_PROGRESS';
                        } else if (app.ats_decision === 'Rejected') {
                            status = 'REJECTED'; // Should we hint this?
                        }

                        // Colors
                        const colors = [
                            "bg-pink-100 text-pink-600 dark:bg-pink-900/40 dark:text-pink-300",
                            "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300",
                            "bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300",
                            "bg-teal-100 text-teal-600 dark:bg-teal-900/40 dark:text-teal-300",
                            "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300",
                            "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300"
                        ];
                        const randomColor = colors[Math.floor(Math.random() * colors.length)];
                        const initials = app.candidate_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

                        return {
                            id: app.id,
                            name: app.candidate_name,
                            email: app.candidate_email,
                            initials: initials || 'NA',
                            avatarColor: randomColor,
                            source: app.linkedin_url ? "LinkedIn" : "Manual",
                            files: app.resume_url ? 1 : 0,
                            comments: 0, // Need to implement comments fetching if needed
                            status: status,
                            ats_score: app.ats_score,
                            // Extra fields for modal
                            ats_missing_skills: app.ats_missing_skills,
                            ats_reasons: app.ats_reasons,
                            social_data: app.social_data,
                            resume_url: app.resume_url
                        };
                    });
                    setCandidates(mappedCandidates);
                } else {
                    console.error("Failed to fetch candidates");
                }
            } catch (err) {
                console.error("Error fetching candidates:", err);
            } finally {
                setLoading(false);
            }
        }

        if (jobId && userToken) {
            fetchCandidates();
        }
    }, [jobId, userToken]);

    // Group candidates by status
    const columns = [
        { title: "SOURCED", id: "SOURCED", color: "bg-yellow-400", bg: "bg-yellow-400" },
        { title: "IN PROGRESS", id: "IN_PROGRESS", color: "bg-blue-500", bg: "bg-blue-500" },
        { title: "INTERVIEW", id: "INTERVIEW", color: "bg-purple-500", bg: "bg-purple-500" },
        // { title: "HIRED", id: "HIRED", color: "bg-green-500", bg: "bg-green-500" },
    ];

    const filteredCandidates = candidates.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;
    }

    return (
        <div>
            {/* Modal */}
            <CandidateDetailsModal
                candidate={selectedCandidate}
                isOpen={!!selectedCandidate}
                onClose={() => setSelectedCandidate(null)}
            />

            <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-gray-900 dark:text-foreground">Candidates ({candidates.length})</h2>
                <div className="relative w-[220px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-card border border-gray-200 dark:border-border rounded-xl text-sm text-gray-600 dark:text-muted-foreground placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>
            </div>

            {/* Kanban columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 overflow-x-auto pb-4">
                {columns.map((col) => {
                    const colCandidates = filteredCandidates.filter(c => c.status === col.id);
                    return (
                        <div key={col.id} className="min-w-[280px]">
                            {/* Column header */}
                            <div className="flex items-center gap-2 mb-3">
                                <div className={`h-8 rounded-lg flex-1 flex items-center px-3 ${col.bg} bg-opacity-10 dark:bg-opacity-20`}>
                                    <span className={`text-xs font-bold tracking-wider text-gray-700 dark:text-foreground`}>{col.title}</span>
                                </div>
                                <span className="w-6 h-6 rounded-full bg-gray-200 dark:bg-muted text-gray-600 dark:text-muted-foreground text-[10px] font-bold flex items-center justify-center shrink-0">
                                    {colCandidates.length}
                                </span>
                            </div>

                            {/* Cards */}
                            <div className="space-y-3">
                                {colCandidates.map((c) => (
                                    <CandidateCard
                                        key={c.id}
                                        candidate={c}
                                        onClick={() => setSelectedCandidate(c)}
                                    />
                                ))}
                                {colCandidates.length === 0 && (
                                    <div className="text-center py-8 border-2 border-dashed border-gray-100 dark:border-border/50 rounded-xl">
                                        <p className="text-xs text-gray-400">No candidates</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Tab Navigation ──────────────────────────────────────────────────────
function TabNav({
    activeTab,
    setActiveTab,
}: {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}) {
    const tabs = [
        { id: "description", label: "Job Description", icon: Briefcase }, // Changed icon to standard
        { id: "candidates", label: "Candidates", icon: Users },
    ];
    return (
        <div className="flex border-b border-gray-200 dark:border-border mb-6">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                        ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                        : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        }`}
                >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                </button>
            ))}
        </div>
    );
}

// ─── Recruitment Page ────────────────────────────────────────────────────
export default function RecruitmentJobsPage() {
    const { user, signOut } = useAuth();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [activeTab, setActiveTab] = useState("description");
    const [searchTerm, setSearchTerm] = useState("");
    const [accessToken, setAccessToken] = useState<string>("");

    // Get Access Token
    useEffect(() => {
        if (user) {
            user.getIdToken().then(setAccessToken).catch(console.error);
        }
    }, [user]);

    // Fetch Jobs Logic from original page
    useEffect(() => {
        async function fetchJobs() {
            setLoading(true);
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

    return (
        <MainLayout user={user} onSignIn={() => { }} onSignOut={signOut}>
            <div className="bg-gray-50/80 dark:bg-background min-h-screen">
                <div className="max-w-[1400px] mx-auto p-4 md:p-6">
                    <TopBar />

                    {!selectedJob ? (
                        <JobListView
                            jobs={jobs}
                            loading={loading}
                            onSelectJob={(job) => {
                                setSelectedJob(job);
                                setActiveTab("description"); // Reset tab on selection
                            }}
                            onSearch={setSearchTerm}
                            searchTerm={searchTerm}
                        />
                    ) : (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            {/* Back to Job List */}
                            <button
                                onClick={() => {
                                    setSelectedJob(null);
                                    setActiveTab("description");
                                }}
                                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-3"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Back to Job List
                            </button>

                            {/* Title */}
                            <div className="mb-5">
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground mb-1">
                                    {selectedJob.title}
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-muted-foreground">
                                    {selectedJob.company_name} · {selectedJob.location}
                                </p>
                            </div>

                            {/* Tabs */}
                            <TabNav activeTab={activeTab} setActiveTab={setActiveTab} />

                            {activeTab === "description" && (
                                <JobDescriptionTab job={selectedJob} />
                            )}
                            {activeTab === "candidates" && (
                                <CandidatesTab jobId={selectedJob.id} userToken={accessToken} />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
