import { getCalendarClient } from './google';

export interface CalendarEvent {
    id: string;
    title: string;
    time: string;
    category: 'Interview' | 'Onboarding' | 'HR Meeting';
    type: string;
    start: string;
}

export async function fetchHREvents(accessToken: string, refreshToken?: string): Promise<CalendarEvent[]> {
    const calendar = getCalendarClient(accessToken, refreshToken);

    try {
        const response = await calendar.events.list({
            calendarId: 'primary',
            timeMin: new Date().toISOString(),
            maxResults: 15,
            singleEvents: true,
            orderBy: 'startTime',
        });

        const events = response.data.items || [];

        return events.map(event => {
            const category = determineCategory(event.summary || '');
            const start = event.start?.dateTime || event.start?.date || '';
            const end = event.end?.dateTime || event.end?.date || '';

            return {
                id: event.id!,
                title: event.summary || 'No Title',
                time: formatTimeRange(start, end),
                category: category,
                type: event.location || 'Video Call',
                start: start,
            };
        });
    } catch (error) {
        console.error('Error fetching Calendar events:', error);
        return [];
    }
}

export async function createCalendarEvent(
    accessToken: string,
    eventDetails: { summary: string; description?: string; startTime: string; endTime: string }
) {
    const calendar = getCalendarClient(accessToken);

    try {
        const event = {
            summary: eventDetails.summary,
            description: eventDetails.description,
            start: {
                dateTime: eventDetails.startTime,
                timeZone: 'UTC', // Best to infer or default
            },
            end: {
                dateTime: eventDetails.endTime,
                timeZone: 'UTC',
            },
        };

        const response = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: event,
        });

        return response.data;
    } catch (error) {
        console.error("Error creating calendar event:", error);
        throw error;
    }
}

export interface CalendarEventResult {
    id?: string | null;
    hangoutLink?: string | null;
    htmlLink?: string | null;
    [key: string]: any;
}

export async function createInterviewEvent(
    accessToken: string,
    refreshToken: string | undefined | null,
    candidateName: string,
    candidateEmail: string,
    jobTitle: string,
    companyName: string,
    startTime: Date
): Promise<CalendarEventResult> {
    // 1 hour duration
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

    const summary = `Interview: ${candidateName} for ${jobTitle}`;
    const description = `Interview with ${candidateName} for the position of ${jobTitle} at ${companyName}.\n\nCandidate Email: ${candidateEmail}`;

    const calendar = getCalendarClient(accessToken, refreshToken || undefined);

    const event = {
        summary: summary,
        description: description,
        start: {
            dateTime: startTime.toISOString(),
            timeZone: 'UTC',
        },
        end: {
            dateTime: endTime.toISOString(),
            timeZone: 'UTC',
        },
        attendees: [
            { email: candidateEmail },
        ],
        conferenceData: {
            createRequest: {
                requestId: Math.random().toString(36).substring(7),
                conferenceSolutionKey: { type: 'hangoutsMeet' },
            },
        },
    };

    try {
        const response = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: event,
            conferenceDataVersion: 1, // Required for creating Meet links
        });

        return response.data;
    } catch (error) {
        console.error("Error creating interview event:", error);
        throw error;
    }
}

function determineCategory(summary: string): CalendarEvent['category'] {
    const text = summary.toLowerCase();
    if (text.includes('interview')) return 'Interview';
    if (text.includes('onboard')) return 'Onboarding';
    return 'HR Meeting';
}

function formatTimeRange(start: string, end: string): string {
    if (!start) return 'All Day';
    const startDate = new Date(start);
    const endDate = new Date(end);

    const options: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
    return `${startDate.toLocaleTimeString([], options)} - ${endDate.toLocaleTimeString([], options)}`;
}
