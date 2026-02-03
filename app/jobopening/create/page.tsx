'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { ArrowLeft, Loader2, Plus, X } from 'lucide-react';

export default function CreateJobPage() {
    const router = useRouter();
    const { user, dbUser, role, loading } = useAuth();

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [title, setTitle] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [location, setLocation] = useState('');
    const [jobType, setJobType] = useState('Full-time');
    const [experienceLevel, setExperienceLevel] = useState('Entry');
    const [description, setDescription] = useState('');
    const [responsibilities, setResponsibilities] = useState<string[]>(['']);
    const [requiredSkills, setRequiredSkills] = useState<string[]>(['']);
    const [preferredSkills, setPreferredSkills] = useState<string[]>(['']);
    const [stipend, setStipend] = useState('');

    // Protect route
    useEffect(() => {
        if (!loading && (!user || role !== 'HR')) {
            router.push('/login');
        }
    }, [user, role, loading, router]);

    const addItem = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
        setter((prev) => [...prev, '']);
    };

    const removeItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number) => {
        setter((prev) => prev.filter((_, i) => i !== index));
    };

    const updateItem = (
        setter: React.Dispatch<React.SetStateAction<string[]>>,
        index: number,
        value: string
    ) => {
        setter((prev) => prev.map((item, i) => (i === index ? value : item)));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            const token = await user?.getIdToken();

            const response = await fetch('/api/job/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title,
                    company_name: companyName,
                    location,
                    job_type: jobType,
                    experience_level: experienceLevel,
                    description,
                    responsibilities: responsibilities.filter((r) => r.trim()),
                    required_skills: requiredSkills.filter((s) => s.trim()),
                    preferred_skills: preferredSkills.filter((s) => s.trim()),
                    stipend: stipend || null,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create job');
            }

            router.push('/dashboard?tab=jobs');
        } catch (err: any) {
            setError(err.message || 'Failed to create job');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user || role !== 'HR') {
        return null;
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center gap-4">
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            <span>Back to Dashboard</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Form */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold">Create Job Opening</h1>
                    <p className="text-muted-foreground">
                        Fill in the details below to post a new job opening
                    </p>
                </div>

                {error && (
                    <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Info */}
                    <section className="bg-card border border-border rounded-xl p-6">
                        <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium mb-1.5">Job Title *</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Senior Software Engineer"
                                    required
                                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1.5">Company Name *</label>
                                <input
                                    type="text"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    placeholder="e.g. Acme Corp"
                                    required
                                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1.5">Location *</label>
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="e.g. Remote, New York, NY"
                                    required
                                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1.5">Job Type *</label>
                                <select
                                    value={jobType}
                                    onChange={(e) => setJobType(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                >
                                    <option>Full-time</option>
                                    <option>Part-time</option>
                                    <option>Contract</option>
                                    <option>Internship</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1.5">Experience Level *</label>
                                <select
                                    value={experienceLevel}
                                    onChange={(e) => setExperienceLevel(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                >
                                    <option>Entry</option>
                                    <option>Mid</option>
                                    <option>Senior</option>
                                    <option>Lead</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1.5">Stipend / Salary</label>
                                <input
                                    type="text"
                                    value={stipend}
                                    onChange={(e) => setStipend(e.target.value)}
                                    placeholder="e.g. $100,000 - $150,000"
                                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Description */}
                    <section className="bg-card border border-border rounded-xl p-6">
                        <h2 className="text-lg font-semibold mb-4">Job Description</h2>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe the role, team, and what the candidate will be working on..."
                            required
                            rows={6}
                            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                        />
                    </section>

                    {/* Responsibilities */}
                    <section className="bg-card border border-border rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Responsibilities</h2>
                            <button
                                type="button"
                                onClick={() => addItem(setResponsibilities)}
                                className="flex items-center gap-1 text-sm text-primary hover:underline"
                            >
                                <Plus className="h-4 w-4" />
                                Add
                            </button>
                        </div>
                        <div className="space-y-2">
                            {responsibilities.map((item, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={item}
                                        onChange={(e) => updateItem(setResponsibilities, index, e.target.value)}
                                        placeholder="Enter a responsibility..."
                                        className="flex-1 px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    />
                                    {responsibilities.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeItem(setResponsibilities, index)}
                                            className="p-2.5 text-muted-foreground hover:text-destructive transition-colors"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Required Skills */}
                    <section className="bg-card border border-border rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Required Skills</h2>
                            <button
                                type="button"
                                onClick={() => addItem(setRequiredSkills)}
                                className="flex items-center gap-1 text-sm text-primary hover:underline"
                            >
                                <Plus className="h-4 w-4" />
                                Add
                            </button>
                        </div>
                        <div className="space-y-2">
                            {requiredSkills.map((item, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={item}
                                        onChange={(e) => updateItem(setRequiredSkills, index, e.target.value)}
                                        placeholder="Enter a required skill..."
                                        className="flex-1 px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    />
                                    {requiredSkills.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeItem(setRequiredSkills, index)}
                                            className="p-2.5 text-muted-foreground hover:text-destructive transition-colors"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Preferred Skills */}
                    <section className="bg-card border border-border rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Preferred Skills (Optional)</h2>
                            <button
                                type="button"
                                onClick={() => addItem(setPreferredSkills)}
                                className="flex items-center gap-1 text-sm text-primary hover:underline"
                            >
                                <Plus className="h-4 w-4" />
                                Add
                            </button>
                        </div>
                        <div className="space-y-2">
                            {preferredSkills.map((item, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={item}
                                        onChange={(e) => updateItem(setPreferredSkills, index, e.target.value)}
                                        placeholder="Enter a preferred skill..."
                                        className="flex-1 px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    />
                                    {preferredSkills.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeItem(setPreferredSkills, index)}
                                            className="p-2.5 text-muted-foreground hover:text-destructive transition-colors"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Submit */}
                    <div className="flex items-center justify-end gap-4">
                        <Link
                            href="/dashboard"
                            className="px-6 py-2.5 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                            {submitting ? 'Creating...' : 'Create Job Opening'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
