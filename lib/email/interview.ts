/**
 * Interview Scheduling Utilities
 * 
 * Functions to calculate interview slots and schedule interviews.
 */

import { createInterviewEvent, CalendarEventResult } from '@/lib/summarizer-scrape/calendar';

/**
 * Calculate the next available interview slot
 * Default: Next business day at 10:00 AM IST
 */
export function calculateNextInterviewSlot(): Date {
    const now = new Date();

    // Start from tomorrow
    const nextDay = new Date(now);
    nextDay.setDate(nextDay.getDate() + 1);

    // Set time to 10:00 AM
    nextDay.setHours(10, 0, 0, 0);

    // Skip weekends
    const dayOfWeek = nextDay.getDay();
    if (dayOfWeek === 0) {
        // Sunday -> Move to Monday
        nextDay.setDate(nextDay.getDate() + 1);
    } else if (dayOfWeek === 6) {
        // Saturday -> Move to Monday
        nextDay.setDate(nextDay.getDate() + 2);
    }

    return nextDay;
}

export interface ScheduleInterviewResult {
    success: boolean;
    event?: CalendarEventResult;
    interviewDateTime?: Date;
    meetLink?: string | null;
    error?: string;
}

/**
 * Schedule an interview for a candidate
 * Creates a calendar event with Google Meet link for the next business day
 */
export async function scheduleInterview(
    accessToken: string,
    candidateName: string,
    candidateEmail: string,
    jobTitle: string,
    companyName: string
): Promise<ScheduleInterviewResult> {
    try {
        const interviewDateTime = calculateNextInterviewSlot();

        console.log(`Scheduling interview for ${candidateName} at ${interviewDateTime.toISOString()}`);

        const event = await createInterviewEvent(
            accessToken,
            candidateName,
            candidateEmail,
            jobTitle,
            companyName,
            interviewDateTime
        );

        console.log(`Interview scheduled successfully. Meet link: ${event.hangoutLink}`);

        return {
            success: true,
            event,
            interviewDateTime,
            meetLink: event.hangoutLink,
        };
    } catch (error: any) {
        console.error('Failed to schedule interview:', error);
        return {
            success: false,
            error: error.message || 'Failed to schedule interview',
        };
    }
}
