import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { default: getPrisma } = await import('@/lib/prisma');
        const prisma = getPrisma();

        const departments = await prisma.department.findMany({
            orderBy: {
                name: 'asc'
            }
        });

        return NextResponse.json({ departments });
    } catch (error) {
        console.error('Failed to fetch departments:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
