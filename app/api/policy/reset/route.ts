import { NextRequest, NextResponse } from "next/server";

const RAG_API_BASE = "https://ragbot-g06a.onrender.com";

export async function POST(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get("session_id");

        if (!sessionId) {
            return NextResponse.json(
                { error: "session_id is required" },
                { status: 400 }
            );
        }

        const response = await fetch(
            `${RAG_API_BASE}/reset?session_id=${encodeURIComponent(sessionId)}`,
            {
                method: "POST",
            }
        );

        if (!response.ok) {
            return NextResponse.json(
                { error: `API error: ${response.status}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("RAG API reset error:", error);
        return NextResponse.json(
            { error: "Failed to reset session" },
            { status: 500 }
        );
    }
}
