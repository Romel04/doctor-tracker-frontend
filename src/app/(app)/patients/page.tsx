"use client";

import { useState } from "react";
import Link from "next/link";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Pencil, Search, Trash2 } from "lucide-react";
import { DateRangeFilter } from "@/components/date-range-filter";
import { FilterField } from "@/components/filter-field";
import { InitialsAvatar } from "@/components/initials-avatar";
import { NativeSelect } from "@/components/native-select";
import { PageHeader } from "@/components/page-header";
import { DeletePatientDialog } from "@/components/patients/delete-patient-dialog";
import { EditPatientDialog } from "@/components/patients/edit-patient-dialog";
import { PaginationControls } from "@/components/pagination-controls";
import { TableEmpty } from "@/components/table-empty";
import { TableFrame } from "@/components/table-frame";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDebounce } from "@/hooks/use-debounce";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { Doctor, Paginated, Patient } from "@/lib/types";

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
    const onValueChange = (setter: (value: string) => void) => (value: string) => {
        setter(value);
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
            <PageHeader
                title="Patients"
                description="All patients across doctors. To add a patient, open a doctor from the Doctors page."
            />

            <Card>
                <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                        <FilterField label="Search">
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                                <Input
                                    placeholder="Name or condition"
                                    className="pl-9"
                                    value={search}
                                    onChange={onFilterChange(setSearch)}
                                />
                            </div>
                        </FilterField>
                        <p className="text-xs text-muted-foreground">
                            Search matches whole words, for example &ldquo;diabetes&rdquo; but not &ldquo;diab&rdquo;.
                        </p>
                    </div>

                    <div className="grid items-end gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <FilterField label="Condition">
                            <NativeSelect value={condition} onChange={onFilterChange(setCondition)}>
                                <option value="">All conditions</option>
                                {conditionOptions?.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </NativeSelect>
                        </FilterField>
                        <FilterField label="Doctor">
                            <NativeSelect value={doctor} onChange={onFilterChange(setDoctor)}>
                                <option value="">All doctors</option>
                                {doctorOptions?.map((d) => (
                                    <option key={d._id} value={d._id}>
                                        {d.name}
                                    </option>
                                ))}
                            </NativeSelect>
                        </FilterField>
                        <FilterField label="Gender">
                            <NativeSelect value={gender} onChange={onFilterChange(setGender)}>
                                <option value="">All genders</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </NativeSelect>
                        </FilterField>
                        <DateRangeFilter
                            label="Visited between"
                            from={from}
                            to={to}
                            onFromChange={onValueChange(setFrom)}
                            onToChange={onValueChange(setTo)}
                            className="sm:col-span-2 lg:col-span-4"
                        />
                    </div>

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
                            <TableEmpty
                                colSpan={6}
                                title={hasFilters ? "No patients match your filters." : "No patients yet. Open a doctor to add the first one."}
                                action={
                                    hasFilters ? (
                                        <Button variant="outline" size="sm" onClick={clearFilters}>
                                            Clear filters
                                        </Button>
                                    ) : (
                                        <Link
                                            href="/doctors"
                                            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                                        >
                                            Go to doctors
                                        </Link>
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
                                            <div className="text-xs tabular-nums text-muted-foreground">{patient.phone}</div>
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
            </TableFrame>

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