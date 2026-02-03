/**
 * ATS Scoring API Client
 * 
 * This service provides functions to interact with the ATS scoring API:
 * - Parse job descriptions to extract requirements
 * - Score resumes against job descriptions
 */

// Type definitions matching API schemas
export interface JDParseRequest {
    jd_text: string;
}

export interface JDParseResponse {
    hard_requirements: string[];
    preferred_skills: string[];
    skill_normalization: Record<string, any>;
}

export interface ScoreResumeResponse {
    decision: string;
    score: number;
    missing: string[];
    reasons: string[];
}

export interface ATSError {
    detail?: Array<{
        loc: (string | number)[];
        msg: string;
        type: string;
    }>;
}

/**
 * Parse a job description to extract requirements and skills
 */
export async function parseJobDescription(jdText: string): Promise<JDParseResponse> {
    const baseUrl = process.env.ATS_API_BASE_URL;

    if (!baseUrl) {
        throw new Error('ATS_API_BASE_URL is not configured');
    }

    const response = await fetch(`${baseUrl}/jd`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jd_text: jdText }),
    });

    if (!response.ok) {
        let errorDetail = '';
        try {
            const errorData = await response.json();
            errorDetail = JSON.stringify(errorData);
        } catch (e) {
            errorDetail = await response.text().catch(() => 'No response body');
        }
        console.error(`ATS JD parsing failed with status ${response.status}:`, errorDetail);
        throw new Error(`ATS JD parsing failed: ${response.status} - ${errorDetail}`);
    }

    return response.json();
}

/**
 * Score a resume against a job description
 * 
 * @param jdText - The job description text
 * @param resumePdfBlob - The resume PDF as a Blob or Buffer
 * @param resumeFilename - Original filename for the resume
 */
export async function scoreResume(
    jdText: string,
    resumePdfBlob: Blob | Buffer,
    resumeFilename: string = 'resume.pdf'
): Promise<ScoreResumeResponse> {
    const baseUrl = process.env.ATS_API_BASE_URL;

    if (!baseUrl) {
        throw new Error('ATS_API_BASE_URL is not configured');
    }

    // Create FormData for multipart/form-data request
    const formData = new FormData();
    formData.append('jd', jdText);

    // Convert Buffer or Blob to Blob for FormData
    let pdfBlob: Blob;
    if (Buffer.isBuffer(resumePdfBlob)) {
        // Node.js environment - convert Buffer to Blob
        pdfBlob = new Blob([new Uint8Array(resumePdfBlob)], { type: 'application/pdf' });
    } else {
        // It's a Blob
        pdfBlob = resumePdfBlob as Blob;
    }

    formData.append('resume_pdf', pdfBlob, resumeFilename);

    const response = await fetch(`${baseUrl}/score`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        let errorDetail = '';
        try {
            const errorData = await response.json();
            errorDetail = JSON.stringify(errorData);
        } catch (e) {
            errorDetail = await response.text().catch(() => 'No response body');
        }
        console.error(`ATS resume scoring failed with status ${response.status}:`, errorDetail);
        throw new Error(`ATS resume scoring failed: ${response.status} - ${errorDetail}`);
    }

    return response.json();
}

/**
 * Download a file from a URL and return as Buffer (for Node.js server-side use)
 */
export async function downloadFileAsBuffer(url: string): Promise<Buffer> {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to download file from ${url}: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
}
