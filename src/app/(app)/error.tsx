"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

// Next.js shows this if something throws while rendering a page inside the app shell.
// The sidebar stays visible, and the user can retry without a full reload.
export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-start gap-3 py-10">
            <h1 className="text-xl font-semibold">Something went wrong</h1>
            <p className="text-sm text-muted-foreground">An unexpected error occurred while loading this page.</p>
            <Button onClick={reset}>Try again</Button>
        </div>
    );
}