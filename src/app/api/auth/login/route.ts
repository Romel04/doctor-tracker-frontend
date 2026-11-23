import { NextRequest, NextResponse } from "next/server";
import { BACKEND_API_URL, TOKEN_COOKIE } from "@/lib/config";

const COOKIE_MAX_AGE = 60 * 60 * 24; // 1 day, matches JWT_EXPIRES_IN=1d on the backend

export async function POST(request: NextRequest) {
    const body = await request.json();

    let res: Response;
    try {
        res = await fetch(`${BACKEND_API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            cache: "no-store",
        });
    } catch {
        return NextResponse.json({ message: "Cannot reach the server. Please try again." }, { status: 502 });
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) return NextResponse.json(data, { status: res.status });

    const response = NextResponse.json({ user: data.user });
    response.cookies.set(TOKEN_COOKIE, data.token, {
        httpOnly: true, // JavaScript in the browser cannot read this cookie
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: COOKIE_MAX_AGE,
    });
    return response;
}