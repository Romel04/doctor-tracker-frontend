"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

type DashboardResponse = { totals: { doctors: number; patients: number } };

export default function DashboardPage() {
    const { data, isPending, error } = useQuery({
        queryKey: ["dashboard"],
        queryFn: () => api<DashboardResponse>("dashboard"),
    });

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-semibold">Dashboard (temporary)</h1>
            {isPending && <p>Loading...</p>}
            {error && <p className="text-destructive">{error.message}</p>}
            {data && (
                <p>
                    Doctors: {data.totals.doctors} | Patients: {data.totals.patients}
                </p>
            )}
        </div>
    );
}