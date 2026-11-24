"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Plus, Search, Trash2 } from "lucide-react";
import { FilterField } from "@/components/filter-field";
import { InitialsAvatar } from "@/components/initials-avatar";
import { NativeSelect } from "@/components/native-select";
import { AddPatientDialog } from "@/components/patients/add-patient-dialog";
import { DeletePatientDialog } from "@/components/patients/delete-patient-dialog";
import { PaginationControls } from "@/components/pagination-controls";
import { TableEmpty } from "@/components/table-empty";
import { TableFrame } from "@/components/table-frame";
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
                        <div className="space-y-5">
                            <div className="flex items-center gap-4">
                                <InitialsAvatar name={doctor.name} className="size-14 text-lg" />
                                <div>
                                    <h1 className="font-heading text-2xl font-semibold tracking-tight">{doctor.name}</h1>
                                    <p className="text-sm text-muted-foreground">
                                        {doctor.specialization} at {doctor.hospital}
                                    </p>
                                </div>
                            </div>
                            <dl className="grid gap-4 border-t pt-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                                <div>
                                    <dt className="text-muted-foreground">Email</dt>
                                    <dd className="break-all">{doctor.email}</dd>
                                </div>
                                <div>
                                    <dt className="text-muted-foreground">Phone</dt>
                                    <dd className="tabular-nums">{doctor.phone}</dd>
                                </div>
                                <div>
                                    <dt className="text-muted-foreground">Patients</dt>
                                    <dd>
                                        <Badge variant="secondary" className="tabular-nums">
                                            {doctor.patientCount ?? 0}
                                        </Badge>
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
                <h2 className="font-heading text-xl font-semibold tracking-tight">Patients</h2>
                <Button onClick={() => setAddOpen(true)}>
                    <Plus className="size-4" />
                    Add patient
                </Button>
            </div>

            <Card>
                <CardContent className="space-y-4">
                    <div className="grid items-end gap-4 sm:grid-cols-2">
                        <FilterField label="Search">
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                                <Input
                                    placeholder="Name or condition"
                                    className="pl-9"
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setPage(1);
                                    }}
                                />
                            </div>
                        </FilterField>
                        <FilterField label="Condition">
                            <NativeSelect
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
                        </FilterField>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Search matches whole words, for example &ldquo;diabetes&rdquo; but not &ldquo;diab&rdquo;.
                    </p>
                    {hasFilters && (
                        <Button variant="ghost" size="sm" onClick={clearFilters}>
                            Clear filters
                        </Button>
                    )}
                </CardContent>
            </Card>

            {error && <p className="text-sm text-destructive">{error.message}</p>}

            <TableFrame dimmed={isFetching && !isPending}>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead className="hidden sm:table-cell">Age and gender</TableHead>
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
                            <TableEmpty
                                colSpan={6}
                                title={hasFilters ? "No patients match your filters." : "No patients yet. Add the first one."}
                                action={
                                    hasFilters ? (
                                        <Button variant="outline" size="sm" onClick={clearFilters}>
                                            Clear filters
                                        </Button>
                                    ) : (
                                        <Button size="sm" onClick={() => setAddOpen(true)}>
                                            <Plus className="size-4" />
                                            Add patient
                                        </Button>
                                    )
                                }
                            />
                        )}

                        {data?.data.map((patient) => (
                            <TableRow key={patient._id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <InitialsAvatar name={patient.name} />
                                        <div className="min-w-0">
                                            <div className="font-medium">{patient.name}</div>
                                            <div className="text-xs text-muted-foreground md:hidden">
                                                {patient.condition}, {formatDate(patient.visitDate)}
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="hidden capitalize sm:table-cell">
                                    {patient.age} yrs, {patient.gender}
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                    <Badge variant="secondary" className="font-normal">
                                        {patient.condition}
                                    </Badge>
                                </TableCell>
                                <TableCell className="hidden tabular-nums lg:table-cell">{patient.phone}</TableCell>
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
            </TableFrame>

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