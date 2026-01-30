import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

// Rate limiting: track last call time
let lastCallTime = 0;
const MIN_DELAY_MS = 3000; // 3 seconds between calls to stay under rate limit

export interface EmailContent {
    sender: string;
    subject: string;
    body: string;
}

export interface MeetingDetails {
    title: string;
    date_str: string; // ISO 8601 format
    duration_minutes: number;
    attendees: string[];
    location?: string;
    description?: string;
}

export interface EmailAnalysis {
    summary: string;
    category: 'Interviews' | 'Offers' | 'Onboarding' | 'Internal HR';
    suggested_event: MeetingDetails | null;
}

// Helper to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Truncate body to reduce token usage (keep first ~1000 chars)
function truncateBody(body: string, maxLength: number = 1000): string {
    if (body.length <= maxLength) return body;
    return body.substring(0, maxLength) + "... [truncated]";
}

export async function summarizeEmail(email: EmailContent): Promise<string> {
    const analysis = await analyzeEmail(email);
    return analysis.summary;
}

export async function analyzeEmail(email: EmailContent, retryCount: number = 0): Promise<EmailAnalysis> {
    try {
        // Rate limiting: ensure minimum delay between calls
        const now = Date.now();
        const timeSinceLastCall = now - lastCallTime;
        if (timeSinceLastCall < MIN_DELAY_MS) {
            await delay(MIN_DELAY_MS - timeSinceLastCall);
        }
        lastCallTime = Date.now();

        const today = new Date().toISOString().split('T')[0];

        // Truncate body to reduce tokens
        const truncatedBody = truncateBody(email.body);

        const prompt = `Analyze this email and return JSON only.

Today: ${today}
From: ${email.sender}
Subject: ${email.subject}
Body: ${truncatedBody}

Return JSON:
{"summary":"2-3 sentences","category":"Interviews|Offers|Onboarding|Internal HR","suggested_event":null or {"title":"...","date_str":"ISO datetime","duration_minutes":60,"attendees":[],"location":"","description":""}}

Rules: Set suggested_event to null if no meeting/appointment mentioned. Only JSON, no other text.`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.1-8b-instant",
            temperature: 0.3,
            max_tokens: 300, // Reduced for efficiency
        });

        const content = chatCompletion.choices[0]?.message?.content || "";

        // Parse the JSON response
        try {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]) as EmailAnalysis;
                return {
                    summary: parsed.summary || "No summary available.",
                    category: parsed.category || "Internal HR",
                    suggested_event: parsed.suggested_event || null
                };
            }
        } catch (parseError) {
            console.error("Failed to parse Groq JSON response:", parseError);
        }

        return {
            summary: content || "No summary available.",
            category: "Internal HR",
            suggested_event: null
        };

    } catch (error: any) {
        // Handle rate limit errors with exponential backoff
        if (error?.status === 429 && retryCount < 3) {
            const waitTime = Math.pow(2, retryCount + 1) * 10000; // 20s, 40s, 80s
            console.log(`Rate limited. Waiting ${waitTime / 1000}s before retry ${retryCount + 1}...`);
            await delay(waitTime);
            return analyzeEmail(email, retryCount + 1);
        }

        console.error("Error analyzing email with Groq:", error);
        return {
            summary: "Summary unavailable (rate limited).",
            category: "Internal HR",
            suggested_event: null
        };
    }
}

