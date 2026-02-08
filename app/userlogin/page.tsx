'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPopup } from 'firebase/auth';
import { auth, userGoogleProvider } from '@/app/firebase';
import { useAuth } from '@/lib/auth/AuthContext';
import { Briefcase, Loader2, Zap, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function UserLoginPage() {
    const router = useRouter();
    const { user, role, loading, setRole } = useAuth();

    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Redirect if already logged in as CANDIDATE
    useEffect(() => {
        if (!loading && user && role === 'CANDIDATE') {
            router.push('/jobopening');
        }
    }, [user, role, loading, router]);

    const handleUserGoogleAuth = async () => {
        if (submitting) return; // Prevent double-clicks

        setError(null);
        setSubmitting(true);

        try {
            console.log('[Login] Starting Google Auth...');
            // Fast login - minimal scopes, no token storage needed
            const result = await signInWithPopup(auth, userGoogleProvider);
            console.log('[Login] Auth successful for:', result.user.email);

            // Auto-set role to CANDIDATE
            await setRole('CANDIDATE');
            console.log('[Login] Role set to CANDIDATE');

            router.push('/jobopening');
        } catch (err: any) {
            console.error('User Google auth error:', err);
            // Don't show "cancelled" errors to user as they are usually benign results of double clicks
            if (err.code !== 'auth/cancelled-popup-request') {
                setError(err.message || 'Authentication failed');
            }
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

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md">
                {/* Back Button */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to home
                </Link>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center h-14 w-14 bg-green-500/10 rounded-2xl mb-4">
                        <Briefcase className="h-7 w-7 text-green-500" />
                    </div>
                    <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
                        Job Seeker Login
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
                            <Zap className="h-3 w-3" />
                            Quick
                        </span>
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Browse and apply for jobs
                    </p>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* Google Sign In - Fast */}
                <button
                    onClick={handleUserGoogleAuth}
                    disabled={submitting}
                    className="w-full py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {submitting ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                    )}
                    {submitting ? 'Signing in...' : 'Continue with Google'}
                </button>

                <p className="mt-6 text-xs text-center text-muted-foreground">
                    Quick sign-in • No extra permissions required
                </p>
            </div>
        </div>
    );
}
