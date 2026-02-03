import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Verify Firebase ID token (simplified)
async function verifyFirebaseToken(authHeader: string | null): Promise<{ uid: string; email: string } | null> {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;

        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

        if (payload.exp && payload.exp * 1000 < Date.now()) {
            return null;
        }

        return {
            uid: payload.user_id || payload.sub,
            email: payload.email,
        };
    } catch (error) {
        return null;
    }
}

export async function GET(request: NextRequest) {
    try {
        const { default: getPrisma } = await import('@/lib/prisma');
        const prisma = getPrisma();

        // Verify the Firebase token
        const authHeader = request.headers.get('Authorization');
        const tokenData = await verifyFirebaseToken(authHeader);

        if (!tokenData) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user from database and verify they are HR
        const user = await prisma.user.findUnique({
            where: { firebase_uid: tokenData.uid },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (user.role !== 'HR') {
            return NextResponse.json({ error: 'Only HR users can view applications' }, { status: 403 });
        }

        // Get all applications for jobs created by this HR user
        const applications = await prisma.application.findMany({
            where: {
                job: {
                    created_by: user.id,
                },
            },
            include: {
                job: {
                    select: {
                        id: true,
                        title: true,
                        company_name: true,
                    },
                },
            },
            orderBy: {
                created_at: 'desc',
            },
        });

        return NextResponse.json({ applications });
    } catch (error: any) {
        console.error('Fetch applications error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
