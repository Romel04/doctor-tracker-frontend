"use client";

import { memo, useMemo } from "react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    LabelList,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { axisTick, CHART_COLORS, tooltipProps } from "@/lib/chart-theme";
import type { DashboardData } from "@/lib/types";

const truncate = (text: string, max = 18) => (text.length > max ? `${text.slice(0, max - 1)}…` : text);
const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

// --- Generic horizontal bar chart, used by three charts below ------------------------------
type BarDatum = { label: string; value: number };

const HorizontalBars = memo(function HorizontalBars({
    data,
    color,
    valueLabel,
}: {
    data: BarDatum[];
    color: string;
    valueLabel: string;
}) {
    return (
        // Height grows with the number of bars so labels never get squashed
        <div className="w-full" style={{ height: Math.max(200, data.length * 36 + 24) }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ top: 0, right: 36, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} tick={axisTick} tickLine={false} axisLine={false} />
                    <YAxis
                        type="category"
                        dataKey="label"
                        width={130}
                        tick={axisTick}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => truncate(String(value))}
                    />
                    <Tooltip {...tooltipProps} cursor={{ fill: "var(--muted)" }} />
                    <Bar dataKey="value" name={valueLabel} fill={color} radius={[0, 4, 4, 0]} barSize={18}>
                        <LabelList dataKey="value" position="right" fill="var(--muted-foreground)" fontSize={12} />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
});

// Pine bars count patients, steel-blue bars count doctors, so the color tells you what is being counted.
export const PatientsPerDoctorChart = memo(function PatientsPerDoctorChart({
    data,
}: {
    data: DashboardData["patientsPerDoctor"];
}) {
    const bars = useMemo(() => data.map((d) => ({ label: d.name, value: d.patients })), [data]);
    return <HorizontalBars data={bars} color={CHART_COLORS[0]} valueLabel="Patients" />;
});

export const ConditionsChart = memo(function ConditionsChart({ data }: { data: DashboardData["conditions"] }) {
    const bars = useMemo(() => data.map((d) => ({ label: d.condition, value: d.count })), [data]);
    return <HorizontalBars data={bars} color={CHART_COLORS[0]} valueLabel="Patients" />;
});

export const SpecializationsChart = memo(function SpecializationsChart({
    data,
}: {
    data: DashboardData["specializations"];
}) {
    const bars = useMemo(() => data.map((d) => ({ label: d.specialization, value: d.count })), [data]);
    return <HorizontalBars data={bars} color={CHART_COLORS[3]} valueLabel="Doctors" />;
});

// --- Gender split (donut chart) ------------------------------------------------------------
export const GenderChart = memo(function GenderChart({ data }: { data: DashboardData["gender"] }) {
    // Each slice carries its own color in `fill`, which Recharts reads automatically
    const slices = useMemo(
        () =>
            data.map((d, i) => ({
                name: capitalize(d.gender),
                value: d.count,
                fill: CHART_COLORS[i % CHART_COLORS.length],
            })),
        [data]
    );

    return (
        <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={slices}
                        dataKey="value"
                        nameKey="name"
                        innerRadius="55%"
                        outerRadius="80%"
                        paddingAngle={2}
                        stroke="var(--card)"
                    />
                    <Tooltip {...tooltipProps} />
                    <Legend
                        verticalAlign="bottom"
                        iconType="circle"
                        formatter={(value, entry) => (
                            <span className="text-sm text-foreground">
                                {value}: {(entry.payload as { value?: number } | undefined)?.value ?? 0}
                            </span>
                        )}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
});