"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function LogoutButton({ className }: { className?: string }) {
    const router = useRouter();

    async function logout() {
        await fetch("/api/auth/logout", { method: "POST" });
        router.replace("/login");
        router.refresh();
    }

    return (
        <Button variant="outline" className={className} onClick={logout}>
            <LogOut className="size-4" />
            Log out
        </Button>
    );
}