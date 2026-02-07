'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    signInWithPopup,
    GoogleAuthProvider
} from 'firebase/auth';
import { auth, googleProvider } from '@/app/firebase';
import { useAuth } from '@/lib/auth/AuthContext';
import { Briefcase, Users, Loader2 } from 'lucide-react';

type RoleSelection = 'HR' | 'CANDIDATE' | null;

import { FadeIn, FadeInStagger } from '@/components/animations/FadeIn';

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectPath = searchParams.get('redirect');

    const { user, role, loading, setRole } = useAuth();

    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Redirect if already logged in with role
    useEffect(() => {
        if (!loading && user && role) {
            if (redirectPath) {
                router.push(redirectPath);
            } else if (role === 'HR') {
                router.push('/dashboard');
            } else {
                router.push('/jobopening');
            }
        }
    }, [user, role, loading, router, redirectPath]);

    // If user is logged in but doesn't have a role, show role selection
    const needsRoleSelection = user && !role && !loading;

    // DEBUG: Log auth state for troubleshooting
    console.log('[LoginPage] Auth State:', {
        user: !!user,
        role,
        loading,
        needsRoleSelection
    });

    const handleRoleSelect = async (selectedRoleValue: 'HR' | 'CANDIDATE') => {
        setSubmitting(true);
        setError(null);

        try {
            await setRole(selectedRoleValue);
            if (redirectPath) {
                router.push(redirectPath);
            } else if (selectedRoleValue === 'HR') {
                router.push('/dashboard');
            } else {
                router.push('/jobopening');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to set role');
        } finally {
            setSubmitting(false);
        }
    };

    const handleGoogleAuth = async () => {
        setError(null);
        setSubmitting(true);

        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            const credential = GoogleAuthProvider.credentialFromResult(result);

            // Extract tokens
            const tokenResponse = (result as any)._tokenResponse;
            const googleAccessToken = credential?.accessToken;
            // oauthRefreshToken is specific to the IDP, whereas user.refreshToken is for Firebase
            const googleRefreshToken = tokenResponse?.oauthRefreshToken;

            if (user && googleAccessToken) {
                // Store tokens in our backend
                const firebaseToken = await user.getIdToken();

                await fetch('/api/auth/store-token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${firebaseToken}`
                    },
                    body: JSON.stringify({
                        google_access_token: googleAccessToken,
                        google_refresh_token: googleRefreshToken,
                        // Calculate expiry roughly (usually 1 hour)
                        token_expiry: Date.now() + 3600 * 1000
                    })
                });
            }

            // Auth state change will handle the rest
        } catch (err: any) {
            console.error('Google auth error:', err);
            setError(err.message || 'Google authentication failed');
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

    // Role selection screen for users who logged in but don't have a role yet
    if (needsRoleSelection) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <FadeInStagger className="w-full max-w-lg">
                    <FadeIn className="text-center mb-8">
                        <div className="inline-flex items-center justify-center h-14 w-14 bg-primary/10 rounded-2xl mb-4">
                            <Briefcase className="h-7 w-7 text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold">Welcome to HR Tech</h1>
                        <p className="text-muted-foreground mt-2">
                            Please select how you want to use the platform
                        </p>
                    </FadeIn>

                    {error && (
                        <FadeIn>
                            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-6">
                                {error}
                            </div>
                        </FadeIn>
                    )}

                    <div className="grid gap-4">
                        <FadeIn>
                            <button
                                onClick={() => handleRoleSelect('HR')}
                                disabled={submitting}
                                className="w-full flex items-center gap-4 p-6 bg-card border-2 border-border rounded-xl hover:border-primary hover:bg-primary/10 transition-all group"
                            >
                                <div className="h-12 w-12 bg-blue-500/10 rounded-xl flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                                    <Users className="h-6 w-6 text-blue-500" />
                                </div>
                                <div className="text-left">
                                    <h3 className="font-bold">I'm an HR Professional</h3>
                                    <p className="text-sm text-muted-foreground font-medium">
                                        Post job openings and manage applications
                                    </p>
                                </div>
                            </button>
                        </FadeIn>

                        <FadeIn>
                            <button
                                onClick={() => handleRoleSelect('CANDIDATE')}
                                disabled={submitting}
                                className="w-full flex items-center gap-4 p-6 bg-card border-2 border-border rounded-xl hover:border-primary hover:bg-primary/10 transition-all group"
                            >
                                <div className="h-12 w-12 bg-green-500/10 rounded-xl flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                                    <Briefcase className="h-6 w-6 text-green-500" />
                                </div>
                                <div className="text-left">
                                    <h3 className="font-bold">I'm a Job Seeker</h3>
                                    <p className="text-sm text-muted-foreground font-medium">
                                        Browse openings and apply for jobs
                                    </p>
                                </div>
                            </button>
                        </FadeIn>
                    </div>

                    {submitting && (
                        <FadeIn>
                            <div className="flex items-center justify-center gap-2 mt-6 text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Setting up your account...</span>
                            </div>
                        </FadeIn>
                    )}
                </FadeInStagger>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <FadeInStagger className="w-full max-w-md">
                {/* Header */}
                <FadeIn className="text-center mb-8">
                    <div className="inline-flex items-center justify-center h-14 w-14 bg-primary/10 rounded-2xl mb-4">
                        <Briefcase className="h-7 w-7 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold">
                        Welcome to HR Tech
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Sign in to access your dashboard
                    </p>
                </FadeIn>

                {/* Error Alert */}
                {error && (
                    <FadeIn>
                        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-6">
                            {error}
                        </div>
                    </FadeIn>
                )}

                {/* Google Sign In */}
                <FadeIn>
                    <button
                        onClick={handleGoogleAuth}
                        disabled={submitting}
                        className="w-full py-3 bg-card border-2 border-border rounded-lg font-bold hover:bg-muted transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
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
                        Continue with Google
                    </button>
                </FadeIn>
            </FadeInStagger>
        </div>

    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}
