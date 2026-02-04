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

// GET /api/applications/[jobId] - Fetch all applications for a specific job (HR only)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ jobId: string }> }
) {
    try {
        const { default: getPrisma } = await import('@/lib/prisma');
        const prisma = getPrisma();
        const { jobId } = await params;

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

        // Fetch all applications for this job, ordered by ATS score (high to low)
        const applications = await prisma.application.findMany({
            where: { job_id: jobId },
            orderBy: [
                { ats_score: 'desc' },
                { created_at: 'desc' },
            ],
            select: {
                id: true,
                candidate_name: true,
                candidate_email: true,
                resume_url: true,
                github_url: true,
                portfolio_url: true,
                created_at: true,
                ats_score: true,
                ats_decision: true,
                ats_missing_skills: true,
                ats_reasons: true,
                linkedin_url: true,
                social_data: true,
            },
        });

        return NextResponse.json({ applications }, { status: 200 });
    } catch (error: unknown) {
        console.error('Fetch applications error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
