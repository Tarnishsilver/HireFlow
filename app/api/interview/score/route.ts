import { NextRequest, NextResponse } from 'next/server';
import getPrisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const prisma = getPrisma();
        const body = await req.json();
        const { interviewId, meetingId, scores, feedback } = body;

        if (!(interviewId || meetingId) || !scores) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const interview = await prisma.interview.update({
            where: interviewId ? { id: interviewId } : { meeting_id: meetingId },
            data: {
                scores: scores,
                feedback: feedback,
                status: 'COMPLETED',
            },
        });

        return NextResponse.json({ success: true, interview });
    } catch (error: any) {
        console.error('Error scoring interview:', error);
        return NextResponse.json({ error: error.message || 'Failed to score interview' }, { status: 500 });
    }
}
