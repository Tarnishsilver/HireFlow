import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const { default: getPrisma } = await import('@/lib/prisma');
        const prisma = getPrisma();
        const employeeId = params.id;

        const employee = await prisma.employee.findUnique({
            where: { id: employeeId },
            include: {
                department: true,
                manager: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                    }
                },
                performance_reviews: {
                    orderBy: { review_date: 'desc' },
                    take: 1
                },
                payroll: {
                    orderBy: { effective_date: 'desc' },
                    take: 1
                },
                projects: {
                    include: {
                        project: true
                    }
                },
                leaves: {
                    orderBy: { start_date: 'desc' },
                    take: 5
                },
                work_logs: {
                    orderBy: { date: 'desc' },
                    take: 5
                }
            }
        });

        if (!employee) {
            return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
        }

        return NextResponse.json({ employee });
    } catch (error) {
        console.error('Failed to fetch employee details:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
