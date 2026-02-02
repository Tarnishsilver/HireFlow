import { NextRequest, NextResponse } from "next/server";

const RAG_API_BASE = "https://ragbot-g06a.onrender.com";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        const companyId = formData.get("company_id") as string || "default";

        if (!file) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 }
            );
        }

        // Validate file type (only PDFs allowed)
        if (!file.name.toLowerCase().endsWith('.pdf')) {
            return NextResponse.json(
                { error: "Only PDF files are allowed" },
                { status: 400 }
            );
        }

        // Create a new FormData to send to the RAG API
        const ragFormData = new FormData();
        ragFormData.append("company_id", companyId);
        ragFormData.append("file", file);

        const response = await fetch(`${RAG_API_BASE}/upload`, {
            method: "POST",
            body: ragFormData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("RAG API upload error:", errorText);
            return NextResponse.json(
                { error: `Upload failed: ${response.status}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json({
            success: true,
            message: "Document uploaded successfully",
            data
        });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "Failed to upload document" },
            { status: 500 }
        );
    }
}
