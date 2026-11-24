import { cn } from "@/lib/utils";

// "Dr. Anisur Rahman" -> "AR". The title is skipped so every doctor does not start with "D".
function getInitials(name: string) {
    const words = name
        .replace(/^(dr|prof)\.?\s+/i, "")
        .split(/\s+/)
        .filter(Boolean);
    const first = words[0]?.[0] ?? "?";
    const last = words.length > 1 ? words[words.length - 1][0] : "";
    return (first + last).toUpperCase();
}

// Gives each row a quick visual anchor. Decorative, because the name is always next to it.
export function InitialsAvatar({ name, className }: { name: string; className?: string }) {
    return (
        <span
            aria-hidden
            className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground",
                className
            )}
        >
            {getInitials(name)}
        </span>
    );
}