/**
 * ATS Scoring API Client
 * 
 * This service provides functions to interact with the ATS scoring API:
 * - Parse job descriptions to extract requirements
 * - Score resumes against job descriptions
 */

import { createWorker } from 'tesseract.js';
const pdf = require('pdf-parse');

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

    // Prepare content
    let finalBlob: Blob;
    let finalFilename = resumeFilename;

    // Check if we need to extract text (e.g. if it's a scanned PDF)
    // We only do this check if it's a PDF.
    if (resumeFilename.toLowerCase().endsWith('.pdf') && Buffer.isBuffer(resumePdfBlob)) {
        const text = await extractTextFromPdf(resumePdfBlob);

        // If we extracted significant text via OCR (and the original was likely an image),
        // we might want to send this text as a .txt file to the API instead of the raw image PDF
        // to ensure the specific ATS backend can read it (assuming the backend might not have OCR).

        // Heuristic: If we ran OCR (implied if we are here and text > 0), let's see.
        // Actually extractTextFromPdf runs OCR if needed.
        if (text.length > 50) {
            // Create a text file blob
            finalBlob = new Blob([text], { type: 'text/plain' });
            finalFilename = resumeFilename.replace(/\.pdf$/i, '.txt');
            console.log('Sending extracted text as resume.txt to ATS API');
        } else {
            // Fallback to original
            finalBlob = new Blob([new Uint8Array(resumePdfBlob)], { type: 'application/pdf' });
        }
    } else {
        // Blob or non-PDF
        if (Buffer.isBuffer(resumePdfBlob)) {
            finalBlob = new Blob([new Uint8Array(resumePdfBlob)], { type: 'application/pdf' });
        } else {
            finalBlob = resumePdfBlob as Blob;
        }
    }

    // Create FormData for multipart/form-data request
    const formData = new FormData();
    formData.append('jd', jdText);
    formData.append('resume_pdf', finalBlob, finalFilename);

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

// --- OCR Utilities ---

// Helper to perform OCR (Lazy load heavy dependencies)
async function performOcrOnPdf(pdfBuffer: Buffer): Promise<string> {
    try {
        console.log('Starting OCR process...');
        // Dynamic imports to prevent build crashes if these optional deps are missing
        const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
        const { createCanvas } = require('canvas');

        // Suppress PDF.js worker warning in Node
        // @ts-ignore
        if (!global.DOMMatrix) global.DOMMatrix = class { }; // Polyfill if needed for canvas/pdfjs interaction in some envs

        const uint8Array = new Uint8Array(pdfBuffer);
        const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
        const pdfDocument = await loadingTask.promise;

        console.log(`PDF loaded for OCR. Pages: ${pdfDocument.numPages}`);

        const worker = await createWorker('eng');
        let fullText = '';

        for (let i = 1; i <= Math.min(pdfDocument.numPages, 3); i++) { // Limit to 3 pages for performance
            console.log(`Processing page ${i} for OCR...`);
            const page = await pdfDocument.getPage(i);
            const viewport = page.getViewport({ scale: 1.5 }); // 1.5x scale is usually good enough for OCR
            const canvas = createCanvas(viewport.width, viewport.height);
            const context = canvas.getContext('2d');

            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;

            const imageBuffer = canvas.toBuffer('image/png');
            const { data: { text } } = await worker.recognize(imageBuffer);
            fullText += text + '\n';
        }

        await worker.terminate();
        console.log('OCR Complete. Extracted characters:', fullText.length);
        return fullText;

    } catch (error) {
        console.error('OCR Failed:', error);
        return '';
    }
}

/**
 * Extract text from PDF buffer, with OCR fallback for image-based PDFs
 */
export async function extractTextFromPdf(pdfBuffer: Buffer): Promise<string> {
    let text = '';

    // 1. Try standard text extraction
    try {
        const data = await pdf(pdfBuffer);
        text = data.text.trim();

    } catch (e) {
        console.warn('Standard PDF parse failed, trying OCR...', e);
    }

    // 2. OCR Fallback
    // If text is extremely short (likely just "Scanned by Scanner") or empty
    if (text.length < 50) {
        console.log('PDF has insufficient text (<50 chars), attempting OCR...');
        const ocrText = await performOcrOnPdf(pdfBuffer);
        if (ocrText.length > text.length) {
            text = ocrText;
        }
    }

    return text.trim();
    }
