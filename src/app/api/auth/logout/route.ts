import { NextResponse } from "next/server";
import { TOKEN_COOKIE } from "@/lib/config";

export async function POST() {
    const response = NextResponse.json({ message: "Logged out" });
    response.cookies.delete(TOKEN_COOKIE);
    return response;
}