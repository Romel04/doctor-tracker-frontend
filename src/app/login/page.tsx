"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const loginSchema = z.object({
    email: z.string().min(1, "Email is required").email("Enter a valid email"),
    password: z.string().min(1, "Password is required"),
});
type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

    async function onSubmit(values: LoginValues) {
        setSubmitting(true);
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });
            const data = await res.json().catch(() => null);
            if (!res.ok) {
                toast.error(data?.message ?? "Login failed");
                return;
            }
            router.replace("/dashboard");
            router.refresh();
        } catch {
            toast.error("Network error. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
            {/* Brand panel (desktop only) */}
            <section className="relative hidden flex-col justify-between overflow-hidden bg-sidebar p-12 text-sidebar-foreground lg:flex">
                <span className="flex items-center gap-2.5 font-heading text-lg font-semibold tracking-tight">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                        <Stethoscope className="size-4" />
                    </span>
                    Doctor Tracker
                </span>

                <div className="space-y-6">
                    <svg viewBox="0 0 600 120" className="w-full max-w-xl" fill="none" aria-hidden>
                        <path
                            className="trace-draw"
                            pathLength={1}
                            d="M0 70 H120 L140 70 L155 30 L172 100 L188 48 L200 70 H330 L346 70 L360 22 L378 104 L394 50 L406 70 H600"
                            stroke="var(--sidebar-primary)"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    <h1 className="max-w-md font-heading text-4xl font-semibold leading-tight tracking-tight text-white">
                        Every doctor, patient and visit in one place.
                    </h1>
                </div>

                <p className="text-sm text-sidebar-foreground/70">Admin access only.</p>
            </section>

            {/* Form */}
            <section className="flex items-center justify-center bg-background p-6">
                <div className="w-full max-w-sm space-y-8">
                    <div className="space-y-2">
                        <span className="flex items-center gap-2.5 font-heading text-lg font-semibold tracking-tight lg:hidden">
                            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                <Stethoscope className="size-4" />
                            </span>
                            Doctor Tracker
                        </span>
                        <h2 className="font-heading text-2xl font-semibold tracking-tight">Sign in</h2>
                        <p className="text-sm text-muted-foreground">Use your admin email and password.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" autoComplete="email" {...register("email")} />
                            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
                            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                        </div>
                        <Button type="submit" className="w-full" disabled={submitting}>
                            {submitting ? "Signing in..." : "Sign in"}
                        </Button>
                        {submitting && (
                            <p className="text-center text-xs text-muted-foreground">
                                The server may take a moment to wake up on the first sign-in.
                            </p>
                        )}
                    </form>
                </div>
            </section>
        </main>
    );
}