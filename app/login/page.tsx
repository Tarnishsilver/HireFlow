'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from '@/app/firebase';
import { useAuth } from '@/lib/auth/AuthContext';
import { Briefcase, Users, Mail, Lock, User, Loader2 } from 'lucide-react';

type AuthMode = 'login' | 'register';
type RoleSelection = 'HR' | 'CANDIDATE' | null;

export default function LoginPage() {
    const router = useRouter();
    const { user, role, loading, setRole } = useAuth();

    const [mode, setMode] = useState<AuthMode>('login');
    const [selectedRole, setSelectedRole] = useState<RoleSelection>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Redirect if already logged in with role
    useEffect(() => {
        if (!loading && user && role) {
            if (role === 'HR') {
                router.push('/dashboard');
            } else {
                router.push('/jobopening');
            }
        }
    }, [user, role, loading, router]);

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
            if (selectedRoleValue === 'HR') {
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

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            if (mode === 'register') {
                if (!selectedRole) {
                    setError('Please select a role');
                    setSubmitting(false);
                    return;
                }

                const result = await createUserWithEmailAndPassword(auth, email, password);

                if (name) {
                    await updateProfile(result.user, { displayName: name });
                }

                // Set user role
                await setRole(selectedRole);
                if (selectedRole === 'HR') {
                    router.push('/dashboard');
                } else {
                    router.push('/jobopening');
                }
            } else {
                // Login
                await signInWithEmailAndPassword(auth, email, password);
                // The auth state change will trigger the redirect
            }
        } catch (err: any) {
            console.error('Auth error:', err);
            if (err.code === 'auth/email-already-in-use') {
                setError('An account with this email already exists');
            } else if (err.code === 'auth/weak-password') {
                setError('Password should be at least 6 characters');
            } else if (err.code === 'auth/invalid-email') {
                setError('Invalid email address');
            } else if (err.code === 'auth/invalid-credential') {
                setError('Invalid email or password');
            } else {
                setError(err.message || 'Authentication failed');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleGoogleAuth = async () => {
        setError(null);
        setSubmitting(true);

        try {
            await signInWithPopup(auth, googleProvider);
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
                <div className="w-full max-w-lg">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center h-14 w-14 bg-primary/10 rounded-2xl mb-4">
                            <Briefcase className="h-7 w-7 text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold">Welcome to HR Tech</h1>
                        <p className="text-muted-foreground mt-2">
                            Please select how you want to use the platform
                        </p>
                    </div>

                    {error && (
                        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    <div className="grid gap-4">
                        <button
                            onClick={() => handleRoleSelect('HR')}
                            disabled={submitting}
                            className="flex items-center gap-4 p-6 bg-card border border-border rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all group"
                        >
                            <div className="h-12 w-12 bg-blue-500/10 rounded-xl flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                                <Users className="h-6 w-6 text-blue-500" />
                            </div>
                            <div className="text-left">
                                <h3 className="font-semibold">I'm an HR Professional</h3>
                                <p className="text-sm text-muted-foreground">
                                    Post job openings and manage applications
                                </p>
                            </div>
                        </button>

                        <button
                            onClick={() => handleRoleSelect('CANDIDATE')}
                            disabled={submitting}
                            className="flex items-center gap-4 p-6 bg-card border border-border rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all group"
                        >
                            <div className="h-12 w-12 bg-green-500/10 rounded-xl flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                                <Briefcase className="h-6 w-6 text-green-500" />
                            </div>
                            <div className="text-left">
                                <h3 className="font-semibold">I'm a Job Seeker</h3>
                                <p className="text-sm text-muted-foreground">
                                    Browse openings and apply for jobs
                                </p>
                            </div>
                        </button>
                    </div>

                    {submitting && (
                        <div className="flex items-center justify-center gap-2 mt-6 text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Setting up your account...</span>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center h-14 w-14 bg-primary/10 rounded-2xl mb-4">
                        <Briefcase className="h-7 w-7 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold">
                        {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        {mode === 'login'
                            ? 'Sign in to access your dashboard'
                            : 'Join HR Tech to get started'}
                    </p>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* Role Selection for Registration */}
                {mode === 'register' && (
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-3">I am a...</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setSelectedRole('HR')}
                                className={`p-4 border rounded-xl text-center transition-all ${selectedRole === 'HR'
                                    ? 'border-primary bg-primary/10 text-primary'
                                    : 'border-border hover:border-primary/50'
                                    }`}
                            >
                                <Users className="h-6 w-6 mx-auto mb-2" />
                                <span className="font-medium">HR Professional</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedRole('CANDIDATE')}
                                className={`p-4 border rounded-xl text-center transition-all ${selectedRole === 'CANDIDATE'
                                    ? 'border-primary bg-primary/10 text-primary'
                                    : 'border-border hover:border-primary/50'
                                    }`}
                            >
                                <Briefcase className="h-6 w-6 mx-auto mb-2" />
                                <span className="font-medium">Job Seeker</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Auth Form */}
                <form onSubmit={handleEmailAuth} className="space-y-4">
                    {mode === 'register' && (
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="John Doe"
                                    className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium mb-1.5">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                minLength={6}
                                className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                        {mode === 'login' ? 'Sign In' : 'Create Account'}
                    </button>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                    </div>
                </div>

                {/* Google Sign In */}
                <button
                    onClick={handleGoogleAuth}
                    disabled={submitting}
                    className="w-full py-2.5 bg-card border border-border rounded-lg font-medium hover:bg-muted transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
                    Google
                </button>

                {/* Toggle Mode */}
                <p className="text-center text-sm text-muted-foreground mt-6">
                    {mode === 'login' ? (
                        <>
                            Don't have an account?{' '}
                            <button
                                type="button"
                                onClick={() => {
                                    setMode('register');
                                    setError(null);
                                }}
                                className="text-primary font-medium hover:underline"
                            >
                                Sign up
                            </button>
                        </>
                    ) : (
                        <>
                            Already have an account?{' '}
                            <button
                                type="button"
                                onClick={() => {
                                    setMode('login');
                                    setError(null);
                                }}
                                className="text-primary font-medium hover:underline"
                            >
                                Sign in
                            </button>
                        </>
                    )}
                </p>
            </div>
        </div>
    );
}
