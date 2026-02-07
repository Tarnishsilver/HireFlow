'use server';


import { fetchHREmails } from "@/lib/summarizer-scrape/gmail";
import { fetchHREvents } from "@/lib/summarizer-scrape/calendar";
import { createCalendarEvent } from "@/lib/summarizer-scrape/calendar";
import getPrisma from "@/lib/prisma";

export async function getDashboardData(accessToken: string, firebaseUid?: string) {
    if (!accessToken) {
        throw new Error("Unauthorized: No Google access token provided");
    }

    try {
        const [emails, events] = await Promise.all([
            fetchHREmails(accessToken),
            fetchHREvents(accessToken)
        ]);

        const data = { emails, events };

        // Update cache if firebaseUid is provided
        if (firebaseUid) {
            updateDashboardCache(firebaseUid, data).catch(err =>
                console.error("Failed to update dashboard cache:", err)
            );
        }

        return { ...data, last_sync: new Date() };
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        throw new Error("Failed to fetch dashboard data");
    }
}

export async function getDashboardCache(firebaseUid: string) {
    const prisma = getPrisma();
    try {
        const user = await prisma.user.findUnique({
            where: { firebase_uid: firebaseUid },
            select: {
                cached_dashboard_data: true,
                last_dashboard_sync: true
            }
        });

        if (!user) return null;

        return {
            ...(user.cached_dashboard_data as any),
            last_sync: user.last_dashboard_sync
        };
    } catch (error) {
        console.error("Error fetching dashboard cache:", error);
        return null;
    }
}

export async function updateDashboardCache(firebaseUid: string, data: any) {
    const prisma = getPrisma();
    try {
        await prisma.user.update({
            where: { firebase_uid: firebaseUid },
            data: {
                cached_dashboard_data: data,
                last_dashboard_sync: new Date()
            }
        });
        return { success: true };
    } catch (error) {
        console.error("Error updating dashboard cache:", error);
        return { success: false };
    }
}

export async function syncEmailsToCalendar(accessToken: string) {
    if (!accessToken) {
        throw new Error("Unauthorized: No Google access token provided");
    }

    try {
        const emails = await fetchHREmails(accessToken);
        let eventsCreated = 0;

        for (const email of emails) {
            // Use the AI-suggested event data if available
            if (email.suggested_event && email.suggested_event.date_str) {
                const eventDate = new Date(email.suggested_event.date_str);

                // Validate date is valid
                if (isNaN(eventDate.getTime())) {
                    console.warn(`Invalid date suggested for email ${email.id}: ${email.suggested_event.date_str}`);
                    continue;
                }

                const startTime = eventDate.toISOString();
                // Default to 1 hour duration if not specified
                const endTime = new Date(eventDate.getTime() + 60 * 60 * 1000).toISOString();

                await createCalendarEvent(accessToken, {
                    summary: `📅 ${email.suggested_event.title || email.subject}`,
                    description: `Generated from email: ${email.subject}\n\nSummary: ${email.summary}\n\nSender: ${email.sender}`,
                    startTime: startTime,
                    endTime: endTime,
                });
                eventsCreated++;
            }
        }

        return { success: true, count: eventsCreated };
    } catch (error) {
        console.error("Error syncing emails to calendar:", error);
        throw new Error("Failed to sync emails");
    }
}

export async function createSingleCalendarEvent(
    accessToken: string,
    eventDetails: {
        summary: string;
        description?: string;
        startTime: string;
        endTime: string;
        location?: string;
    }
) {
    if (!accessToken) {
        throw new Error("Unauthorized: No Google access token provided");
    }

    try {
        const result = await createCalendarEvent(accessToken, {
            summary: eventDetails.summary,
            description: eventDetails.description,
            startTime: eventDetails.startTime,
            endTime: eventDetails.endTime,
        });
        return { success: true, event: result };
    } catch (error) {
        console.error("Error creating calendar event:", error);
        throw new Error("Failed to create calendar event");
    }
}
