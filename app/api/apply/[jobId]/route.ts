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

// POST /api/apply/[jobId] - Candidate submits application
export async function POST(
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

        // Verify job exists and is LIVE
        const job = await prisma.jobOpening.findUnique({
            where: { id: jobId },
        });

        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        if (job.status !== 'LIVE') {
            return NextResponse.json(
                { error: 'This job is no longer accepting applications' },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { candidate_name, candidate_email, resume_url, github_url, portfolio_url } = body;

        // Validate required fields
        if (!candidate_name || !candidate_email || !resume_url) {
            return NextResponse.json(
                { error: 'Name, email, and resume are required' },
                { status: 400 }
            );
        }

        // Check if user already applied
        const existingApplication = await prisma.application.findFirst({
            where: {
                job_id: jobId,
                candidate_email: candidate_email,
            },
        });

        if (existingApplication) {
            return NextResponse.json(
                { error: 'You have already applied to this job' },
                { status: 400 }
            );
        }

        // Create application
        const application = await prisma.application.create({
            data: {
                job_id: jobId,
                candidate_name,
                candidate_email,
                resume_url,
                github_url: github_url || null,
                portfolio_url: portfolio_url || null,
            },
            include: {
                job: {
                    select: {
                        title: true,
                        company_name: true,
                    },
                },
            },
        });

        return NextResponse.json({ application }, { status: 201 });
    } catch (error: any) {
        console.error('Apply error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
