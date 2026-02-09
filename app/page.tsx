'use client';

import Link from 'next/link';
import { Briefcase, Users, Zap, ArrowRight } from 'lucide-react';

export default function HeroPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 relative overflow-hidden">
            {/* Subtle gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5 pointer-events-none" />
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/3 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/2 rounded-full blur-[100px] pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 w-full max-w-lg">
                {/* Logo & Title */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center h-16 w-16 glass-card rounded-2xl mb-6">
                        <Briefcase className="h-7 w-7 text-primary" strokeWidth={1.5} />
                    </div>
                    <h1 className="text-4xl text-heading-light mb-3">HR Pulse</h1>
                    <p className="text-muted-foreground text-lg font-light">
                        Streamline your hiring process
                    </p>
                </div>

                {/* Login Options */}
                <div className="grid gap-4">
                    {/* HR Login */}
                    <Link
                        href="/hrlogin"
                        className="group flex items-center gap-5 p-6 glass-card rounded-2xl hover-lift animate-premium-fade"
                    >
                        <div className="h-14 w-14 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                            <Users className="h-6 w-6 text-primary" strokeWidth={1.5} />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-medium mb-1 group-hover:text-primary transition-colors">
                                HR Professional
                            </h2>
                            <p className="text-sm text-muted-foreground font-light">
                                Full access to Gmail, Calendar & Dashboard
                            </p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" strokeWidth={1.5} />
                    </Link>

                    {/* User Login */}
                    <Link
                        href="/userlogin"
                        className="group flex items-center gap-5 p-6 glass-card rounded-2xl hover-lift animate-premium-fade"
                    >
                        <div className="h-14 w-14 bg-chart-2/10 rounded-xl flex items-center justify-center group-hover:bg-chart-2/15 transition-colors">
                            <Briefcase className="h-6 w-6 text-chart-2" strokeWidth={1.5} />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-medium mb-1 flex items-center gap-3 group-hover:text-chart-2 transition-colors">
                                Job Seeker
                                <span className="inline-flex items-center gap-1 text-[10px] font-medium badge-success px-2 py-0.5 rounded-full">
                                    <Zap className="h-3 w-3" strokeWidth={2} />
                                    Quick
                                </span>
                            </h2>
                            <p className="text-sm text-muted-foreground font-light">
                                Browse openings and apply instantly
                            </p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-chart-2 group-hover:translate-x-1 transition-all" strokeWidth={1.5} />
                    </Link>
                </div>

                {/* Footer */}
                <p className="mt-12 text-xs text-muted-foreground text-center font-light">
                    By continuing, you agree to our Terms of Service
                </p>
            </div>
        </div>
    );
}
