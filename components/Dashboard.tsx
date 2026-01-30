'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from './layout/Navbar';
import { EmailPanel } from './dashboard/EmailPanel';
import { CalendarPanel } from './dashboard/CalendarPanel';
import { getDashboardData, createSingleCalendarEvent } from '@/app/actions';
import { ShieldAlert, RefreshCw, Lock, LogOut } from 'lucide-react';
import { PrismFluxLoader } from '@/components/ui/prism-flux-loader';
import { auth, googleProvider } from '@/app/firebase';
import { signInWithPopup, User, signOut, GoogleAuthProvider } from 'firebase/auth';
import { EmailSummary } from '@/lib/summarizer-scrape/gmail';

export default function DashboardPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [data, setData] = useState<any>(null);
    const [loadingData, setLoadingData] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
            setLoadingAuth(false);
            if (currentUser) {
                // Determine if we need to fetch data immediately or wait for user interaction/token
                // For simplicity, we'll try to fetch data if we can get a token silently, 
                // but usually we get the token from the result of the sign-in or force a refresh.
                // However, the Google Access Token for API calls is best obtained at login time via result.credential.
                // If the user is already logged in (persistence), we might need to re-authenticate to get a fresh OAuth access token 
                // because Firebase Auth ID token is different from Google OAuth Access Token.
                // But for now, let's try to see if we can get a token. 
                // Actually, the best way with Firebase to get a Google API Access Token after page reload is unclear without re-auth.
                // We will handle the "Initial Fetch" only if we just logged in or if we can prompt re-auth.
                // Strategy: We will add a "Connect Google Workspace" button if we don't have the data yet, 
                // or we rely on the handleLogin to fetch it.
                // For persistent login, we might not have the provider access token readily available without a re-prompt if we didn't store it.
                // Let's modify the flow: Login -> Get Token -> Fetch Data.
            }
        });
        return () => unsubscribe();
    }, []);

    const handleLogin = async () => {
        setError(null);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential?.accessToken;

            if (token) {
                setAccessToken(token);
                fetchData(token);
            } else {
                throw new Error("Could not retrieve Google Access Token. Please try again.");
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to sign in');
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        setData(null);
    };

    const fetchData = async (accessToken: string) => {
        setLoadingData(true);
        setError(null);
        try {
            const result = await getDashboardData(accessToken);
            setData(result);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to fetch dashboard data. Your session may have expired.');
        } finally {
            setLoadingData(false);
        }
    };

    const handleSync = async () => {
        if (!user) return;
        setLoadingData(true);
        try {
            // Need to get access token again or store it. 
            // Current flow: we only get token on login. 
            // We should store it in state or context for the session.
            // For now, let's assume we re-acquire it silently or alert user if missing.

            // To properly get the token without re-login every time, we should have stored it.
            // But since we didn't implement session storage for the token in the previous step,
            // we might need to prompt login again OR rely on the fact we just logged in.
            // Let's prompt for re-auth if we don't have a token in a REF or State that persists.

            // NOTE: For this demo, we will trigger the popup to get a fresh token for the action.
            const result = await signInWithPopup(auth, googleProvider);
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential?.accessToken;

            if (!token) throw new Error("Failed to get access token");
            setAccessToken(token);

            const res = await import('@/app/actions').then(mod => mod.syncEmailsToCalendar(token));

            if (res.success) {
                alert(`Successfully created ${res.count} calendar events from emails!`);
                // Refresh data
                fetchData(token);
            }
        } catch (err: any) {
            console.error(err);
            alert("Failed to sync: " + err.message);
        } finally {
            setLoadingData(false);
        }
    };

    const handleAddToCalendar = async (email: EmailSummary) => {
        if (!email.suggested_event) return;

        try {
            let token = accessToken;

            // If we don't have a token, we need to re-authenticate
            if (!token) {
                const result = await signInWithPopup(auth, googleProvider);
                const credential = GoogleAuthProvider.credentialFromResult(result);
                token = credential?.accessToken || null;
                if (token) setAccessToken(token);
            }

            if (!token) {
                alert('Please sign in again to add events to calendar.');
                return;
            }

            const event = email.suggested_event;
            const startTime = new Date(event.date_str);
            const durationMs = (event.duration_minutes || 60) * 60 * 1000;
            const endTime = new Date(startTime.getTime() + durationMs);

            await createSingleCalendarEvent(token, {
                summary: event.title,
                description: `${event.description || ''}\n\nGenerated from email: ${email.subject}\nFrom: ${email.sender}\n\nAttendees: ${event.attendees?.join(', ') || 'N/A'}`,
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                location: event.location,
            });

            alert(`✅ Added "${event.title}" to your Google Calendar!`);

            // Refresh calendar data
            if (token) fetchData(token);
        } catch (err: any) {
            console.error('Failed to add event:', err);
            alert('Failed to add event to calendar: ' + err.message);
        }
    };

    if (loadingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <PrismFluxLoader size={40} speed={4} />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20">
            <Navbar user={user} onSignIn={handleLogin} onSignOut={handleLogout} />

            <main className="flex-1 flex flex-col md:flex-row gap-6 p-6 md:p-8 max-w-7xl mx-auto w-full overflow-hidden">
                {!user ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-card rounded-2xl border border-border shadow-sm">
                        <div className="h-16 w-16 bg-primary/10 flex items-center justify-center rounded-2xl mb-6">
                            <Lock className="text-primary" size={32} />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Secure HR Dashboard</h2>
                        <p className="text-muted-foreground max-w-md mb-8">
                            Access your personalized HR digest and calendar by signing in with your corporate Google account.
                        </p>
                        <button
                            onClick={handleLogin}
                            className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
                        >
                            Sign In with Google
                        </button>
                    </div>
                ) : (
                    <>
                        {/* If we are logged in but don't have data, we might need to re-sync or just show a loading state if we are fetching.
                            If we are logged in and have no data and not loading, it usually means we need to "Connect" to get the access token again 
                            because we didn't store it (it's not persisted in Firebase Auth user object).
                         */}
                        {!data && !loadingData && !error && (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-card rounded-2xl border border-border shadow-sm">
                                <h2 className="text-2xl font-bold mb-2">Welcome, {user.displayName}</h2>
                                <p className="text-muted-foreground max-w-md mb-8">
                                    We need to sync with your Google Workspace to display your emails and calendar.
                                </p>
                                <button
                                    onClick={handleLogin}
                                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-bold shadow-sm hover:opacity-90 transition-all"
                                >
                                    Sync Data
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="mt-4 text-sm text-muted-foreground hover:text-foreground underline"
                                >
                                    Sign Out
                                </button>
                            </div>
                        )}

                        {/* Error State */}
                        {error && (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-card rounded-2xl border border-destructive/20 select-none">
                                <ShieldAlert className="text-destructive mb-4" size={48} />
                                <h2 className="text-xl font-bold mb-2 text-destructive">Connection Error</h2>
                                <p className="text-muted-foreground max-w-md mb-6">{error}</p>
                                <button
                                    onClick={handleLogin}
                                    className="px-6 py-2 bg-muted rounded-md font-semibold hover:bg-muted/80 transition-colors"
                                >
                                    Reconnect
                                </button>
                            </div>
                        )}

                        {/* Data Display - Calendar 3/4, Emails 1/4 */}
                        {data && (
                            <div className="flex flex-col md:flex-row gap-4 flex-1 min-h-0">
                                {/* Left Panel: Calendar (3/4 of screen) */}
                                <section className="flex-[3] min-w-0 h-[calc(100vh-120px)] md:h-[calc(100vh-100px)] flex flex-col">
                                    <CalendarPanel events={data?.events || []} loading={loadingData} />
                                </section>

                                {/* Right Panel: Email Summary (1/4 of screen) */}
                                <section className="flex-1 min-w-0 w-full md:w-80 h-[calc(100vh-120px)] md:h-[calc(100vh-100px)] flex flex-col">
                                    <div className="mb-2 flex justify-between items-center">
                                        <h3 className="font-bold text-xs uppercase tracking-wider px-1">Emails</h3>
                                        <button
                                            onClick={handleSync}
                                            disabled={loadingData}
                                            className="text-[10px] border border-foreground/20 text-foreground px-2 py-1 hover:bg-foreground hover:text-background transition-colors font-medium flex items-center gap-1"
                                        >
                                            <RefreshCw size={10} className={loadingData ? "animate-spin" : ""} />
                                            Sync
                                        </button>
                                    </div>
                                    <div className="flex-1 min-h-0">
                                        <EmailPanel emails={data?.emails || []} loading={loadingData} onAddToCalendar={handleAddToCalendar} />
                                    </div>
                                </section>
                            </div>
                        )}
                    </>
                )}
            </main>

            <footer className="h-10 border-t border-border bg-card/50 flex items-center px-8 text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${user ? 'bg-green-500 animate-pulse' : 'bg-muted'}`}></span>
                        {user ? 'Systems Active' : 'Waiting for Auth'}
                    </div>
                    {user && (
                        <>
                            <div className="h-3 w-px bg-border"></div>
                            <div>Cloud sync: {data ? 'Online' : 'Pending'}</div>
                            <div className="h-3 w-px bg-border"></div>
                            <button onClick={handleLogout} className="hover:text-foreground flex items-center gap-1">
                                <LogOut size={10} />
                                Sign Out
                            </button>
                        </>
                    )}
                </div>
                <div className="ml-auto">
                    © 2026 HR Pulse Enterprise
                </div>
            </footer>
        </div>
    );
}
