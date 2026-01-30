import { getGmailClient } from './google';

export interface EmailSummary {
    id: string;
    sender: string;
    subject: string;
    summary: string;
    category: 'Interviews' | 'Offers' | 'Onboarding' | 'Internal HR';
    timestamp: string;
    threadId: string;
}

export async function fetchHREmails(accessToken: string): Promise<EmailSummary[]> {
    const gmail = getGmailClient(accessToken);

    // Search for HR related emails from the last 14 days
    const query = 'subject:(interview OR offer OR onboarding OR HR) after:2026/01/15';

    try {
        const response = await gmail.users.messages.list({
            userId: 'me',
            q: query,
            maxResults: 10,
        });

        const messages = response.data.messages || [];
        const emailSummaries: EmailSummary[] = [];

        for (const message of messages) {
            const msg = await gmail.users.messages.get({
                userId: 'me',
                id: message.id!,
            });

            const headers = msg.data.payload?.headers;
            const subject = headers?.find(h => h.name === 'Subject')?.value || 'No Subject';
            const from = headers?.find(h => h.name === 'From')?.value || 'Unknown Sender';
            const date = headers?.find(h => h.name === 'Date')?.value || '';

            const snippet = msg.data.snippet || '';

            // Mock AI Summarizer logic
            const summary = generateMockSummary(snippet, subject);
            const category = determineCategory(subject, snippet);

            emailSummaries.push({
                id: message.id!,
                sender: from,
                subject: subject,
                summary: summary,
                category: category,
                timestamp: formatDate(date),
                threadId: message.threadId!,
            });
        }

        return emailSummaries;
    } catch (error) {
        console.error('Error fetching Gmail messages:', error);
        return [];
    }
}

function determineCategory(subject: string, snippet: string): EmailSummary['category'] {
    const text = (subject + ' ' + snippet).toLowerCase();
    if (text.includes('interview')) return 'Interviews';
    if (text.includes('offer')) return 'Offers';
    if (text.includes('onboard')) return 'Onboarding';
    return 'Internal HR';
}

function generateMockSummary(snippet: string, subject: string): string {
    // In a real app, this would call an LLM
    return `This email regarding "${subject}" discusses the next steps in the process. ${snippet.slice(0, 100)}...`;
}

function formatDate(dateString: string): string {
    if (!dateString) return 'Recent';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
}
