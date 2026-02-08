'use client';

import { useDemoStore } from '@/lib/store/useDemoStore';
import { Eye, EyeOff } from 'lucide-react';

export default function AnonymousToggle() {
    const { isAnonymousMode, toggleAnonymousMode } = useDemoStore();

    return (
        <button
            onClick={toggleAnonymousMode}
            className={`flex items-center gap-3 px-4 py-2 rounded-full border transition-all ${isAnonymousMode
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
        >
            {isAnonymousMode ? (
                <EyeOff className="w-4 h-4 animate-pulse" />
            ) : (
                <Eye className="w-4 h-4" />
            )}
            <span className="text-sm font-semibold">
                {isAnonymousMode ? 'Anonymous Mode: ON' : 'Anonymous Mode: OFF'}
            </span>
        </button>
    );
}
