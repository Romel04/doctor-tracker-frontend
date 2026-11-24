import { Button } from "@/components/ui/button";

const OPTIONS = [7, 30, 90];

export function RangeSelector({ value, onChange }: { value: number; onChange: (days: number) => void }) {
    return (
        <div role="group" aria-label="Time range" className="inline-flex gap-1 rounded-lg border bg-card p-1">
            {OPTIONS.map((days) => (
                <Button
                    key={days}
                    size="sm"
                    variant={value === days ? "default" : "ghost"}
                    aria-pressed={value === days}
                    onClick={() => onChange(days)}
                >
                    {days} days
                </Button>
            ))}
        </div>
    );
}