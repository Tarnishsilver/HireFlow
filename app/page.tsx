'use client';

import Link from 'next/link';
import { Briefcase, Users, Zap, ArrowRight } from 'lucide-react';

export default function HeroPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
            {/* Logo & Title */}
            <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center h-16 w-16 bg-primary/10 rounded-2xl mb-4">
                    <Briefcase className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-4xl font-bold mb-2">HR Tech</h1>
                <p className="text-muted-foreground text-lg">
                    Streamline your hiring process
                </p>
            </div>

            {/* Login Options */}
            <div className="w-full max-w-lg grid gap-4">
                {/* HR Login */}
                <Link
                    href="/hrlogin"
                    className="group flex items-center gap-4 p-6 bg-card border-2 border-border rounded-xl hover:border-blue-500 hover:bg-blue-500/5 transition-all"
                >
                    <div className="h-14 w-14 bg-blue-500/10 rounded-xl flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                        <Users className="h-7 w-7 text-blue-500" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            HR Professional
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Full access to Gmail, Calendar & Dashboard
                        </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                </Link>

                {/* User Login */}
                <Link
                    href="/userlogin"
                    className="group flex items-center gap-4 p-6 bg-card border-2 border-border rounded-xl hover:border-green-500 hover:bg-green-500/5 transition-all"
                >
                    <div className="h-14 w-14 bg-green-500/10 rounded-xl flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                        <Briefcase className="h-7 w-7 text-green-500" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            Job Seeker
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
                                <Zap className="h-3 w-3" />
                                Quick
                            </span>
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Browse openings and apply instantly
                        </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-green-500 transition-colors" />
                </Link>
            </div>

            {/* Footer */}
            <p className="mt-12 text-xs text-muted-foreground">
                By continuing, you agree to our Terms of Service
            </p>
        </div>
    );
}
