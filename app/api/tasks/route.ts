import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export async function GET() {
    try {
        const prisma = getPrisma();
        const tasks = await prisma.task.findMany({
            orderBy: { created_at: 'desc' }
        });
        return NextResponse.json({ tasks });
    } catch (error) {
        console.error('Failed to fetch tasks:', error);
        return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const prisma = getPrisma();
        const body = await request.json();
        const { title } = body;

        if (!title) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }

        const task = await prisma.task.create({
            data: {
                title,
                is_completed: false
            }
        });

        return NextResponse.json({ task });
    } catch (error) {
        console.error('Failed to create task:', error);
        return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
    }
}
