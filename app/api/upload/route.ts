import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

/**
 * Storage abstraction layer
 * Currently uses local file storage, but can be easily switched to S3/Cloudinary
 * by implementing a different storage adapter
 */

interface UploadResult {
    url: string;
    filename: string;
}

// Local storage implementation
async function saveToLocalStorage(
    file: File,
    folder: string = 'resumes'
): Promise<UploadResult> {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}-${originalName}`;

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
    if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
    }

    // Save file
    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    // Return public URL
    const url = `/uploads/${folder}/${filename}`;

    return { url, filename };
}

// POST /api/upload - Handle file uploads
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const folder = (formData.get('folder') as string) || 'resumes';

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Validate file type for resumes
        if (folder === 'resumes') {
            const allowedTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ];

            if (!allowedTypes.includes(file.type)) {
                return NextResponse.json(
                    { error: 'Invalid file type. Please upload PDF or DOC/DOCX files.' },
                    { status: 400 }
                );
            }

            // Max file size: 5MB
            const maxSize = 5 * 1024 * 1024;
            if (file.size > maxSize) {
                return NextResponse.json(
                    { error: 'File too large. Maximum size is 5MB.' },
                    { status: 400 }
                );
            }
        }

        // Save file using storage adapter (currently local)
        const result = await saveToLocalStorage(file, folder);

        return NextResponse.json({
            url: result.url,
            filename: result.filename,
        });
    } catch (error: any) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Failed to upload file' },
            { status: 500 }
        );
    }
}
