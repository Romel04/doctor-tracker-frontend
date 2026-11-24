"use client";

import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { CalendarDays, Stethoscope, UserPlus, Users } from "lucide-react";
import { ChartCard } from "@/components/dashboard/chart-card";
import {
    ConditionsChart,
    GenderChart,
    PatientsOverTimeChart,
    PatientsPerDoctorChart,
    SpecializationsChart,
} from "@/components/dashboard/charts";
import { RangeSelector } from "@/components/dashboard/range-selector";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { DashboardData } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
    const [days, setDays] = useState(30);

    const { data, isPending, isFetching, error, refetch } = useQuery({
        queryKey: ["dashboard", days],
        queryFn: () => api<DashboardData>("dashboard", { params: { days } }),
        placeholderData: keepPreviousData, // keep the old charts visible while a new range loads
    });

    const loading = isPending;
    const rangeLabel = `last ${days} days`;

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Dashboard</h1>
                    <p className="text-sm text-muted-foreground">An overview of doctors and patients.</p>
                </div>
                <RangeSelector value={days} onChange={setDays} />
            </div>

            {error && (
                <div className="flex flex-wrap items-center gap-3 rounded-lg border border-destructive/40 p-4">
                    <p className="text-sm text-destructive">{error.message}</p>
                    <Button variant="outline" size="sm" onClick={() => refetch()}>
                        Try again
                    </Button>
                </div>
            )}

            <div className={cn("space-y-6", isFetching && !isPending && "opacity-70")}>
                {/* Stat cards */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard title="Total doctors" value={data?.totals.doctors} hint="All time" icon={Stethoscope} />
                    <StatCard title="Total patients" value={data?.totals.patients} hint="All time" icon={Users} />
                    <StatCard
                        title="Patient visits"
                        value={data?.totals.patientsInRange}
                        hint={`In the ${rangeLabel}`}
                        icon={CalendarDays}
                    />
                    <StatCard
                        title="New doctors"
                        value={data?.totals.newDoctorsInRange}
                        hint={`Added in the ${rangeLabel}`}
                        icon={UserPlus}
                    />
                </div>

                {/* Charts */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <ChartCard
                        title="Patient visits over time"
                        description={`Visits per day, ${rangeLabel}`}
                        loading={loading}
                        isEmpty={data?.totals.patientsInRange === 0}
                        className="lg:col-span-2"
                    >
                        {data && <PatientsOverTimeChart data={data.patientsOverTime} />}
                    </ChartCard>

                    <ChartCard
                        title="Patients per doctor"
                        description="Top 10 doctors by number of patients (all time)"
                        loading={loading}
                        isEmpty={data?.patientsPerDoctor.length === 0}
                    >
                        {data && <PatientsPerDoctorChart data={data.patientsPerDoctor} />}
                    </ChartCard>

                    <ChartCard
                        title="Gender split"
                        description="Patients by gender (all time)"
                        loading={loading}
                        isEmpty={data?.gender.length === 0}
                    >
                        {data && <GenderChart data={data.gender} />}
                    </ChartCard>

                    <ChartCard
                        title="Top conditions"
                        description="Most common patient conditions (all time)"
                        loading={loading}
                        isEmpty={data?.conditions.length === 0}
                    >
                        {data && <ConditionsChart data={data.conditions} />}
                    </ChartCard>

                    <ChartCard
                        title="Doctors by specialization"
                        description="Number of doctors in each specialization"
                        loading={loading}
                        isEmpty={data?.specializations.length === 0}
                    >
                        {data && <SpecializationsChart data={data.specializations} />}
                    </ChartCard>
                </div>
            </div>
        </div>
    );
}