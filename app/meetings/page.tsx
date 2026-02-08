'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { CalendarPanel } from '@/components/dashboard/CalendarPanel';
import { CreateEventModal } from '@/components/dashboard/CreateEventModal';
import { getDashboardData, createSingleCalendarEvent, getMeetings, createInternalMeeting } from '@/app/actions';
import { Loader2 } from 'lucide-react';
import { auth, googleProvider } from '@/app/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

function MeetingsContent() {
    const router = useRouter();
    const { user, role, loading, signOut } = useAuth();

    const [data, setData] = useState<any>(null);
    const [loadingData, setLoadingData] = useState(false);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [creatingEvent, setCreatingEvent] = useState(false);

    // Protect route
    useEffect(() => {
        if (!loading && (!user || role !== 'HR')) {
            router.push('/');
        }
    }, [user, role, loading, router]);

    // Fetch data using stored token
    useEffect(() => {
        async function fetchWithToken() {
            if (!user) return;

            try {
                const firebaseToken = await user.getIdToken();
                const tokenRes = await fetch('/api/auth/store-token', {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${firebaseToken}` }
                });

                if (tokenRes.ok) {
                    const tokenData = await tokenRes.json();
                    if (tokenData.hasToken && tokenData.google_access_token) {
                        setAccessToken(tokenData.google_access_token);
                        fetchData(tokenData.google_access_token);
                    }
                }
            } catch (err) {
                console.error('Failed to get token:', err);
            }
        }

        if (user) fetchWithToken();
    }, [user]);

    const fetchData = async (token: string) => {
        setLoadingData(true);
        try {
            // Fetch Dashboard Data (Google Events + Emails)
            // If no token, just skip Google Data or handle it safely
            let googlePromise: Promise<any> = Promise.resolve({ events: [], emails: [] });

            if (token) {
                googlePromise = getDashboardData(token, user?.uid).catch(e => {
                    console.warn("Failed to fetch Google data", e);
                    return { events: [], emails: [] };
                });
            }
            // Fetch Internal Meetings from DB
            const internalPromise = user?.uid ? getMeetings(user.uid) : Promise.resolve([]);

            const [googleData, internalMeetings] = await Promise.all([googlePromise, internalPromise]);

            // Merge Events
            // Strategy: Create a map of events by ID. 
            // Internal meetings take precedence for ID and explicit "Internal" status.

            const mergedEvents = [...(googleData.events || [])];

            // Add/Link Internal Meetings
            internalMeetings.forEach((meeting: any) => {
                // Check if this meeting exists in Google Events via googleEventId
                const googleEventIndex = mergedEvents.findIndex((ge: any) => ge.id === meeting.googleEventId);

                const internalEvent = {
                    id: meeting.id, // Use Internal UUID
                    title: meeting.title,
                    time: meeting.startTime,
                    start: meeting.startTime.toISOString(),
                    end: meeting.endTime.toISOString(),
                    category: meeting.googleEventId ? 'Scheduled' : 'Internal', // Tag
                    type: meeting.location?.startsWith('http') ? 'Video Call' : 'In-Person',
                    location: meeting.location,
                    description: meeting.description,
                    isInternal: true
                };

                if (googleEventIndex !== -1) {
                    // Replace/Merge with Internal version to ensure we use Internal ID for navigation
                    const ge = mergedEvents[googleEventIndex];
                    mergedEvents[googleEventIndex] = {
                        ...ge,
                        ...internalEvent,
                        googleId: ge.id
                    } as any;
                } else {
                    // Add as new if not found in Google Sync (e.g. not synced yet or manual)
                    mergedEvents.push(internalEvent as any);
                }
            });

            // Format time for all new internal events if missing
            // (CalendarPanel expects 'time' string, we should ensure it)
            // Or easier: Update CalendarPanel to format 'start'/'end' if 'time' is missing.
            // But let's stick to existing pattern from actions.ts:
            // return { ... id, title, time: formatTimeRange(start, end), category, type, start }

            // Re-map to ensure consistency
            const finalEvents = mergedEvents.map((e: any) => ({
                ...e,
                time: e.time || new Date(e.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                category: e.category || 'Scheduled'
            }));

            setData({ ...googleData, events: finalEvents });
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingData(false);
        }
    };

    const handleCreateEventSubmit = async (data: { title: string; date: string; time: string; duration: string }) => {
        setCreatingEvent(true);
        try {
            // REMOVED: Google Auth Popup for internal meetings
            // We now create meetings directly in our database.

            if (!user) {
                alert('Please sign in to create events.');
                return;
            }

            if (!data.date || !data.time) {
                alert('Please select both date and time.');
                setCreatingEvent(false);
                return;
            }

            const startTime = new Date(`${data.date}T${data.time}:00`);

            if (isNaN(startTime.getTime())) {
                alert('Invalid date or time selected.');
                setCreatingEvent(false);
                return;
            }

            const durationMs = (parseInt(data.duration || '60')) * 60 * 1000;
            const endTime = new Date(startTime.getTime() + durationMs);

            // Import the new action dynamically if needed, or assume it's available via previous import update
            // Using static import now.

            const result = await createInternalMeeting(user.uid, {
                summary: data.title,
                description: 'Created via HR Tech Meetings',
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
            });

            if (result.success && result.meeting) {
                const newEvent = {
                    id: result.meeting.id,
                    title: result.meeting.title || data.title,
                    time: new Date(result.meeting.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    start: new Date(result.meeting.startTime).toISOString(),
                    end: new Date(result.meeting.endTime).toISOString(),
                    category: 'Scheduled',
                    type: 'Video Call',
                    location: result.meeting.location || `${window.location.origin}/meetings/${result.meeting.id}`,
                    description: result.meeting.description,
                    isInternal: true
                };

                // Add to local state immediately
                setData((prev: any) => ({
                    ...prev,
                    events: [...(prev?.events || []), newEvent]
                }));

                alert(`✅ Scheduled "${data.title}" successfully!`);
                setIsEventModalOpen(false);

                // If it's a fallback meeting (because DB failed), DON'T refresh from server
                // as it won't be there, causing it to vanish.
                if (!result.isFallback) {
                    fetchData(accessToken || '');
                }
            } else {
                throw new Error("Failed to create meeting object");
            }

        } catch (err: any) {
            alert('Failed to create event: ' + err.message);
        } finally {
            setCreatingEvent(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user || role !== 'HR') return null;

    return (
        <MainLayout user={user} onSignIn={() => { }} onSignOut={signOut}>
            <div className="max-w-[1920px] mx-auto w-full px-6 py-6 h-[calc(100vh-56px)]">
                <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-foreground">Meetings & Calendar</h1>
                        <button
                            onClick={() => setIsEventModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90 transition-opacity"
                        >
                            <span className="text-lg">+</span> Create Meeting
                        </button>
                    </div>

                    <div className="flex-1 min-h-0 bg-card rounded-xl border border-border overflow-hidden">
                        <CalendarPanel
                            events={data?.events || []}
                            loading={loadingData && !data}
                            onAddEvent={() => setIsEventModalOpen(true)}
                            onEventClick={(eventId) => router.push(`/meetings/${eventId}`)}
                        />
                    </div>
                </div>
            </div>

            <CreateEventModal
                isOpen={isEventModalOpen}
                onClose={() => setIsEventModalOpen(false)}
                onSubmit={handleCreateEventSubmit}
                isLoading={creatingEvent}
            />
        </MainLayout>
    );
}

export default function MeetingsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <MeetingsContent />
        </Suspense>
    );
}
