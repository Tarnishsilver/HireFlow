'use server';

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { fetchHREmails } from "@/lib/gmail";
import { fetchHREvents } from "@/lib/calendar";

export async function getDashboardData() {
    const session: any = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
        throw new Error("Unauthorized: No Google access token found");
    }

    const [emails, events] = await Promise.all([
        fetchHREmails(session.accessToken),
        fetchHREvents(session.accessToken)
    ]);

    return { emails, events };
}
