/**
 * Email Drafter - LLM-powered email content generation
 * 
 * Uses Groq to generate professional, personalized email content.
 */

import Groq from 'groq-sdk';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

// Rate limiting
let lastCallTime = 0;
const MIN_DELAY_MS = 2000;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface InterviewInviteParams {
    candidateName: string;
    jobTitle: string;
    companyName: string;
    interviewDateTime: Date;
    meetLink: string;
    hrName?: string;
}

export interface RejectionEmailParams {
    candidateName: string;
    jobTitle: string;
    companyName: string;
    missingSkills: string[];
    reasons: string[];
    hrName?: string;
}

/**
 * Draft an interview invitation email using LLM
 */
export async function draftInterviewInviteEmail(params: InterviewInviteParams): Promise<string> {
    await enforceRateLimit();

    const formattedDate = params.interviewDateTime.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const formattedTime = params.interviewDateTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });

    const prompt = `Write a professional interview invitation email. Return ONLY the HTML body content (no DOCTYPE, html, head, or body tags - just the inner content).

Details:
- Candidate: ${params.candidateName}
- Position: ${params.jobTitle}
- Company: ${params.companyName}
- Interview Date: ${formattedDate}
- Interview Time: ${formattedTime}
- Google Meet Link: ${params.meetLink}
- HR Contact: ${params.hrName || 'HR Team'}

Requirements:
1. Be professional yet warm and welcoming
2. Congratulate them on being selected for an interview
3. Clearly state the date, time, and video call link
4. Include a button/link to the Google Meet
5. Ask them to confirm their attendance
6. Keep it concise but complete

Format the output as HTML with proper paragraph tags. Include a styled button for the Meet link.`;

    try {
        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.1-8b-instant',
            temperature: 0.7,
            max_tokens: 600,
        });

        const content = completion.choices[0]?.message?.content || '';

        // Clean up any markdown code blocks if present
        return content
            .replace(/```html\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();
    } catch (error) {
        console.error('Failed to draft interview invite:', error);
        // Fallback template
        return generateFallbackInterviewEmail(params, formattedDate, formattedTime);
    }
}

/**
 * Draft a rejection email with constructive feedback using LLM
 */
export async function draftRejectionEmail(params: RejectionEmailParams): Promise<string> {
    await enforceRateLimit();

    const skillsList = params.missingSkills.length > 0
        ? params.missingSkills.join(', ')
        : 'No specific skills identified';

    const reasonsList = params.reasons.length > 0
        ? params.reasons.join('; ')
        : 'General qualification requirements';

    const prompt = `Write a professional, constructive rejection email. Return ONLY the HTML body content (no DOCTYPE, html, head, or body tags).

Details:
- Candidate: ${params.candidateName}
- Position: ${params.jobTitle}
- Company: ${params.companyName}
- Missing Skills/Gaps: ${skillsList}
- Feedback Points: ${reasonsList}

Requirements:
1. Be respectful and empathetic - rejection emails should be kind
2. Thank them for their interest and application
3. Gently explain they were not selected THIS TIME
4. Provide constructive feedback about skills they could develop
5. Encourage them to apply for future positions
6. Keep it professional but human
7. DO NOT be harsh or discouraging

Format as HTML with proper paragraph tags. Use a styled list for skills to develop.`;

    try {
        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.1-8b-instant',
            temperature: 0.7,
            max_tokens: 600,
        });

        const content = completion.choices[0]?.message?.content || '';

        return content
            .replace(/```html\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();
    } catch (error) {
        console.error('Failed to draft rejection email:', error);
        // Fallback template
        return generateFallbackRejectionEmail(params);
    }
}

async function enforceRateLimit() {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTime;
    if (timeSinceLastCall < MIN_DELAY_MS) {
        await delay(MIN_DELAY_MS - timeSinceLastCall);
    }
    lastCallTime = Date.now();
}

function generateFallbackInterviewEmail(
    params: InterviewInviteParams,
    formattedDate: string,
    formattedTime: string
): string {
    return `
<p>Dear ${params.candidateName},</p>

<p>Congratulations! We are pleased to inform you that after reviewing your application for the <strong>${params.jobTitle}</strong> position at ${params.companyName}, we would like to invite you for an interview.</p>

<p><strong>Interview Details:</strong></p>
<ul>
    <li><strong>Date:</strong> ${formattedDate}</li>
    <li><strong>Time:</strong> ${formattedTime}</li>
    <li><strong>Format:</strong> Video call via Google Meet</li>
</ul>

<p style="margin: 20px 0;">
    <a href="${params.meetLink}" class="button" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
        Join Google Meet
    </a>
</p>

<p>Please confirm your attendance by replying to this email. If the scheduled time doesn't work for you, please let us know and we'll do our best to accommodate an alternative.</p>

<p>We look forward to speaking with you!</p>

<p>Best regards,<br>${params.hrName || 'The HR Team'}<br>${params.companyName}</p>
    `.trim();
}

function generateFallbackRejectionEmail(params: RejectionEmailParams): string {
    const skillsHtml = params.missingSkills.length > 0
        ? `<div class="skills-list">
            <p><strong>Areas for Development:</strong></p>
            <ul>
                ${params.missingSkills.map(skill => `<li>${skill}</li>`).join('\n                ')}
            </ul>
           </div>`
        : '';

    return `
<p>Dear ${params.candidateName},</p>

<p>Thank you for your interest in the <strong>${params.jobTitle}</strong> position at ${params.companyName} and for taking the time to submit your application.</p>

<p>After careful consideration, we have decided to move forward with other candidates whose qualifications more closely match our current requirements. This was a difficult decision as we received many strong applications.</p>

${skillsHtml}

<p>We encourage you to continue developing your skills and to keep an eye on our career page for future opportunities that may be a better fit. We would welcome your application for other positions in the future.</p>

<p>We wish you the best of luck in your job search and future endeavors.</p>

<p>Warm regards,<br>${params.hrName || 'The HR Team'}<br>${params.companyName}</p>
    `.trim();
}
