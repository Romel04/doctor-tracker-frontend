import { cn } from "@/lib/utils";

// A visible label above a filter control. Wrapping the control in <label> connects the two for screen readers.
export function FilterField({
    label,
    className,
    children,
}: {
    label: string;
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <label className={cn("block space-y-1.5", className)}>
            <span className="text-sm font-medium">{label}</span>
            {children}
        </label>
    );
}