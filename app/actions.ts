'use server';


import { fetchHREmails } from "@/lib/summarizer-scrape/gmail";
import { fetchHREvents } from "@/lib/summarizer-scrape/calendar";



import { createCalendarEvent } from "@/lib/summarizer-scrape/calendar";

export async function getDashboardData(accessToken: string) {
    if (!accessToken) {
        throw new Error("Unauthorized: No Google access token provided");
    }

    try {
        const [emails, events] = await Promise.all([
            fetchHREmails(accessToken),
            fetchHREvents(accessToken)
        ]);

        return { emails, events };
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        throw new Error("Failed to fetch dashboard data");
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
