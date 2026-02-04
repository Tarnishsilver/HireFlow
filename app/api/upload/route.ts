import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Validate file type
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

        // Convert file to Buffer for DB storage
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Save to Database (Neon Postgres)
        // Dynamically import prisma to ensure fresh instance
        const { default: getPrisma } = await import('@/lib/prisma');
        const prisma = getPrisma();

        // Use 'any' type for prisma.file if types aren't generated yet (due to dev server lock)
        // This prevents build errors during the transition
        const prismaAny = prisma as any;

        const savedFile = await prismaAny.file.create({
            data: {
                filename: file.name,
                mime_type: file.type,
                data: buffer,
            },
        });



        // Return URL to serve the file
        const url = `/api/file/${savedFile.id}`;

        return NextResponse.json({
            url: url,
            filename: file.name,
        });

    } catch (error: any) {
        console.error('Upload to DB error:', error);
        return NextResponse.json(
            { error: 'Failed to upload file to database' },
            { status: 500 }
        );
    }
}
