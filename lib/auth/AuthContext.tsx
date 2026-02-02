'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/app/firebase';

// User role type
export type UserRole = 'HR' | 'CANDIDATE' | null;

// Database user type (for when DB is connected)
export interface DbUser {
    id: string;
    firebase_uid: string;
    email: string;
    name: string | null;
    role: UserRole;
}

// Auth context type
interface AuthContextType {
    user: FirebaseUser | null;
    dbUser: DbUser | null;
    role: UserRole;
    loading: boolean;
    error: string | null;
    signOut: () => Promise<void>;
    setRole: (role: UserRole) => Promise<void>;
    syncUser: (role?: UserRole) => Promise<DbUser | null>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage key for local role (used when DB is not connected)
const ROLE_STORAGE_KEY = 'hrtech_user_role';

export function AuthContextProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [dbUser, setDbUser] = useState<DbUser | null>(null);
    const [role, setRoleState] = useState<UserRole>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Set role (stores locally and tries to sync to DB)
    const setRole = useCallback(async (newRole: UserRole): Promise<void> => {
        if (!user) return;

        // Store locally first
        if (newRole) {
            localStorage.setItem(`${ROLE_STORAGE_KEY}_${user.uid}`, newRole);
        } else {
            localStorage.removeItem(`${ROLE_STORAGE_KEY}_${user.uid}`);
        }
        setRoleState(newRole);

        // Create a local dbUser object
        const localDbUser: DbUser = {
            id: user.uid,
            firebase_uid: user.uid,
            email: user.email || '',
            name: user.displayName,
            role: newRole,
        };
        setDbUser(localDbUser);

        // Try to sync to database (will fail gracefully if DB not connected)
        try {
            const idToken = await user.getIdToken();
            const response = await fetch('/api/auth/sync-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                },
                body: JSON.stringify({ role: newRole }),
            });

            if (response.ok) {
                const data = await response.json();
                setDbUser(data.user);
            }
            // If fails, we still have the local role set
        } catch (err) {
            console.log('Database not connected, using local storage for role');
        }
    }, [user]);

    // Sync Firebase user to database
    const syncUser = useCallback(async (newRole?: UserRole): Promise<DbUser | null> => {
        if (!user) return null;

        // If a new role is provided, set it
        if (newRole) {
            await setRole(newRole);
            return dbUser;
        }

        // Try to fetch from database
        try {
            const idToken = await user.getIdToken();
            const response = await fetch('/api/auth/sync-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                },
                body: JSON.stringify({}),
            });

            if (response.ok) {
                const data = await response.json();
                setDbUser(data.user);
                setRoleState(data.user.role);
                return data.user;
            }
        } catch (err) {
            console.log('Database not connected, using local role');
        }

        // Return local dbUser if DB fails
        return dbUser;
    }, [user, dbUser, setRole]);

    // Refresh user data from database
    const refreshUser = useCallback(async () => {
        if (!user) return;
        await syncUser();
    }, [user, syncUser]);

    // Sign out
    const signOut = useCallback(async () => {
        try {
            if (user) {
                localStorage.removeItem(`${ROLE_STORAGE_KEY}_${user.uid}`);
            }
            await firebaseSignOut(auth);
            setUser(null);
            setDbUser(null);
            setRoleState(null);
            setError(null);
        } catch (err: any) {
            console.error('Error signing out:', err);
            setError(err.message);
        }
    }, [user]);

    // Listen for auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);

            if (firebaseUser) {
                // Only check local storage for role - DO NOT auto-sync from database
                // This ensures new users see the role selection screen
                const storedRole = localStorage.getItem(`${ROLE_STORAGE_KEY}_${firebaseUser.uid}`) as UserRole;

                if (storedRole) {
                    setRoleState(storedRole);
                    // Create local dbUser
                    setDbUser({
                        id: firebaseUser.uid,
                        firebase_uid: firebaseUser.uid,
                        email: firebaseUser.email || '',
                        name: firebaseUser.displayName,
                        role: storedRole,
                    });
                }
                // If no stored role, role remains null -> role selection screen will show
            } else {
                setDbUser(null);
                setRoleState(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const value: AuthContextType = {
        user,
        dbUser,
        role,
        loading,
        error,
        signOut,
        setRole,
        syncUser,
        refreshUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthContextProvider');
    }
    return context;
}

export default AuthContext;
