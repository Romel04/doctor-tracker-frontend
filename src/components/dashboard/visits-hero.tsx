"use client";

import { memo, useMemo, useSyncExternalStore } from "react";
import { CartesianGrid, Line, LineChart, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { longDate, shortDate } from "@/lib/chart-theme";
import type { DashboardData } from "@/lib/types";

// Recharts animates the line by default; skip that for people who asked their OS for less motion.
function usePrefersReducedMotion() {
    return useSyncExternalStore(
        (onChange) => {
            const query = window.matchMedia("(prefers-reduced-motion: reduce)");
            query.addEventListener("change", onChange);
            return () => query.removeEventListener("change", onChange);
        },
        () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        () => false
    );
}

// Colors come from the sidebar tokens, so this panel matches the sidebar and the login screen.
const axisTick = { fill: "var(--sidebar-foreground)", fontSize: 12, opacity: 0.75 };
const PEAK_COLOR = "#e0662f";

const Trace = memo(function Trace({ data, peakDate }: { data: DashboardData["patientsOverTime"]; peakDate: string }) {
    const reducedMotion = usePrefersReducedMotion();
    const peak = data.find((d) => d.date === peakDate);

    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--sidebar-border)" vertical={false} />
                <XAxis
                    dataKey="date"
                    tickFormatter={shortDate}
                    tick={axisTick}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={28}
                />
                <YAxis allowDecimals={false} tick={axisTick} tickLine={false} axisLine={false} width={28} />
                <Tooltip
                    cursor={{ stroke: "var(--sidebar-border)" }}
                    labelFormatter={(label) => longDate(String(label))}
                    contentStyle={{
                        backgroundColor: "var(--sidebar)",
                        border: "1px solid var(--sidebar-border)",
                        borderRadius: 8,
                        fontSize: 12,
                    }}
                    labelStyle={{ color: "#ffffff" }}
                    itemStyle={{ color: "var(--sidebar-foreground)" }}
                />
                {/* Straight segments, like a monitor trace. Smoothing would invent values between days. */}
                <Line
                    type="linear"
                    dataKey="count"
                    name="Visits"
                    stroke="var(--sidebar-primary)"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5, fill: "var(--sidebar-primary)", stroke: "var(--sidebar)", strokeWidth: 2 }}
                    isAnimationActive={!reducedMotion}
                    animationDuration={1400}
                />
                {peak && (
                    <ReferenceDot x={peak.date} y={peak.count} r={5} fill={PEAK_COLOR} stroke="var(--sidebar)" strokeWidth={2} />
                )}
            </LineChart>
        </ResponsiveContainer>
    );
});

export function VisitsHero({
    data,
    total,
    days,
    loading,
}: {
    data: DashboardData["patientsOverTime"] | undefined;
    total: number | undefined;
    days: number;
    loading: boolean;
}) {
    const peak = useMemo(() => {
        if (!data?.length) return undefined;
        return data.reduce((best, d) => (d.count > best.count ? d : best), data[0]);
    }, [data]);

    const isEmpty = total === 0;
    const average = total !== undefined ? (total / days).toFixed(1) : undefined;

    return (
        <section className="overflow-hidden rounded-xl bg-sidebar text-sidebar-foreground">
            <div className="flex flex-wrap items-end justify-between gap-6 p-6 pb-2">
                <div>
                    <h2 className="text-sm text-sidebar-foreground/80">Patient visits</h2>
                    {loading || total === undefined ? (
                        <Skeleton className="mt-2 h-12 w-32 bg-white/10" />
                    ) : (
                        <p className="font-heading text-5xl font-semibold tabular-nums text-white">
                            {total.toLocaleString()}
                        </p>
                    )}
                    <p className="mt-1 text-sm text-sidebar-foreground/80">in the last {days} days</p>
                </div>

                {peak && !isEmpty && (
                    <dl className="flex gap-8 text-sm">
                        <div>
                            <dt className="text-sidebar-foreground/80">Daily average</dt>
                            <dd className="font-heading text-xl font-semibold tabular-nums text-white">{average}</dd>
                        </div>
                        <div>
                            <dt className="text-sidebar-foreground/80">Busiest day</dt>
                            <dd className="font-heading text-xl font-semibold tabular-nums text-white">
                                {peak.count} {peak.count === 1 ? "visit" : "visits"}
                                <span className="ml-2 font-sans text-sm font-normal text-sidebar-foreground/80">
                                    {shortDate(peak.date)}
                                </span>
                            </dd>
                        </div>
                    </dl>
                )}
            </div>

            <div className="h-64 px-2 pb-4 pt-2 sm:px-4">
                {loading ? (
                    <Skeleton className="h-full w-full bg-white/10" />
                ) : isEmpty || !data || !peak ? (
                    <div className="flex h-full items-center justify-center text-sm text-sidebar-foreground/80">
                        No visits in this period. Add a patient to a doctor to see them here.
                    </div>
                ) : (
                    <Trace data={data} peakDate={peak.date} />
                )}
            </div>
        </section>
    );
}