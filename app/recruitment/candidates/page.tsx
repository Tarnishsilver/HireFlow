'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { Users } from 'lucide-react';

export default function RecruitmentCandidatesPage() {
    const { user, signOut } = useAuth();

    return (
        <MainLayout user={user} onSignIn={() => { }} onSignOut={signOut}>
            <div className="min-h-screen bg-slate-50 dark:bg-background">
                <main className="max-w-[1920px] mx-auto px-6 py-8">
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-muted rounded-full flex items-center justify-center mb-6">
                            <Users className="w-8 h-8 text-slate-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-foreground mb-2">Candidates Overview</h1>
                        <p className="text-slate-500 dark:text-muted-foreground max-w-md mb-8">
                            To view candidates, please select a specific job from the Jobs board.
                        </p>
                        <Link
                            href="/recruitment/jobs"
                            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                        >
                            Go to Jobs
                        </Link>
                    </div>
                </main>
            </div>
        </MainLayout>
    );
}
