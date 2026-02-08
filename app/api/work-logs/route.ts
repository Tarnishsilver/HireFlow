
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { default: getPrisma } = await import('@/lib/prisma');
        const prisma = getPrisma();

        // Ideally filter by logged in user, for now fetching all for demo or first user
        const workLogs = await prisma.workLog.findMany({
            take: 7,
            orderBy: {
                date: 'desc'
            }
        });

        // Map to chart data format
        // Expected: { name: 'Day', hours: 8 }
        const chartData = workLogs.map((log: any) => ({
            name: new Date(log.date).toLocaleDateString('en-US', { weekday: 'short' }),
            hours: log.hours_worked
        })).reverse();

        return NextResponse.json({ workLogs: chartData });

    } catch (error) {
        console.error('Failed to fetch work logs:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { default: getPrisma } = await import('@/lib/prisma');
        const prisma = getPrisma();
        const body = await request.json();

        if (!body.employee_id || !body.date || !body.hours_worked) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const workLog = await prisma.workLog.create({
            data: {
                employee_id: body.employee_id,
                date: new Date(body.date),
                hours_worked: parseFloat(body.hours_worked),
                overtime: parseFloat(body.overtime || '0'),
                status: body.status || 'On Time'
            }
        });

        return NextResponse.json({ workLog }, { status: 201 });
    } catch (error) {
        console.error('Failed to create work log:', error);
        return NextResponse.json({ error: 'Failed to create work log' }, { status: 500 });
    }
}
