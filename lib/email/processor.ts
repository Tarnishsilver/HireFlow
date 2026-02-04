/**
 * Application Notification Processor
 * 
 * Main orchestration logic for sending automated emails based on ATS scores.
 */

import { sendEmailViaGmail, formatEmailHtml } from './service';
import { draftInterviewInviteEmail, draftRejectionEmail } from './drafter';
import { scheduleInterview } from './interview';

export interface ApplicationNotificationData {
    applicationId: string;
    candidateName: string;
    candidateEmail: string;
    jobTitle: string;
    companyName: string;
    atsScore: number;
    atsDecision: string;
    atsMissingSkills: string[];
    atsReasons: string[];
    jobId: string;
    hrUserId: string;
}

export interface NotificationResult {
    success: boolean;
    type: 'interview_invite' | 'rejection' | 'none';
    emailSent: boolean;
    calendarEventCreated: boolean;
    meetLink?: string;
    interviewDateTime?: Date;
    error?: string;
}

/**
 * Determine if the application score warrants an interview
 * High scores (>= 75) or "Strongly Agree" / high confidence decisions get interviews
 */
function shouldScheduleInterview(score: number, decision: string): boolean {
    const normalizedDecision = decision.toLowerCase().trim();

    // Check for positive decisions
    if (
        normalizedDecision.includes('strongly agree') ||
        normalizedDecision.includes('accept') ||
        normalizedDecision.includes('strongly recommend') ||
        normalizedDecision.includes('excellent')
    ) {
        return true;
    }

    // Score-based check
    return score >= 60;
}

/**
 * Process an application and send the appropriate notification email
 */
export async function processApplicationNotification(
    data: ApplicationNotificationData
): Promise<NotificationResult> {
    console.log(`\n=== Processing notification for application ${data.applicationId} ===`);
    console.log(`Candidate: ${data.candidateName}, Score: ${data.atsScore}, Decision: ${data.atsDecision}`);

    const result: NotificationResult = {
        success: false,
        type: 'none',
        emailSent: false,
        calendarEventCreated: false,
    };

    try {
        // Get HR's stored access token from database
        const { default: getPrisma } = await import('@/lib/prisma');
        const prisma = getPrisma();

        const hrUser = await prisma.user.findUnique({
            where: { id: data.hrUserId },
        });

        if (!hrUser) {
            console.error(`HR user not found: ${data.hrUserId}`);
            result.error = 'HR user not found';
            return result;
        }

        // Check if HR has stored Google access token
        const accessToken = hrUser.google_access_token;

        if (!accessToken) {
            console.log('HR has not connected Google Workspace. Skipping email notification.');
            result.error = 'HR has not connected Google Workspace';
            return result;
        }

        const hrEmail = hrUser.email;
        const hrName = hrUser.name || 'HR Team';

        // Determine which flow to execute based on score
        if (shouldScheduleInterview(data.atsScore, data.atsDecision)) {
            // HIGH SCORE: Schedule interview and send invitation
            result.type = 'interview_invite';
            console.log('High score detected - scheduling interview...');

            // Schedule the interview
            const interviewResult = await scheduleInterview(
                accessToken,
                hrUser.google_refresh_token,
                data.candidateName,
                data.candidateEmail,
                data.jobTitle,
                data.companyName
            );

            if (!interviewResult.success || !interviewResult.meetLink || !interviewResult.interviewDateTime) {
                console.error('Failed to schedule interview:', interviewResult.error);
                result.error = interviewResult.error || 'Failed to schedule interview';
                return result;
            }

            result.calendarEventCreated = true;
            result.meetLink = interviewResult.meetLink;
            result.interviewDateTime = interviewResult.interviewDateTime;

            // Draft the interview invitation email
            const emailContent = await draftInterviewInviteEmail({
                candidateName: data.candidateName,
                jobTitle: data.jobTitle,
                companyName: data.companyName,
                interviewDateTime: interviewResult.interviewDateTime,
                meetLink: interviewResult.meetLink,
                hrName,
            });

            const emailHtml = formatEmailHtml(emailContent, data.companyName);

            // Send the email
            const emailResult = await sendEmailViaGmail(accessToken, hrUser.google_refresh_token, hrEmail, {
                to: data.candidateEmail,
                subject: `Interview Invitation: ${data.jobTitle} at ${data.companyName}`,
                htmlBody: emailHtml,
            });

            result.emailSent = emailResult.success;
            if (!emailResult.success) {
                result.error = emailResult.error;
            }

            // NOTIFY HR
            console.log('Sending summary email to HR...');
            const hrSummaryHtml = `
                <h2>New Candidate Interview Scheduled</h2>
                <p><strong>Candidate:</strong> ${data.candidateName}</p>
                <p><strong>Score:</strong> ${data.atsScore}/100</p>
                <p><strong>Decision:</strong> ${data.atsDecision}</p>
                <p>An interview invitation has been sent to the candidate for:</p>
                <p><strong>Date:</strong> ${interviewResult.interviewDateTime?.toLocaleString()}</p>
                <p><strong>Link:</strong> <a href="${interviewResult.meetLink}">${interviewResult.meetLink}</a></p>
                <hr />
                <p>You can view full details in the dashboard.</p>
            `;

            await sendEmailViaGmail(accessToken, hrUser.google_refresh_token, hrEmail, {
                to: hrEmail,
                subject: `[Action Required] Interview Scheduled: ${data.candidateName}`,
                htmlBody: hrSummaryHtml,
            }).catch(e => console.error('Failed to notify HR:', e));

        } else {
            // LOW/MID SCORE: Send rejection email with feedback
            result.type = 'rejection';
            console.log('Low/mid score - sending rejection email with feedback...');

            // Draft the rejection email
            const emailContent = await draftRejectionEmail({
                candidateName: data.candidateName,
                jobTitle: data.jobTitle,
                companyName: data.companyName,
                missingSkills: data.atsMissingSkills,
                reasons: data.atsReasons,
                hrName,
            });

            const emailHtml = formatEmailHtml(emailContent, data.companyName);

            // Send the email
            const emailResult = await sendEmailViaGmail(accessToken, hrUser.google_refresh_token, hrEmail, {
                to: data.candidateEmail,
                subject: `Update on Your Application: ${data.jobTitle} at ${data.companyName}`,
                htmlBody: emailHtml,
            });

            result.emailSent = emailResult.success;
            if (!emailResult.success) {
                result.error = emailResult.error;
            }
        }

        result.success = result.emailSent;
        console.log(`Notification processing complete. Success: ${result.success}, Type: ${result.type}`);

        return result;

    } catch (error: any) {
        console.error('Error processing application notification:', error);
        result.error = error.message || 'Unknown error';
        return result;
    }
}
