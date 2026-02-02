import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Verify Firebase ID token (simplified)
async function verifyFirebaseToken(authHeader: string | null): Promise<{ uid: string; email: string } | null> {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;

        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

        if (payload.exp && payload.exp * 1000 < Date.now()) {
            return null;
        }

        return {
            uid: payload.user_id || payload.sub,
            email: payload.email,
        };
    } catch (error) {
        return null;
    }
}

export async function POST(request: NextRequest) {
    try {
        // Verify the Firebase token
        const authHeader = request.headers.get('Authorization');
        const tokenData = await verifyFirebaseToken(authHeader);

        if (!tokenData) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user from database and verify they are HR
        const user = await prisma.user.findUnique({
            where: { firebase_uid: tokenData.uid },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (user.role !== 'HR') {
            return NextResponse.json({ error: 'Only HR users can create jobs' }, { status: 403 });
        }

        const body = await request.json();
        const {
            title,
            company_name,
            location,
            job_type,
            experience_level,
            description,
            responsibilities,
            required_skills,
            preferred_skills,
            stipend,
        } = body;

        // Validate required fields
        if (!title || !company_name || !location || !job_type || !experience_level || !description) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Create job opening
        const job = await prisma.jobOpening.create({
            data: {
                title,
                company_name,
                location,
                job_type,
                experience_level,
                description,
                responsibilities: responsibilities || [],
                required_skills: required_skills || [],
                preferred_skills: preferred_skills || [],
                stipend: stipend || null,
                status: 'LIVE',
                created_by: user.id,
            },
            include: {
                creator: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });

        return NextResponse.json({ job }, { status: 201 });
    } catch (error: any) {
        console.error('Create job error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
