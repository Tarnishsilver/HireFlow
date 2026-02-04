'use client';

import { useRoleStore } from '@/lib/store/useRoleStore';
import { UserCircle, Users } from 'lucide-react';

export default function RoleSwitcher() {
    const { currentRole, setRole } = useRoleStore();

    return (
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
                onClick={() => setRole('HR')}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${currentRole === 'HR'
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
            >
                <Users className="w-4 h-4" />
                HR View
            </button>
            <button
                onClick={() => setRole('CANDIDATE')}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${currentRole === 'CANDIDATE'
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
            >
                <UserCircle className="w-4 h-4" />
                Candidate View
            </button>
        </div>
    );
}
