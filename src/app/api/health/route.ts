import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({
        status: "ok",
        service: "fe-next",
        timestamp: new Date().toISOString(),
    });
}
