import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { default: getPrisma } = await import('@/lib/prisma');
        const prisma = getPrisma();

        // Fetch announcements
        const announcements = await prisma.announcement.findMany({
            orderBy: { created_at: 'desc' },
            take: 10
        });

        // Fetch recent messages (mocking "recent" logic for now, just last 20)
        // In a real app, we'd filter by logged-in user.
        // For this demo, we'll fetch all to show the UI is working.
        const messages = await prisma.message.findMany({
            include: {
                sender: {
                    select: { first_name: true, last_name: true, avatar_color: true }
                },
                receiver: {
                    select: { first_name: true, last_name: true }
                }
            },
            orderBy: { created_at: 'desc' },
            take: 20
        });

        const notifications = await prisma.notification.findMany({
            orderBy: { created_at: 'desc' },
            take: 10
        });

        return NextResponse.json({
            announcements,
            messages,
            notifications
        });
    } catch (error) {
        console.error('Failed to fetch communication data:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { default: getPrisma } = await import('@/lib/prisma');
        const prisma = getPrisma();
        const body = await request.json();

        if (body.type === 'announcement') {
            const announcement = await prisma.announcement.create({
                data: {
                    title: body.title,
                    content: body.content,
                    type: body.targetType || 'Company',
                    priority: body.priority || 'Normal',
                    author_id: body.authorId // User ID from frontend
                }
            });
            return NextResponse.json({ success: true, data: announcement });
        } else if (body.type === 'message') {
            const message = await prisma.message.create({
                data: {
                    content: body.content,
                    sender_id: body.senderId,
                    receiver_id: body.receiverId, // Optional
                }
            });
            return NextResponse.json({ success: true, data: message });
        }

        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    } catch (error) {
        console.error('Failed to create communication:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
