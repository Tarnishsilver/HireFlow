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

    // Dynamic date: 7 days ago
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const dateQuery = oneWeekAgo.toISOString().split('T')[0].replace(/-/g, '/');

    // Search for HR related emails (interview, offer, meeting, schedule)
    const query = `subject:(interview OR offer OR onboarding OR HR OR meeting OR schedule) after:${dateQuery}`;

    try {
        const response = await gmail.users.messages.list({
            userId: 'me',
            q: query,
            maxResults: 20, // Increased to capture more
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
            const dateStr = headers?.find(h => h.name === 'Date')?.value || '';

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
                timestamp: formatDate(dateStr),
                threadId: message.threadId!,
                // We might want to expose the raw snippet for the calendar parser later, 
                // but for now the interface doesn't have it. 
                // Let's rely on the action to fetch details if needed, or update interface.
                // For simplicity in this step, we keep the interface as is, 
                // but we will export a helper to parse emails for calendar in the action.
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
