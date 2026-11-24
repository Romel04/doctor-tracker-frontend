import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// The frame around every chart: title, description, and the loading / empty states.
export function ChartCard({
    title,
    description,
    loading,
    isEmpty,
    className,
    children,
}: {
    title: string;
    description: string;
    loading: boolean;
    isEmpty: boolean;
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <Card className={cn(className)}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <Skeleton className="h-64 w-full" />
                ) : isEmpty ? (
                    <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                        No data for this period.
                    </div>
                ) : (
                    children
                )}
            </CardContent>
        </Card>
    );
}