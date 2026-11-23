import { NextRequest, NextResponse } from "next/server";
import { BACKEND_API_URL, TOKEN_COOKIE } from "@/lib/config";

async function handler(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const token = request.cookies.get(TOKEN_COOKIE)?.value;
    if (!token) {
        return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const { path } = await params;
    const url = `${BACKEND_API_URL}/${path.join("/")}${request.nextUrl.search}`;

    const raw = ["GET", "HEAD"].includes(request.method) ? "" : await request.text();
    const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
    if (raw) headers["Content-Type"] = "application/json";

    let res: Response;
    try {
        res = await fetch(url, { method: request.method, headers, body: raw || undefined, cache: "no-store" });
    } catch {
        return NextResponse.json({ message: "Cannot reach the server. Please try again." }, { status: 502 });
    }

    const response = new NextResponse(await res.text(), {
        status: res.status,
        headers: { "Content-Type": res.headers.get("content-type") ?? "application/json" },
    });
    if (res.status === 401) response.cookies.delete(TOKEN_COOKIE); // token expired or invalid
    return response;
}

export { handler as GET, handler as POST, handler as PATCH, handler as DELETE };