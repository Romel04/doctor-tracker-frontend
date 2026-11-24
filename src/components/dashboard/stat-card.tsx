import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function StatCard({
    title,
    value,
    hint,
    icon: Icon,
}: {
    title: string;
    value: number | undefined; // undefined means still loading
    hint: string;
    icon: LucideIcon;
}) {
    return (
        <Card>
            <CardContent className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{title}</p>
                    {value === undefined ? (
                        <Skeleton className="h-9 w-20" />
                    ) : (
                        <p className="text-3xl font-semibold tabular-nums">{value.toLocaleString()}</p>
                    )}
                    <p className="text-xs text-muted-foreground">{hint}</p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                    <Icon className="size-5 text-muted-foreground" />
                </div>
            </CardContent>
        </Card>
    );
}