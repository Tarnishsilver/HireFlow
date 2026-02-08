import { NextRequest, NextResponse } from 'next/server';
import getPrisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const prisma = getPrisma();
        const { searchParams } = new URL(req.url);
        const hrId = searchParams.get('hrId');
        const candidateId = searchParams.get('candidateId');
        const applicationId = searchParams.get('applicationId');

        let where: any = {};
        if (hrId) where.hr_id = hrId;
        if (candidateId) where.candidate_id = candidateId;
        if (applicationId) where.application_id = applicationId;

        const interviews = await prisma.interview.findMany({
            where,
            include: {
                application: {
                    include: {
                        job: true
                    }
                }
            },
            orderBy: {
                scheduled_at: 'asc'
            }
        });

        return NextResponse.json({ success: true, interviews });
    } catch (error: any) {
        console.error('Error fetching interviews:', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch interviews' }, { status: 500 });
    }
}
