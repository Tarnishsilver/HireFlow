import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const { default: getPrisma } = await import('@/lib/prisma');
        const prisma = getPrisma();
        const prismaAny = prisma as any;

        const fileRecord = await prismaAny.file.findUnique({
            where: { id },
        });

        if (!fileRecord) {
            return new NextResponse('File not found', { status: 404 });
        }

        // Return file content
        // fileRecord.data is likely a Buffer (Uint8Array in Prisma terms)
        return new NextResponse(fileRecord.data, {
            headers: {
                'Content-Type': fileRecord.mime_type,
                'Content-Disposition': `inline; filename="${fileRecord.filename}"`,
            },
        });

    } catch (error) {
        console.error('File serve error:', error);
        return new NextResponse('Internal server error', { status: 500 });
    }
}
