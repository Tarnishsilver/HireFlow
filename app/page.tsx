'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { Loader2, Briefcase, Users, ArrowRight } from 'lucide-react';
import { FadeIn, FadeInStagger } from '@/components/animations/FadeIn';

export default function Home() {
  const router = useRouter();
  const { user, role, loading } = useAuth();

  // If already logged in, redirect to appropriate page
  useEffect(() => {
    if (!loading && user && role) {
      if (role === 'HR') {
        router.push('/dashboard');
      } else {
        router.push('/jobopening');
      }
    }
  }, [user, role, loading, router]);

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If logged in but no role, push to appropriate default
  if (user && role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <FadeInStagger className="w-full max-w-xl text-center">
        {/* Hero Header */}
        <FadeIn>
          <div className="inline-flex items-center justify-center h-20 w-20 bg-primary/10 rounded-3xl mb-6">
            <Briefcase className="h-10 w-10 text-primary" />
          </div>
        </FadeIn>

        <FadeIn>
          <h1 className="text-4xl font-bold tracking-tight mb-3">
            Welcome to <span className="text-primary">HR Tech</span>
          </h1>
        </FadeIn>

        <FadeIn>
          <p className="text-muted-foreground text-lg mb-10">
            Streamline your hiring process with intelligent automation
          </p>
        </FadeIn>

        {/* Login Options */}
        <div className="grid gap-4 sm:grid-cols-2">
          <FadeIn>
            <button
              onClick={() => router.push('/hrlogin')}
              className="group w-full flex flex-col items-center gap-3 p-6 bg-card border-2 border-border rounded-2xl hover:border-blue-500 hover:bg-blue-500/5 transition-all duration-200"
            >
              <div className="h-14 w-14 bg-blue-500/10 rounded-xl flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                <Users className="h-7 w-7 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">HR Professional</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage jobs, emails & calendar
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
            </button>
          </FadeIn>

          <FadeIn>
            <button
              onClick={() => router.push('/userlogin')}
              className="group w-full flex flex-col items-center gap-3 p-6 bg-card border-2 border-border rounded-2xl hover:border-green-500 hover:bg-green-500/5 transition-all duration-200"
            >
              <div className="h-14 w-14 bg-green-500/10 rounded-xl flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                <Briefcase className="h-7 w-7 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Job Seeker</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Browse & apply for jobs
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-green-500 group-hover:translate-x-1 transition-all" />
            </button>
          </FadeIn>
        </div>
      </FadeInStagger>
    </div>
  );
}
