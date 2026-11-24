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

function Brand() {
    return (
        <span className="flex items-center gap-2.5 font-heading text-lg font-semibold tracking-tight">
            <span className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Stethoscope className="size-4" />
            </span>
            Doctor Tracker
        </span>
    );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
    const pathname = usePathname();

    return (
        <div className="flex h-full flex-col gap-8 p-4">
            <Link href="/dashboard" onClick={onNavigate} className="px-2 pt-1">
                <Brand />
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
                                "relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                active
                                    ? "bg-sidebar-accent text-sidebar-accent-foreground before:absolute before:inset-y-1.5 before:left-0 before:w-0.5 before:rounded-full before:bg-sidebar-primary"
                                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                            )}
                        >
                            <Icon className="size-4" />
                            {label}
                        </Link>
                    );
                })}
            </nav>

            <LogoutButton className="w-full justify-start border-sidebar-border bg-transparent text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" />
        </div>
    );
}

export function AppShell({ children }: { children: React.ReactNode }) {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="min-h-screen md:flex">
            {/* Desktop sidebar */}
            <aside className="hidden w-60 shrink-0 bg-sidebar text-sidebar-foreground md:sticky md:top-0 md:block md:h-screen">
                <SidebarContent />
            </aside>

            {/* Mobile top bar */}
            <header className="sticky top-0 z-30 flex h-14 items-center gap-3 bg-sidebar px-4 text-sidebar-foreground md:hidden">
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Open menu"
                    className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    onClick={() => setMobileOpen(true)}
                >
                    <Menu className="size-4" />
                </Button>
                <Brand />
            </header>

            {/* Mobile slide-over menu */}
            {mobileOpen && (
                <div className="fixed inset-0 z-40 md:hidden">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} aria-hidden />
                    <div className="absolute inset-y-0 left-0 w-64 bg-sidebar text-sidebar-foreground shadow-lg">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
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