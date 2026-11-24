"use client";

import { useId } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// Two date inputs with a title that says what the dates are for.
// `min` / `max` stop the user from picking an end date before the start date.
export function DateRangeFilter({
    label,
    from,
    to,
    onFromChange,
    onToChange,
    className,
}: {
    label: string;
    from: string;
    to: string;
    onFromChange: (value: string) => void;
    onToChange: (value: string) => void;
    className?: string;
}) {
    const id = useId();

    return (
        <div role="group" aria-label={label} className={cn("space-y-2", className)}>
            {label && <p className="text-sm font-medium">{label}</p>}
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <Label htmlFor={`${id}-from`} className="text-xs font-normal text-muted-foreground">
                        From
                    </Label>
                    <Input
                        id={`${id}-from`}
                        type="date"
                        value={from}
                        max={to || undefined}
                        onChange={(e) => onFromChange(e.target.value)}
                    />
                </div>
                <div className="space-y-1">
                    <Label htmlFor={`${id}-to`} className="text-xs font-normal text-muted-foreground">
                        To
                    </Label>
                    <Input
                        id={`${id}-to`}
                        type="date"
                        value={to}
                        min={from || undefined}
                        onChange={(e) => onToChange(e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
}