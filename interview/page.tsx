'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRoleStore } from '@/lib/store/useRoleStore';

export default function InterviewPage() {
    const router = useRouter();
    const { currentRole } = useRoleStore();

    useEffect(() => {
        if (currentRole === 'HR') {
            router.push('/interview/dashboard');
        } else {
            // For candidate, maybe go to a "Select Interview" or "Start" page
            // For now, let's assume there is a default interview ID 'demo-123'
            router.push('/interview/room/demo-123');
        }
    }, [currentRole, router]);

    return (
        <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
    );
}
