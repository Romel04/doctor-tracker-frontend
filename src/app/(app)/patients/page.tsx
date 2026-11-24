"use client";

import { useState } from "react";
import Link from "next/link";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Pencil, Search, Trash2 } from "lucide-react";
import { NativeSelect } from "@/components/native-select";
import { DeletePatientDialog } from "@/components/patients/delete-patient-dialog";
import { EditPatientDialog } from "@/components/patients/edit-patient-dialog";
import { PaginationControls } from "@/components/pagination-controls";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDebounce } from "@/hooks/use-debounce";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { Doctor, Paginated, Patient } from "@/lib/types";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

export default function PatientsPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [condition, setCondition] = useState("");
    const [gender, setGender] = useState("");
    const [doctor, setDoctor] = useState("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [patientToEdit, setPatientToEdit] = useState<Patient | null>(null);
    const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);

    const debouncedSearch = useDebounce(search);
    const params = { page, limit: PAGE_SIZE, search: debouncedSearch.trim(), condition, gender, doctor, from, to };

    const { data, isPending, isFetching, error } = useQuery({
        queryKey: ["patients", params],
        queryFn: () => api<Paginated<Patient>>("patients", { params }),
        placeholderData: keepPreviousData,
    });

    const { data: conditionOptions } = useQuery({
        queryKey: ["patient-conditions"],
        queryFn: () => api<{ conditions: string[] }>("patients/conditions"),
        select: (res) => res.conditions,
        staleTime: 5 * 60_000,
    });

    // Doctors for the filter dropdown. The key starts with "doctors", so adding a doctor refreshes it.
    const { data: doctorOptions } = useQuery({
        queryKey: ["doctors", "options"],
        queryFn: () => api<Paginated<Doctor>>("doctors", { params: { limit: 100 } }),
        select: (res) => [...res.data].sort((a, b) => a.name.localeCompare(b.name)),
        staleTime: 5 * 60_000,
    });

    const hasFilters = Boolean(search || condition || gender || doctor || from || to);

    // Any filter change goes back to page 1
    const onFilterChange =
        (setter: (value: string) => void) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            setter(e.target.value);
            setPage(1);
        };

    function clearFilters() {
        setSearch("");
        setCondition("");
        setGender("");
        setDoctor("");
        setFrom("");
        setTo("");
        setPage(1);
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Patients</h1>
                <p className="text-sm text-muted-foreground">
                    All patients across doctors. To add a patient, open a doctor from the Doctors page.
                </p>
            </div>

            <Card>
                <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                        <Input
                            aria-label="Search patients"
                            placeholder="Search whole words..."
                            className="pl-9"
                            value={search}
                            onChange={onFilterChange(setSearch)}
                        />
                    </div>
                    <NativeSelect aria-label="Filter by condition" value={condition} onChange={onFilterChange(setCondition)}>
                        <option value="">All conditions</option>
                        {conditionOptions?.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </NativeSelect>
                    <NativeSelect aria-label="Filter by doctor" value={doctor} onChange={onFilterChange(setDoctor)}>
                        <option value="">All doctors</option>
                        {doctorOptions?.map((d) => (
                            <option key={d._id} value={d._id}>
                                {d.name}
                            </option>
                        ))}
                    </NativeSelect>
                    <NativeSelect aria-label="Filter by gender" value={gender} onChange={onFilterChange(setGender)}>
                        <option value="">All genders</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </NativeSelect>
                    <Input aria-label="Visited from" type="date" value={from} onChange={onFilterChange(setFrom)} />
                    <Input aria-label="Visited to" type="date" value={to} onChange={onFilterChange(setTo)} />
                    {hasFilters && (
                        <div className="sm:col-span-2 lg:col-span-3">
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
                            <TableHead className="hidden lg:table-cell">Doctor</TableHead>
                            <TableHead className="hidden md:table-cell">Visit date</TableHead>
                            <TableHead className="w-24" />
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
                                    {hasFilters ? "No patients match your filters." : "No patients yet."}
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
                                    <div className="text-xs text-muted-foreground">{patient.phone}</div>
                                </TableCell>
                                <TableCell className="hidden capitalize sm:table-cell">
                                    {patient.age} &middot; {patient.gender}
                                </TableCell>
                                <TableCell className="hidden md:table-cell">{patient.condition}</TableCell>
                                <TableCell className="hidden lg:table-cell">
                                    {typeof patient.doctor === "object" ? (
                                        <Link href={`/doctors/${patient.doctor._id}`} className="hover:underline">
                                            <div>{patient.doctor.name}</div>
                                            <div className="text-xs text-muted-foreground">{patient.doctor.specialization}</div>
                                        </Link>
                                    ) : (
                                        "-"
                                    )}
                                </TableCell>
                                <TableCell className="hidden md:table-cell">{formatDate(patient.visitDate)}</TableCell>
                                <TableCell>
                                    <div className="flex justify-end">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label={`Edit ${patient.name}`}
                                            onClick={() => setPatientToEdit(patient)}
                                        >
                                            <Pencil className="size-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label={`Delete ${patient.name}`}
                                            onClick={() => setPatientToDelete(patient)}
                                        >
                                            <Trash2 className="size-4 text-destructive" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {data && data.pagination.total > 0 && (
                    <PaginationControls pagination={data.pagination} onPageChange={setPage} disabled={isFetching} />
                )}
            </div>

            <EditPatientDialog patient={patientToEdit} onClose={() => setPatientToEdit(null)} />
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