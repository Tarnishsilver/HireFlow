
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { default: getPrisma } = await import('@/lib/prisma');
        const prisma = getPrisma();

        const employees = await prisma.employee.findMany({
            include: {
                department: true,
            },
            orderBy: {
                first_name: 'asc'
            }
        });

        // Map to frontend structure if necessary, or return directly
        // Frontend expects: { id, name, email, role, department, status, avatar }
        // We'll return the raw data and map on frontend or map here. Let's map here for cleaner frontend.
        const formattedEmployees = employees.map((emp: any) => ({
            id: emp.id,
            name: `${emp.first_name} ${emp.last_name}`,
            email: emp.email,
            role: emp.job_title,
            department: emp.department.name,
            status: 'Active', // Hardcoded for now, could be derived
            avatar: emp.avatar_color // Store color class here
        }));

        return NextResponse.json({ employees: formattedEmployees });
    } catch (error) {
        console.error('Failed to fetch employees:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { default: getPrisma } = await import('@/lib/prisma');
        const prisma = getPrisma();
        const body = await request.json();

        // Basic validation
        if (!body.first_name || !body.last_name || !body.email || !body.department_id) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const employee = await prisma.employee.create({
            data: {
                first_name: body.first_name,
                last_name: body.last_name,
                email: body.email,
                phone: body.phone,
                job_title: body.job_title || 'Employee',
                contract_type: body.contract_type || 'Full-time',
                avatar_color: body.avatar_color || 'bg-blue-500',
                department_id: body.department_id,
                manager_id: body.manager_id
            }
        });

        return NextResponse.json({ employee }, { status: 201 });
    } catch (error) {
        console.error('Failed to create employee:', error);
        return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 });
    }
}
