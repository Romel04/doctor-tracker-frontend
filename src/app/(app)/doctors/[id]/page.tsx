"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Plus, Search, Trash2 } from "lucide-react";
import { NativeSelect } from "@/components/native-select";
import { AddPatientDialog } from "@/components/patients/add-patient-dialog";
import { DeletePatientDialog } from "@/components/patients/delete-patient-dialog";
import { PaginationControls } from "@/components/pagination-controls";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDebounce } from "@/hooks/use-debounce";
import { api, ApiError } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { Doctor, Paginated, Patient } from "@/lib/types";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

export default function DoctorDetailPage() {
    const { id } = useParams<{ id: string }>();

    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [condition, setCondition] = useState("");
    const [addOpen, setAddOpen] = useState(false);
    const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);

    const debouncedSearch = useDebounce(search);
    const params = { page, limit: PAGE_SIZE, search: debouncedSearch.trim(), condition };

    const doctorQuery = useQuery({
        queryKey: ["doctor", id],
        queryFn: () => api<{ doctor: Doctor }>(`doctors/${id}`),
        select: (res) => res.doctor,
    });

    const patientsQuery = useQuery({
        queryKey: ["doctor-patients", id, params],
        queryFn: () => api<Paginated<Patient>>(`doctors/${id}/patients`, { params }),
        placeholderData: keepPreviousData, // keep showing the old rows while the next page loads
    });

    const { data: conditionOptions } = useQuery({
        queryKey: ["patient-conditions"],
        queryFn: () => api<{ conditions: string[] }>("patients/conditions"),
        select: (res) => res.conditions,
        staleTime: 5 * 60_000,
    });

    const doctor = doctorQuery.data;
    const { data, isPending, isFetching, error } = patientsQuery;
    const hasFilters = Boolean(search || condition);

    function clearFilters() {
        setSearch("");
        setCondition("");
        setPage(1);
    }

    if (doctorQuery.error) {
        const notFound = doctorQuery.error instanceof ApiError && doctorQuery.error.status === 404;
        return (
            <div className="space-y-4">
                <Link href="/doctors" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                    <ArrowLeft className="size-4" />
                    Back to doctors
                </Link>
                <p className="text-sm text-destructive">
                    {notFound ? "Doctor not found." : doctorQuery.error.message}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Link href="/doctors" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                <ArrowLeft className="size-4" />
                Back to doctors
            </Link>

            {/* Doctor info */}
            <Card>
                <CardContent>
                    {!doctor ? (
                        <div className="space-y-3">
                            <Skeleton className="h-7 w-56" />
                            <Skeleton className="h-4 w-80" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <h1 className="text-2xl font-semibold">{doctor.name}</h1>
                                <p className="text-sm text-muted-foreground">
                                    {doctor.specialization} &middot; {doctor.hospital}
                                </p>
                            </div>
                            <dl className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                                <div>
                                    <dt className="text-muted-foreground">Email</dt>
                                    <dd className="break-all">{doctor.email}</dd>
                                </div>
                                <div>
                                    <dt className="text-muted-foreground">Phone</dt>
                                    <dd>{doctor.phone}</dd>
                                </div>
                                <div>
                                    <dt className="text-muted-foreground">Patients</dt>
                                    <dd>
                                        <Badge variant="secondary">{doctor.patientCount ?? 0}</Badge>
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-muted-foreground">Added</dt>
                                    <dd>{formatDate(doctor.createdAt)}</dd>
                                </div>
                            </dl>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Patients */}
            <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-semibold">Patients</h2>
                <Button onClick={() => setAddOpen(true)}>
                    <Plus className="size-4" />
                    Add patient
                </Button>
            </div>

            <Card>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                        <Input
                            aria-label="Search patients"
                            placeholder="Search whole words..."
                            className="pl-9"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                        />
                    </div>
                    <NativeSelect
                        aria-label="Filter by condition"
                        value={condition}
                        onChange={(e) => {
                            setCondition(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="">All conditions</option>
                        {conditionOptions?.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </NativeSelect>
                    {hasFilters && (
                        <div className="sm:col-span-2">
                            <Button variant="ghost" size="sm" onClick={clearFilters}>
                                Clear filters
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {error && <p className="text-sm text-destructive">{error.message}</p>}

            <div className={cn("rounded-lg border bg-card", isFetching && !isPending && "opacity-70")}>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead className="hidden sm:table-cell">Age / Gender</TableHead>
                            <TableHead className="hidden md:table-cell">Condition</TableHead>
                            <TableHead className="hidden lg:table-cell">Phone</TableHead>
                            <TableHead className="hidden md:table-cell">Visit date</TableHead>
                            <TableHead className="w-12" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isPending &&
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell colSpan={6}>
                                        <Skeleton className="h-6 w-full" />
                                    </TableCell>
                                </TableRow>
                            ))}

                        {data?.data.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                                    {hasFilters ? "No patients match your filters." : "No patients yet. Add the first one."}
                                </TableCell>
                            </TableRow>
                        )}

                        {data?.data.map((patient) => (
                            <TableRow key={patient._id}>
                                <TableCell>
                                    <div className="font-medium">{patient.name}</div>
                                    <div className="text-xs text-muted-foreground md:hidden">
                                        {patient.condition} &middot; {formatDate(patient.visitDate)}
                                    </div>
                                </TableCell>
                                <TableCell className="hidden capitalize sm:table-cell">
                                    {patient.age} &middot; {patient.gender}
                                </TableCell>
                                <TableCell className="hidden md:table-cell">{patient.condition}</TableCell>
                                <TableCell className="hidden lg:table-cell">{patient.phone}</TableCell>
                                <TableCell className="hidden md:table-cell">{formatDate(patient.visitDate)}</TableCell>
                                <TableCell>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label={`Delete ${patient.name}`}
                                        onClick={() => setPatientToDelete(patient)}
                                    >
                                        <Trash2 className="size-4 text-destructive" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {data && data.pagination.total > 0 && (
                    <PaginationControls pagination={data.pagination} onPageChange={setPage} disabled={isFetching} />
                )}
            </div>

            <AddPatientDialog doctorId={id} open={addOpen} onOpenChange={setAddOpen} />
            <DeletePatientDialog
                patient={patientToDelete}
                onClose={() => setPatientToDelete(null)}
                // If that was the last row on this page, go back one page so the table is not empty
                onDeleted={() => {
                    if (data?.data.length === 1 && page > 1) setPage(page - 1);
                }}
            />
        </div>
    );
}