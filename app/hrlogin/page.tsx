'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, googleProviderHR } from '@/app/firebase';
import { useAuth } from '@/lib/auth/AuthContext';
import { Users, Loader2, Mail, Calendar } from 'lucide-react';
import { FadeIn, FadeInStagger } from '@/components/animations/FadeIn';

export default function HRLoginPage() {
    const router = useRouter();
    const { user, role, loading, setRole } = useAuth();

    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [loginComplete, setLoginComplete] = useState(false);

    // Redirect when role is confirmed as HR
    useEffect(() => {
        if (!loading && user && role === 'HR') {
            window.location.href = '/dashboard';
        }
    }, [user, role, loading]);

    // Also redirect if login completed and role is set
    useEffect(() => {
        if (loginComplete && role === 'HR') {
            window.location.href = '/dashboard';
        }
    }, [loginComplete, role]);

    const handleHRLogin = async () => {
        setError(null);
        setSubmitting(true);

        try {
            const result = await signInWithPopup(auth, googleProviderHR);
            const currentUser = result.user;
            const credential = GoogleAuthProvider.credentialFromResult(result);

            // Extract tokens for Gmail/Calendar API access
            const tokenResponse = (result as any)._tokenResponse;
            const googleAccessToken = credential?.accessToken;
            const googleRefreshToken = tokenResponse?.oauthRefreshToken;

            // Store tokens in background (don't block)
            if (currentUser && googleAccessToken) {
                const firebaseToken = await currentUser.getIdToken();

                fetch('/api/auth/store-token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${firebaseToken}`
                    },
                    body: JSON.stringify({
                        google_access_token: googleAccessToken,
                        google_refresh_token: googleRefreshToken,
                        token_expiry: Date.now() + 3600 * 1000
                    })
                }).catch(err => console.log('Token storage:', err));
            }

            // Set role - this updates state AND localStorage
            await setRole('HR');
            setLoginComplete(true);

            // The useEffect above will handle redirect once role state is confirmed
        } catch (err: any) {
            console.error('HR login error:', err);
            setError(err.message || 'Authentication failed');
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

    // Show loading if login is complete (waiting for redirect)
    if (loginComplete || (user && role === 'HR')) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Redirecting to dashboard...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-blue-500/5 p-4">
            <FadeInStagger className="w-full max-w-md">
                {/* Header */}
                <FadeIn className="text-center mb-8">
                    <div className="inline-flex items-center justify-center h-16 w-16 bg-blue-500/10 rounded-2xl mb-4">
                        <Users className="h-8 w-8 text-blue-500" />
                    </div>
                    <h1 className="text-2xl font-bold">HR Professional Login</h1>
                    <p className="text-muted-foreground mt-2">
                        Sign in with full Gmail & Calendar access
                    </p>
                </FadeIn>

                {/* Permissions Info */}
                <FadeIn>
                    <div className="bg-card border border-border rounded-xl p-4 mb-6">
                        <p className="text-sm font-medium mb-3">This login grants access to:</p>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="h-4 w-4 text-blue-500" />
                                <span>Read, send & compose emails</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4 text-blue-500" />
                                <span>Read & create calendar events</span>
                            </div>
                        </div>
                    </div>
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
                        onClick={handleHRLogin}
                        disabled={submitting}
                        className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Connecting...
                            </>
                        ) : (
                            <>
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
                            </>
                        )}
                    </button>
                </FadeIn>

                {/* Back link */}
                <FadeIn className="text-center mt-6">
                    <button
                        onClick={() => router.push('/')}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        ← Back to home
                    </button>
                </FadeIn>
            </FadeInStagger>
        </div>
    );
}
