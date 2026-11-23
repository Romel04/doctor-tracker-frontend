import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { TOKEN_COOKIE } from "@/lib/config";

// This layout checks the login cookie on every request, so it can't be prerendered.
// This line tells Next.js that is intentional.
export const instant = false;

export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies();
    if (!cookieStore.has(TOKEN_COOKIE)) {
        redirect("/login");
    }

    return <AppShell>{children}</AppShell>;
}