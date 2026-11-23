"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Menu, Stethoscope, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/logout-button";
import { cn } from "@/lib/utils";

const NAV = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/doctors", label: "Doctors", icon: Stethoscope },
    { href: "/patients", label: "Patients", icon: Users },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
    const pathname = usePathname();

    return (
        <div className="flex h-full flex-col gap-6 p-4">
            <Link href="/dashboard" onClick={onNavigate} className="flex items-center gap-2 px-2 text-lg font-semibold">
                <Stethoscope className="size-5 text-primary" />
                Doctor Tracker
            </Link>

            <nav className="flex flex-1 flex-col gap-1">
                {NAV.map(({ href, label, icon: Icon }) => {
                    const active = pathname === href || pathname.startsWith(href + "/");
                    return (
                        <Link
                            key={href}
                            href={href}
                            onClick={onNavigate}
                            aria-current={active ? "page" : undefined}
                            className={cn(
                                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                active
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <Icon className="size-4" />
                            {label}
                        </Link>
                    );
                })}
            </nav>

            <LogoutButton className="w-full justify-start" />
        </div>
    );
}

export function AppShell({ children }: { children: React.ReactNode }) {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="min-h-screen md:flex">
            {/* Desktop sidebar */}
            <aside className="hidden w-60 shrink-0 border-r bg-card md:sticky md:top-0 md:block md:h-screen">
                <SidebarContent />
            </aside>

            {/* Mobile top bar */}
            <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-card px-4 md:hidden">
                <Button variant="outline" size="icon" aria-label="Open menu" onClick={() => setMobileOpen(true)}>
                    <Menu className="size-4" />
                </Button>
                <span className="font-semibold">Doctor Tracker</span>
            </header>

            {/* Mobile slide-over menu */}
            {mobileOpen && (
                <div className="fixed inset-0 z-40 md:hidden">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} aria-hidden />
                    <div className="absolute inset-y-0 left-0 w-64 bg-card shadow-lg">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-2"
                            aria-label="Close menu"
                            onClick={() => setMobileOpen(false)}
                        >
                            <X className="size-4" />
                        </Button>
                        <SidebarContent onNavigate={() => setMobileOpen(false)} />
                    </div>
                </div>
            )}

            <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
        </div>
    );
}