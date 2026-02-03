'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { ArrowLeft, Loader2, Upload, CheckCircle, X } from 'lucide-react';
// import { storage } from '@/app/firebase';
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface Job {
    id: string;
    title: string;
    company_name: string;
}

export default function ApplyPage({ params }: { params: Promise<{ jobId: string }> }) {
    const { jobId } = use(params);
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [githubUrl, setGithubUrl] = useState('');
    const [portfolioUrl, setPortfolioUrl] = useState('');

    // Resume upload
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [resumeUrl, setResumeUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    // Protect route
    useEffect(() => {
        if (!authLoading && !user) {
            router.push(`/login?redirect=/apply/${jobId}`);
        }
    }, [user, authLoading, router, jobId]);

    // Pre-fill email from user
    useEffect(() => {
        if (user?.email) {
            setEmail(user.email);
        }
        if (user?.displayName) {
            setName(user.displayName);
        }
    }, [user]);

    // Fetch job details
    useEffect(() => {
        async function fetchJob() {
            try {
                const response = await fetch(`/api/job/${jobId}`);
                const data = await response.json();

                if (response.ok) {
                    setJob(data.job);
                } else {
                    setError(data.error || 'Job not found');
                }
            } catch (err) {
                setError('Failed to load job details');
            } finally {
                setLoading(false);
            }
        }

        fetchJob();
    }, [jobId]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];

        if (!allowedTypes.includes(file.type)) {
            setError('Please upload a PDF or DOC/DOCX file');
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('File size must be less than 5MB');
            return;
        }

        setResumeFile(file);
        setError(null);

        // Upload file via Proxy API to bypass CORS
        setUploading(true);
        try {
            const token = await user?.getIdToken();
            if (!token) throw new Error('You must be logged in to upload');

            const formData = new FormData();
            formData.append('file', file);
            formData.append('token', token);
            formData.append('folder', 'resumes');

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            setResumeUrl(data.url);
        } catch (err: any) {
            console.error('Upload error:', err);
            setError(err.message || 'Failed to upload resume');
            setResumeFile(null);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!resumeUrl) {
            setError('Please upload your resume');
            return;
        }

        setSubmitting(true);

        try {
            const token = await user?.getIdToken();

            const response = await fetch(`/api/apply/${jobId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    candidate_name: name,
                    candidate_email: email,
                    resume_url: resumeUrl,
                    github_url: githubUrl || null,
                    portfolio_url: portfolioUrl || null,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit application');
            }

            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Failed to submit application');
        } finally {
            setSubmitting(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <div className="text-center max-w-md">
                    <div className="inline-flex items-center justify-center h-16 w-16 bg-green-500/10 rounded-2xl mb-4">
                        <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Application Submitted!</h1>
                    <p className="text-muted-foreground mb-6">
                        Your application for <strong>{job?.title}</strong> at <strong>{job?.company_name}</strong> has been submitted successfully.
                    </p>
                    <Link
                        href="/jobopening"
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
                    >
                        Browse More Jobs
                    </Link>
                </div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <h2 className="text-xl font-semibold mb-2">Job Not Found</h2>
                    <p className="text-muted-foreground mb-6">{error}</p>
                    <Link href="/jobopening" className="text-primary font-medium hover:underline">
                        ← Back to Job Listings
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center gap-4">
                        <Link
                            href={`/jobopening/${jobId}`}
                            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            <span>Back to Job</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Form */}
            <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold">Apply for Position</h1>
                    <p className="text-muted-foreground">
                        {job.title} at {job.company_name}
                    </p>
                </div>

                {error && (
                    <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Personal Info */}
                    <section className="bg-card border border-border rounded-xl p-6">
                        <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Full Name *</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1.5">Email *</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Resume Upload */}
                    <section className="bg-card border border-border rounded-xl p-6">
                        <h2 className="text-lg font-semibold mb-4">Resume *</h2>

                        {resumeFile ? (
                            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                                <div className="flex items-center gap-3">
                                    {uploading ? (
                                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                    ) : (
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                    )}
                                    <div>
                                        <p className="font-medium text-sm">{resumeFile.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setResumeFile(null);
                                        setResumeUrl(null);
                                    }}
                                    className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors">
                                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                <p className="font-medium">Click to upload resume</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    PDF or DOC/DOCX (max 5MB)
                                </p>
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>
                        )}
                    </section>

                    {/* Links */}
                    <section className="bg-card border border-border rounded-xl p-6">
                        <h2 className="text-lg font-semibold mb-4">Additional Links (Optional)</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">GitHub Profile</label>
                                <input
                                    type="url"
                                    value={githubUrl}
                                    onChange={(e) => setGithubUrl(e.target.value)}
                                    placeholder="https://github.com/username"
                                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1.5">Portfolio Website</label>
                                <input
                                    type="url"
                                    value={portfolioUrl}
                                    onChange={(e) => setPortfolioUrl(e.target.value)}
                                    placeholder="https://yourportfolio.com"
                                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Submit */}
                    <div className="flex items-center justify-end gap-4">
                        <Link
                            href={`/jobopening/${jobId}`}
                            className="px-6 py-2.5 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={submitting || uploading || !resumeUrl}
                            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                            {submitting ? 'Submitting...' : 'Submit Application'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
