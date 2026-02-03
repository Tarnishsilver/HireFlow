import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// POST /api/upload - Handle file uploads via Proxy to Firebase Storage (Bypasses CORS)
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const token = formData.get('token') as string | null;
        const folder = (formData.get('folder') as string) || 'resumes';

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
        }

        // Validate file type (basic validation)
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

        // Configuration
        const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
        if (!bucket) {
            throw new Error('Firebase Storage Bucket not configured');
        }

        // Create unique filename
        const timestamp = Date.now();
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = `${folder}/${timestamp}-${sanitizedName}`;
        const encodedFilename = encodeURIComponent(filename);

        // Firebase Storage REST API URL
        const url = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o?name=${encodedFilename}`;

        // Upload to Firebase via REST
        // We forward the ID token for authentication
        const firebaseResponse = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': file.type,
            },
            body: file, // Next.js/Node fetch supports File/Blob body
        });

        if (!firebaseResponse.ok) {
            const errorText = await firebaseResponse.text();
            console.error('Firebase Storage Upload Failed:', errorText);
            throw new Error(`Firebase Storage Error: ${firebaseResponse.statusText}`);
        }

        const data = await firebaseResponse.json();

        // Construct public download URL
        // Format: https://firebasestorage.googleapis.com/v0/b/<bucket>/o/<name>?alt=media&token=<token>
        // The REST response returns metadata. We can use the media link or construct one.
        // We'll use the standard download URL format which usually requires the download token (different from auth token).
        // The upload response contains `downloadTokens`.

        const downloadToken = data.downloadTokens;
        const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodedFilename}?alt=media&token=${downloadToken}`;

        return NextResponse.json({
            url: publicUrl,
            filename: filename,
        });

    } catch (error: any) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to upload file' },
            { status: 500 }
        );
    }
}
