import { NextRequest, NextResponse } from "next/server";

const RAG_API_BASE = "https://ragbot-g06a.onrender.com";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // The RAG API requires a company_id field
        const requestBody = {
            ...body,
            company_id: body.company_id || "default",
        };

        const response = await fetch(`${RAG_API_BASE}/ask`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: `API error: ${response.status}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("RAG API error:", error);
        return NextResponse.json(
            { error: "Failed to connect to RAG API" },
            { status: 500 }
        );
    }
}
