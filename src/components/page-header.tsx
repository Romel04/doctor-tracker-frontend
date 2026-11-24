// Title, one line of context and an optional action (usually a button) on the right.
export function PageHeader({
    title,
    description,
    action,
}: {
    title: string;
    description: string;
    action?: React.ReactNode;
}) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
                <h1 className="font-heading text-2xl font-semibold tracking-tight">{title}</h1>
                <p className="max-w-prose text-sm text-muted-foreground">{description}</p>
            </div>
            {action}
        </div>
    );
}