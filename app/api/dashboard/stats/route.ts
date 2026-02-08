import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export async function GET() {
    try {
        const prisma = getPrisma();
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentDay = today.getDate();

        // 1. Fetch Birthdays in current month
        // Prisma doesn't support complex date filtering easily across years in standard findMany without raw query or post-processing
        // For small scale, fetch all employees and filter in JS. For larger, use raw query.
        const allEmployees = await prisma.employee.findMany({
            select: {
                id: true,
                first_name: true,
                last_name: true,
                date_of_birth: true,
                avatar_color: true,
                job_title: true
            }
        });

        const birthdays = allEmployees.filter((emp: any) => {
            if (!emp.date_of_birth) return false;
            const dob = new Date(emp.date_of_birth);
            return dob.getMonth() === currentMonth;
        }).map((emp: any) => ({
            id: emp.id,
            name: `${emp.first_name} ${emp.last_name}`,
            date: new Date(emp.date_of_birth!).getDate(),
            avatarColor: emp.avatar_color,
            role: emp.job_title,
            type: 'Birthday'
        })).sort((a: any, b: any) => a.date - b.date);

        // 2. Fetch Leaves in current month (Approved only for "What's On")
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        const leaves = await prisma.leaveRequest.findMany({
            where: {
                status: 'Approved',
                OR: [
                    { start_date: { gte: startOfMonth, lte: endOfMonth } },
                    { end_date: { gte: startOfMonth, lte: endOfMonth } }
                ]
            },
            include: {
                employee: {
                    select: {
                        first_name: true,
                        last_name: true,
                        avatar_color: true,
                        job_title: true
                    }
                }
            },
            take: 10
        });

        const timeOffEvents = leaves.map((leave: any) => ({
            id: leave.id,
            name: `${leave.employee.first_name} ${leave.employee.last_name}`,
            role: leave.employee.job_title,
            type: leave.type, // e.g., "Annual", "Sick"
            status: 'On Leave',
            avatarColor: leave.employee.avatar_color,
            date: new Date(leave.start_date).getDate() // Simplified to start date for sorting
        }));

        // 3. On Leave Today
        const onLeaveToday = await prisma.leaveRequest.findMany({
            where: {
                status: 'Approved',
                start_date: { lte: today },
                end_date: { gte: today }
            },
            include: {
                employee: {
                    select: {
                        first_name: true,
                        last_name: true,
                        avatar_color: true,
                    }
                }
            }
        });

        const todayLeaves = onLeaveToday.map((leave: any) => ({
            employeeName: `${leave.employee.first_name} ${leave.employee.last_name}`,
            type: leave.type,
            avatarColor: leave.employee.avatar_color,
            days: Math.ceil((new Date(leave.end_date).getTime() - new Date(leave.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1,
            dates: `${new Date(leave.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(leave.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
        }));

        return NextResponse.json({
            birthdays,
            timeOffEvents,
            todayLeaves
        });

    } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
