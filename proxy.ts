import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { TOKEN_COOKIE } from "@/lib/config";

export function proxy(request: NextRequest) {
    const hasToken = request.cookies.has(TOKEN_COOKIE);
    const isLoginPage = request.nextUrl.pathname === "/login";

    if (!hasToken && !isLoginPage) {
        return NextResponse.redirect(new URL("/login", request.url));
    }
    if (hasToken && isLoginPage) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
}

export const config = {
    // Run on pages only: skip API routes, Next.js internals and files with an extension (images etc.)
    matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};