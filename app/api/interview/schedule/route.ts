import { NextRequest, NextResponse } from 'next/server';
import getPrisma from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import { getBaseUrl } from '@/lib/url';

export async function POST(req: NextRequest) {
    try {
        const prisma = getPrisma();
        const body = await req.json();
        const { applicationId, scheduledAt, hrId, candidateId } = body;

        if (!applicationId || !scheduledAt || !hrId || !candidateId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Generate a unique meeting ID
        const meetingId = uuidv4();

        const interview = await prisma.interview.create({
            data: {
                meeting_id: meetingId,
                application_id: applicationId,
                hr_id: hrId,
                candidate_id: candidateId,
                scheduled_at: new Date(scheduledAt),
                status: 'SCHEDULED',
            },
            include: {
                application: {
                    include: {
                        job: true
                    }
                }
            }
        });

        // ---------------------------------------------------------
        // SEND EMAIL NOTIFICATION TO CANDIDATE
        // ---------------------------------------------------------
        try {
            // 1. Get HR's stored Google OAuth token
            const hrUser = await prisma.user.findUnique({
                where: { firebase_uid: hrId },
                select: { google_access_token: true }
            });

            if (hrUser?.google_access_token) {
                const candidateEmail = interview.application.candidate_email;
                const jobTitle = interview.application.job.title;
                const companyName = interview.application.job.company_name;
                const formattedDate = new Date(scheduledAt).toLocaleString();
                const joinUrl = `${getBaseUrl()}/meetings/${meetingId}`;

                const subject = `Interview Scheduled: ${jobTitle} at ${companyName}`;
                const emailBody = [
                    `Hi ${interview.application.candidate_name},`,
                    ``,
                    `Great news! You have been selected for an interview for the ${jobTitle} position at ${companyName}.`,
                    ``,
                    `Interview Details:`,
                    `- Date & Time: ${formattedDate}`,
                    `- Meeting ID: ${meetingId}`,
                    ``,
                    `You can join the interview via your dashboard or by clicking the link below:`,
                    `${joinUrl}`,
                    ``,
                    `Please ensure you have a working camera and microphone before joining.`,
                    ``,
                    `Best regards,`,
                    `HR Team @ ${companyName}`
                ].join('\n');

                const rawContent = Buffer.from(
                    `To: ${candidateEmail}\r\n` +
                    `Subject: ${subject}\r\n\r\n` +
                    `${emailBody}`
                ).toString('base64url');

                await fetch('https://www.googleapis.com/gmail/v1/users/me/messages/send', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${hrUser.google_access_token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ raw: rawContent }),
                });

                console.log(`[Email] Interview invite sent from HR (${hrId}) to ${candidateEmail}`);
            } else {
                console.warn(`[Email] Could not send invite: HR (${hrId}) has no Google token stored.`);
            }
        } catch (emailError) {
            console.error('[Email] Failed to send interview invitation:', emailError);
            // We don't fail the request if email fails, but we log it
        }

        return NextResponse.json({ success: true, interview });
    } catch (error: any) {
        console.error('Error scheduling interview:', error);
        return NextResponse.json({ error: error.message || 'Failed to schedule interview' }, { status: 500 });
    }
}
