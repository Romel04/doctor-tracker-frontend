"use client";

import { memo, useMemo } from "react";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { axisTick, CHART_COLORS, longDate, shortDate, tooltipProps } from "@/lib/chart-theme";
import type { DashboardData } from "@/lib/types";

const truncate = (text: string, max = 18) => (text.length > max ? `${text.slice(0, max - 1)}…` : text);
const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

// --- Patients per day (area chart) ---------------------------------------------------------
export const PatientsOverTimeChart = memo(function PatientsOverTimeChart({
    data,
}: {
    data: DashboardData["patientsOverTime"];
}) {
    return (
        <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="patientsFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={CHART_COLORS[0]} stopOpacity={0.35} />
                            <stop offset="100%" stopColor={CHART_COLORS[0]} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis
                        dataKey="date"
                        tickFormatter={shortDate}
                        tick={axisTick}
                        tickLine={false}
                        axisLine={false}
                        minTickGap={24}
                    />
                    <YAxis allowDecimals={false} tick={axisTick} tickLine={false} axisLine={false} width={32} />
                    <Tooltip {...tooltipProps} labelFormatter={(label) => longDate(String(label))} />
                    <Area
                        type="monotone"
                        dataKey="count"
                        name="Patients"
                        stroke={CHART_COLORS[0]}
                        strokeWidth={2}
                        fill="url(#patientsFill)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
});

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
                <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
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
                    <Bar dataKey="value" name={valueLabel} fill={color} radius={[0, 4, 4, 0]} barSize={18} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
});

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
    return <HorizontalBars data={bars} color={CHART_COLORS[1]} valueLabel="Patients" />;
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
                        formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
});