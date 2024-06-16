import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    // http://localhost:3000/api/healthcheck 
    try {
        return NextResponse.json(
            {
                message: "Successfully called Nextjs healthcheck endpoint!",
            },
            {
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "*",
                    "Access-Control-Allow-Methods": "*",
                    "Content-Type": "application/json",
                },
            }
        );
    } catch (e) {
        return NextResponse.error();
    }
}