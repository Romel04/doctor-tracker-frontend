import { Skeleton } from "@/components/ui/skeleton";

type StatItem = {
    title: string;
    value: number | undefined; // undefined means still loading
    hint: string;
};

// One bordered strip with dividers instead of separate cards: the three numbers read as a set.
export function StatStrip({ items }: { items: StatItem[] }) {
    return (
        <dl className="grid divide-y rounded-xl bg-card ring-1 ring-foreground/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {items.map(({ title, value, hint }) => (
                <div key={title} className="space-y-1 p-5">
                    <dt className="text-sm text-muted-foreground">{title}</dt>
                    <dd>
                        {value === undefined ? (
                            <Skeleton className="h-9 w-20" />
                        ) : (
                            <span className="font-heading text-3xl font-semibold tabular-nums">
                                {value.toLocaleString()}
                            </span>
                        )}
                    </dd>
                    <dd className="text-xs text-muted-foreground">{hint}</dd>
                </div>
            ))}
        </dl>
    );
}