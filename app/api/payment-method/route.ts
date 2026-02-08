
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { default: getPrisma } = await import('@/lib/prisma');
        const prisma = getPrisma();

        const paymentMethod = await prisma.companyPaymentMethod.findFirst({
            where: { is_default: true }
        });

        if (!paymentMethod) {
            return NextResponse.json({ paymentMethod: null });
        }

        return NextResponse.json({
            paymentMethod: {
                cardHolder: paymentMethod.card_holder,
                accountNumber: paymentMethod.account_number,
                expiration: paymentMethod.expiration,
                cardType: paymentMethod.card_type,
                methodType: paymentMethod.method_type
            }
        });
    } catch (error) {
        console.error('Failed to fetch payment method:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { default: getPrisma } = await import('@/lib/prisma');
        const prisma = getPrisma();
        const body = await request.json();

        // Check req fields
        if (!body.card_holder || !body.account_number || !body.expiration || !body.card_type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Deactivate old default if setting new default
        if (body.is_default) {
            await prisma.companyPaymentMethod.updateMany({
                where: { is_default: true },
                data: { is_default: false }
            });
        }

        const paymentMethod = await prisma.companyPaymentMethod.create({
            data: {
                card_holder: body.card_holder,
                account_number: body.account_number,
                expiration: body.expiration,
                card_type: body.card_type,
                method_type: body.method_type || 'Debit Card',
                is_default: body.is_default !== undefined ? body.is_default : true
            }
        });

        return NextResponse.json({ paymentMethod }, { status: 201 });

    } catch (error) {
        console.error('Failed to create payment method:', error);
        return NextResponse.json({ error: 'Failed to create payment method' }, { status: 500 });
    }
}
