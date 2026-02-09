
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function downloadFileAsBuffer(url: string): Promise<Buffer> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to download file: ${response.statusText}`);
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

export async function parseJobDescription(text: string): Promise<any> {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const prompt = `
        Extract the following from the job description:
        1. "hard_requirements": A list of mandatory technical skills, years of experience, and degrees.
        2. "preferred_skills": A list of nice-to-have skills.
        3. "skill_normalization": A dictionary mapping variations of a skill to a standard name (e.g., "React.js" -> "React").

        Job Description:
        ${text}

        Return ONLY raw JSON.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const textResponse = response.text();

        // Clean markdown code blocks if present
        const cleanedText = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanedText);
    } catch (error) {
        console.error("Error parsing JD:", error);
        return {
            hard_requirements: [],
            preferred_skills: [],
            skill_normalization: {}
        };
    }
}

export async function scoreResume(jdPayload: string, resumeBuffer: Buffer, filename: string): Promise<{
    score: number;
    decision: 'YES' | 'NO' | 'MAYBE';
    missing: string[];
    reasons: string[];
}> {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // Convert buffer to base64 for Gemini
        const base64Resume = resumeBuffer.toString('base64');
        const mimeType = filename.endsWith('.pdf') ? 'application/pdf' : 'text/plain'; // Simple check

        const prompt = `
        You are an expert ATS (Applicant Tracking System).
        
        Job Criteria (JSON):
        ${jdPayload}

        Evaluate the attached resume against these criteria.
        
        Output JSON only:
        {
            "score": number (0-100),
            "decision": "YES" | "NO" | "MAYBE",
            "missing": ["list", "of", "missing", "hard", "requirements"],
            "reasons": ["brief", "explanation", "points"]
        }
        `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Resume,
                    mimeType: mimeType
                }
            }
        ]);

        const response = await result.response;
        const text = response.text();
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanedText);

    } catch (error) {
        console.error("Error scoring resume:", error);
        return {
            score: 0,
            decision: 'NO',
            missing: ['Error analyzing resume'],
            reasons: ['AI processing failed']
        };
    }
}
