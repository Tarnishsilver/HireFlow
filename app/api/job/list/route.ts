import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/job/list - Public endpoint to list all LIVE jobs
export async function GET(request: NextRequest) {
    try {
        const { default: getPrisma } = await import('@/lib/prisma');
        const prisma = getPrisma();
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const createdBy = searchParams.get('created_by');

        const whereClause: any = {};

        // Filter by status (default to LIVE for public view, but allow all for HR dashboard)
        if (searchParams.get('internal') === 'true') {
            // Internal view (HR dashboard): show all statuses unless specifically filtered
            if (status) whereClause.status = status;
        } else {
            // Public view: default to LIVE
            if (status) {
                whereClause.status = status;
            } else {
                whereClause.status = 'LIVE';
            }
        }

        // Filter by creator (optional for HR dashboard now)
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
