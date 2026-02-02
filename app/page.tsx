'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { user, role, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not logged in - redirect to login
        router.push('/login');
      } else if (role === 'HR') {
        // HR user - redirect to dashboard
        router.push('/dashboard');
      } else {
        // Candidate or no role - redirect to job openings
        router.push('/jobopening');
      }
    }
  }, [user, role, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
