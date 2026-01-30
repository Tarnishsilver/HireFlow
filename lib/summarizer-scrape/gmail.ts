import { getGmailClient } from './google';
import { analyzeEmail, MeetingDetails } from './groq';

export interface SuggestedEvent {
    title: string;
    date_str: string;
    duration_minutes?: number;
    attendees?: string[];
    location?: string;
    description?: string;
}


export interface EmailSummary {
    id: string;
    sender: string;
    subject: string;
    summary: string;
    category: 'Interviews' | 'Offers' | 'Onboarding' | 'Internal HR';
    timestamp: string;
    threadId: string;
    suggested_event?: SuggestedEvent | null;
}

export async function fetchHREmails(accessToken: string): Promise<EmailSummary[]> {
    try {
        const gmail = getGmailClient(accessToken);

        // Calculate date 24 hours ago
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 1);
        const dateQuery = Math.floor(startDate.getTime() / 1000);

        // Query for INBOX emails in the last 24 hours
        const query = `after:${dateQuery} in:inbox`;

        const res = await gmail.users.messages.list({
            userId: 'me',
            q: query,
            maxResults: 10, // Reduced to stay within Groq rate limits
        });

        const messages = res.data.messages || [];
        const summaries: EmailSummary[] = [];

        for (const message of messages) {
            if (!message.id) continue;

            try {
                const msg = await gmail.users.messages.get({
                    userId: 'me',
                    id: message.id,
                    format: 'full',
                });

                const payload = msg.data.payload;
                const headers = payload?.headers;
                const subject = headers?.find(h => h.name === 'Subject')?.value || 'No Subject';
                const from = headers?.find(h => h.name === 'From')?.value || 'Unknown Sender';
                const date = headers?.find(h => h.name === 'Date')?.value || new Date().toISOString();

                // Extract body snippet or full text if possible
                let body = msg.data.snippet || '';
                if (payload?.body?.data) {
                    body = Buffer.from(payload.body.data, 'base64').toString('utf-8');
                } else if (payload?.parts) {
                    // Simple logic to find text/plain part
                    const part = payload.parts.find(p => p.mimeType === 'text/plain');
                    if (part?.body?.data) {
                        body = Buffer.from(part.body.data, 'base64').toString('utf-8');
                    }
                }

                // Analyze using Groq - gets summary, category, and meeting extraction
                const analysis = await analyzeEmail({
                    sender: from,
                    subject: subject,
                    body: body
                });

                summaries.push({
                    id: message.id,
                    sender: from,
                    subject: subject,
                    summary: analysis.summary,
                    category: analysis.category,
                    timestamp: date,
                    threadId: message.threadId || message.id,
                    suggested_event: analysis.suggested_event
                });

            } catch (err) {
                console.error(`Failed to process message ${message.id}:`, err);
            }
        }

        return summaries;

    } catch (error) {
        console.error('Error fetching HR emails:', error);
        return [];
    }
}
