import { NextRequest, NextResponse } from "next/server";

const RAG_API_BASE = "https://ragbot-g06a.onrender.com";

const SYNONYMS: Record<string, string[]> = {
    "leaving": ["termination", "resignation", "quitting"],
    "leave": ["termination", "resignation", "quitting"],
};

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Strict minimal schema requested by user
        let enhancedQuestion = body.question;
        const lowerQuestion = enhancedQuestion.toLowerCase();

        // Check for synonyms and expand query
        for (const [key, terms] of Object.entries(SYNONYMS)) {
            if (lowerQuestion.includes(key)) {
                enhancedQuestion += ` (related: ${terms.join(", ")})`;
            }
        }

        // Strict minimal schema requested by user
        const requestBody = {
            session_id: "session_1770215395211_9wb4u19ae",
            company_id: "test",
            question: enhancedQuestion,
        };

        console.log("Sending to RAG:", JSON.stringify(requestBody, null, 2));

        const response = await fetch(`${RAG_API_BASE}/ask`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
        });

        const data = await response.json();
        console.log("RAG Response:", data);

        return NextResponse.json(data);
    } catch (error) {
        console.error("RAG Error:", error);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
