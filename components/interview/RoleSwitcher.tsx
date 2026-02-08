'use client';

import { useRoleStore } from '@/lib/store/useRoleStore';
import { UserCircle, Users } from 'lucide-react';

export default function RoleSwitcher() {
    const { currentRole, setRole } = useRoleStore();

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={() => setRole('HR')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all border ${currentRole === 'HR'
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
            >
                <Users className="w-4 h-4" />
                HR View
            </button>
            <button
                onClick={() => setRole('CANDIDATE')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all border ${currentRole === 'CANDIDATE'
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
            >
                <UserCircle className="w-4 h-4" />
                Candidate View
            </button>
        </div>
    );
}
