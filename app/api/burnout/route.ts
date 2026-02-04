import { NextRequest, NextResponse } from "next/server";

// Placeholder URL - user needs to update this or set in .env
const BURNOUT_API_BASE = process.env.BURNOUT_API_URL || "https://attrition-api-mlss.onrender.com";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields (basic check)
        const requiredFields = [
            "Age", "DistanceFromHome", "JobLevel", "MonthlyIncome",
            "NumCompaniesWorked", "TotalWorkingYears", "YearsAtCompany",
            "YearsInCurrentRole", "YearsSinceLastPromotion", "YearsWithCurrManager",
            "Department", "JobRole", "Gender", "MaritalStatus", "OverTime"
        ];

        for (const field of requiredFields) {
            if (body[field] === undefined) {
                return NextResponse.json(
                    { error: `Missing required field: ${field}` },
                    { status: 400 }
                );
            }
        }

        console.log("Forwarding prediction request to:", `${BURNOUT_API_BASE}/predict`);

        const response = await fetch(`${BURNOUT_API_BASE}/predict`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            console.error(`Burnout API Error: ${response.status} - ${response.statusText}`);
            return NextResponse.json(
                { error: `Prediction API error: ${response.status}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error("Burnout proxy error:", error);
        return NextResponse.json(
            { error: "Failed to process prediction request" },
            { status: 500 }
        );
    }
}
