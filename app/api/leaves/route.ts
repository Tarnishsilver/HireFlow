
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { default: getPrisma } = await import('@/lib/prisma');
        const prisma = getPrisma();

        const leaves = await prisma.leaveRequest.findMany({
            include: {
                employee: true
            },
            orderBy: {
                start_date: 'desc'
            }
        });

        const formattedLeaves = leaves.map((leave: any) => ({
            id: leave.id,
            employeeName: `${leave.employee.first_name} ${leave.employee.last_name}`, // Map to expected frontend prop
            type: leave.type,
            status: leave.status,
            dates: `${new Date(leave.start_date).toLocaleDateString()} - ${new Date(leave.end_date).toLocaleDateString()}`,
            days: Math.ceil((new Date(leave.end_date).getTime() - new Date(leave.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1,
            avatarColor: leave.employee.avatar_color
        }));

        return NextResponse.json({ leaves: formattedLeaves });
    } catch (error) {
        console.error('Failed to fetch leaves:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { default: getPrisma } = await import('@/lib/prisma');
        const prisma = getPrisma();
        const body = await request.json();

        if (!body.employee_id || !body.start_date || !body.end_date || !body.type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const leave = await prisma.leaveRequest.create({
            data: {
                employee_id: body.employee_id,
                start_date: new Date(body.start_date),
                end_date: new Date(body.end_date),
                type: body.type,
                reason: body.reason,
                status: 'Pending'
            }
        });

        return NextResponse.json({ leave }, { status: 201 });
    } catch (error) {
        console.error('Failed to create leave request:', error);
        return NextResponse.json({ error: 'Failed to create leave request' }, { status: 500 });
    }
}
