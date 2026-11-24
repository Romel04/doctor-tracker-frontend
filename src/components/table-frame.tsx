import { cn } from "@/lib/utils";

// The frame around every data table. Header styling lives here once, so all three tables match.
export function TableFrame({ dimmed, children }: { dimmed?: boolean; children: React.ReactNode }) {
    return (
        <div
            className={cn(
                "overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10",
                "[&_thead]:bg-muted/40 [&_thead_th]:h-10 [&_thead_th]:text-xs [&_thead_th]:font-medium [&_thead_th]:text-muted-foreground",
                dimmed && "opacity-70"
            )}
        >
            {children}
        </div>
    );
}