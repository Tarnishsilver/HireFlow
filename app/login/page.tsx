'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { Loader2 } from 'lucide-react';
import { Suspense } from 'react';

function LoginRedirect() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectPath = searchParams.get('redirect');
    const { user, role, loading, signOut } = useAuth();

    useEffect(() => {
        if (loading) return;

        // If user is logged in with a role, redirect to appropriate page
        if (user && role) {
            if (redirectPath) {
                router.replace(redirectPath);
            } else if (role === 'HR') {
                router.replace('/dashboard');
            } else {
                router.replace('/jobopening');
            }
            return;
        }

        // If user is logged in but NO role (legacy state), sign them out
        // and redirect to hero so they use the new login flow
        if (user && !role) {
            signOut().then(() => {
                router.replace('/');
            });
            return;
        }

        // Not logged in - redirect to hero page
        router.replace('/');
    }, [user, role, loading, router, redirectPath, signOut]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
            <LoginRedirect />
        </Suspense>
    );
}
