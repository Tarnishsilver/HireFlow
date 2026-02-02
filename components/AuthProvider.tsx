'use client';

import { AuthContextProvider } from '@/lib/auth/AuthContext';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    return <AuthContextProvider>{children}</AuthContextProvider>;
}
