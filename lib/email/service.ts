/**
 * Email Service - Send emails via Gmail API
 * 
 * Uses the HR's OAuth access token to send emails from their account.
 */

import { google } from 'googleapis';

/**
 * Create an authenticated Gmail client
 */
export function createGmailClient(accessToken: string, refreshToken?: string) {
    const auth = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    );
    auth.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken
    });
    return google.gmail({ version: 'v1', auth });
}

/**
 * Encode email to base64url format required by Gmail API
 */
function createEncodedEmail(
    to: string,
    from: string,
    subject: string,
    htmlBody: string,
    textBody?: string
): string {
    const boundary = '----=_Part_0_' + Date.now();

    const emailLines = [
        `From: ${from}`,
        `To: ${to}`,
        `Subject: ${subject}`,
        'MIME-Version: 1.0',
        `Content-Type: multipart/alternative; boundary="${boundary}"`,
        '',
        `--${boundary}`,
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: quoted-printable',
        '',
        textBody || htmlBody.replace(/<[^>]*>/g, ''), // Strip HTML for plain text fallback
        '',
        `--${boundary}`,
        'Content-Type: text/html; charset=UTF-8',
        'Content-Transfer-Encoding: quoted-printable',
        '',
        htmlBody,
        '',
        `--${boundary}--`,
    ];

    const email = emailLines.join('\r\n');

    // Base64url encode
    return Buffer.from(email)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

export interface SendEmailOptions {
    to: string;
    subject: string;
    htmlBody: string;
    textBody?: string;
}

export interface SendEmailResult {
    success: boolean;
    messageId?: string;
    error?: string;
}

/**
 * Send an email using the HR's Gmail account
 * 
 * @param accessToken - HR's Google OAuth access token
 * @param hrEmail - HR's email address (the sender)
 * @param options - Email options (to, subject, body)
 */
export async function sendEmailViaGmail(
    accessToken: string,
    refreshToken: string | undefined | null,
    hrEmail: string,
    options: SendEmailOptions
): Promise<SendEmailResult> {
    try {
        const gmail = createGmailClient(accessToken, refreshToken || undefined);

        const encodedEmail = createEncodedEmail(
            options.to,
            hrEmail,
            options.subject,
            options.htmlBody,
            options.textBody
        );

        const response = await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: encodedEmail,
            },
        });

        console.log(`Email sent successfully to ${options.to}. Message ID: ${response.data.id}`);

        return {
            success: true,
            messageId: response.data.id || undefined,
        };
    } catch (error: any) {
        console.error('Failed to send email via Gmail:', error);
        console.error('Error details:', JSON.stringify(error.response?.data || error.message, null, 2));

        return {
            success: false,
            error: error.message || 'Unknown error sending email',
        };
    }
}

/**
 * Format email body with proper HTML template
 */
export function formatEmailHtml(content: string, companyName: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            border-bottom: 2px solid #4F46E5;
            padding-bottom: 20px;
            margin-bottom: 20px;
        }
        .company-name {
            font-size: 24px;
            font-weight: bold;
            color: #4F46E5;
        }
        .content {
            padding: 20px 0;
        }
        .footer {
            border-top: 1px solid #eee;
            padding-top: 20px;
            margin-top: 20px;
            font-size: 12px;
            color: #666;
        }
        .button {
            display: inline-block;
            background-color: #4F46E5;
            color: white !important;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 10px 0;
        }
        .skills-list {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
        }
        .skills-list li {
            margin: 8px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">${companyName}</div>
    </div>
    <div class="content">
        ${content}
    </div>
    <div class="footer">
        <p>This is an automated message from ${companyName}'s recruitment team.</p>
        <p>Please do not reply directly to this email.</p>
    </div>
</body>
</html>
    `.trim();
}
