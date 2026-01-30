import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export interface EmailContent {
    sender: string;
    subject: string;
    body: string;
}

export async function summarizeEmail(email: EmailContent): Promise<string> {
    try {
        const prompt = `You are a helpful assistant that summarizes emails. Provide a concise, well-structured summary.

**Email Details:**
- **From:** ${email.sender}
- **Subject:** ${email.subject}

**Email Body:**
${email.body}

---
**Your Summary (2-3 sentences max):**
Provide the key points, any action items, and the overall purpose of this email.
`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.1-8b-instant", // Updated to a supported model
            temperature: 0.5,
            max_tokens: 150,
        });

        return chatCompletion.choices[0]?.message?.content || "No summary available.";
    } catch (error) {
        console.error("Error summarizing email with Groq:", error);
        return "Failed to generate summary.";
    }
}
