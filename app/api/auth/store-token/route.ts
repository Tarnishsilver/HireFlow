import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/store-token
 * 
 * Store HR's Google OAuth token for background email sending.
 * Called when HR connects Google Workspace on the dashboard.
 */
export async function POST(request: NextRequest) {
    try {
        const { default: getPrisma } = await import('@/lib/prisma');
        const prisma = getPrisma();

        // Get authorization header
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const firebaseToken = authHeader.split('Bearer ')[1];

        // Decode Firebase token to get user info
        let userData: { uid: string; email: string } | null = null;
        try {
            const parts = firebaseToken.split('.');
            if (parts.length !== 3) {
                return NextResponse.json({ error: 'Invalid token format' }, { status: 401 });
            }
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
            if (payload.exp && payload.exp * 1000 < Date.now()) {
                return NextResponse.json({ error: 'Token expired' }, { status: 401 });
            }
            userData = {
                uid: payload.user_id || payload.sub,
                email: payload.email,
            };
        } catch (error) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        // Get request body with Google access token
        const body = await request.json();
        const { google_access_token, google_refresh_token, token_expiry } = body;

        if (!google_access_token) {
            return NextResponse.json(
                { error: 'Google access token is required' },
                { status: 400 }
            );
        }

        // Update user with Google OAuth token
        const user = await prisma.user.update({
            where: { firebase_uid: userData.uid },
            data: {
                google_access_token,
                google_refresh_token: google_refresh_token || null,
                google_token_expiry: token_expiry ? new Date(token_expiry) : null,
            },
        });

        console.log(`Stored Google token for user ${user.email}`);

        return NextResponse.json({
            success: true,
            message: 'Google token stored successfully',
        });
    } catch (error: any) {
        console.error('Store token error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
