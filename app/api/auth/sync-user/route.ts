import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Verify Firebase ID token (simplified - in production use firebase-admin)
async function verifyFirebaseToken(authHeader: string | null): Promise<{ uid: string; email: string; name?: string } | null> {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        // Decode the JWT token (simplified verification)
        // In production, use firebase-admin to properly verify the token
        const parts = token.split('.');
        if (parts.length !== 3) return null;

        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

        // Check if token is expired
        if (payload.exp && payload.exp * 1000 < Date.now()) {
            return null;
        }

        return {
            uid: payload.user_id || payload.sub,
            email: payload.email,
            name: payload.name,
        };
    } catch (error) {
        console.error('Token verification error:', error);
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

        const body = await request.json();
        const { role } = body;

        // Check if user already exists
        let user = await prisma.user.findUnique({
            where: { firebase_uid: tokenData.uid },
        });

        if (user) {
            // User exists, update if needed
            if (role && role !== user.role) {
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: { role },
                });
            }
        } else {
            // Create new user
            user = await prisma.user.create({
                data: {
                    firebase_uid: tokenData.uid,
                    email: tokenData.email,
                    name: tokenData.name || null,
                    role: role || 'CANDIDATE',
                },
            });
        }

        return NextResponse.json({
            user: {
                id: user.id,
                firebase_uid: user.firebase_uid,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        });
    } catch (error: any) {
        console.error('Sync user error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
