import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/job/list - Public endpoint to list all LIVE jobs
export async function GET(request: NextRequest) {
    try {
        const { default: getPrisma } = await import('@/lib/prisma');
        const prisma = getPrisma();
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') || 'LIVE';
        const createdBy = searchParams.get('created_by');

        const whereClause: any = {};

        // Filter by status (default to LIVE for public)
        if (status) {
            whereClause.status = status;
        }

        // Filter by creator (for HR dashboard)
        if (createdBy) {
            whereClause.created_by = createdBy;
        }

        const jobs = await prisma.jobOpening.findMany({
            where: whereClause,
            orderBy: { created_at: 'desc' },
            include: {
                creator: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                _count: {
                    select: {
                        applications: true,
                    },
                },
            },
        });

        return NextResponse.json({ jobs });
    } catch (error: any) {
        console.error('List jobs error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
