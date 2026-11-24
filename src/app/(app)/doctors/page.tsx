"use client";

import { useState } from "react";
import Link from "next/link";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { DateRangeFilter } from "@/components/date-range-filter";
import { CreateDoctorDialog } from "@/components/doctors/create-doctor-dialog";
import { FilterField } from "@/components/filter-field";
import { InitialsAvatar } from "@/components/initials-avatar";
import { NativeSelect } from "@/components/native-select";
import { PageHeader } from "@/components/page-header";
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
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { Doctor, Paginated } from "@/lib/types";

const PAGE_SIZE = 10;

export default function DoctorsPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [specialization, setSpecialization] = useState("");
    const [hospital, setHospital] = useState("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [createOpen, setCreateOpen] = useState(false);

    const debouncedSearch = useDebounce(search);
    const params = { page, limit: PAGE_SIZE, search: debouncedSearch.trim(), specialization, hospital, from, to };

    const { data, isPending, isFetching, error } = useQuery({
        queryKey: ["doctors", params],
        queryFn: () => api<Paginated<Doctor>>("doctors", { params }),
        placeholderData: keepPreviousData, // keep showing the old page while the new one loads
    });

    const { data: filterOptions } = useQuery({
        queryKey: ["doctor-filters"],
        queryFn: () => api<{ specializations: string[]; hospitals: string[] }>("doctors/filters"),
        staleTime: 5 * 60_000,
    });

    const hasFilters = Boolean(search || specialization || hospital || from || to);

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
        setSpecialization("");
        setHospital("");
        setFrom("");
        setTo("");
        setPage(1);
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Doctors"
                description="Manage doctors and see their patients."
                action={
                    <Button onClick={() => setCreateOpen(true)}>
                        <Plus className="size-4" />
                        Add doctor
                    </Button>
                }
            />

            <Card>
                <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                        <FilterField label="Search">
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                                <Input
                                    placeholder="Name, specialization or hospital"
                                    className="pl-9"
                                    value={search}
                                    onChange={onFilterChange(setSearch)}
                                />
                            </div>
                        </FilterField>
                        <p className="text-xs text-muted-foreground">
                            Search matches whole words, for example &ldquo;cardiology&rdquo; but not &ldquo;cardio&rdquo;.
                        </p>
                    </div>

                    <div className="grid items-end gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <FilterField label="Specialization">
                            <NativeSelect value={specialization} onChange={onFilterChange(setSpecialization)}>
                                <option value="">All specializations</option>
                                {filterOptions?.specializations.map((s) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </NativeSelect>
                        </FilterField>
                        <FilterField label="Hospital">
                            <NativeSelect value={hospital} onChange={onFilterChange(setHospital)}>
                                <option value="">All hospitals</option>
                                {filterOptions?.hospitals.map((h) => (
                                    <option key={h} value={h}>
                                        {h}
                                    </option>
                                ))}
                            </NativeSelect>
                        </FilterField>
                        <DateRangeFilter
                            label=""
                            from={from}
                            to={to}
                            onFromChange={onValueChange(setFrom)}
                            onToChange={onValueChange(setTo)}
                            className="sm:col-span-2"
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
                            <TableHead className="hidden lg:table-cell">Specialization</TableHead>
                            <TableHead className="hidden lg:table-cell">Hospital</TableHead>
                            <TableHead className="hidden xl:table-cell">Contact</TableHead>
                            <TableHead className="text-right">Patients</TableHead>
                            <TableHead className="hidden md:table-cell">Added</TableHead>
                            <TableHead className="w-20" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isPending &&
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell colSpan={7}>
                                        <Skeleton className="h-6 w-full" />
                                    </TableCell>
                                </TableRow>
                            ))}

                        {data?.data.length === 0 && (
                            <TableEmpty
                                colSpan={7}
                                title={hasFilters ? "No doctors match your filters." : "No doctors yet. Add your first doctor to get started."}
                                action={
                                    hasFilters ? (
                                        <Button variant="outline" size="sm" onClick={clearFilters}>
                                            Clear filters
                                        </Button>
                                    ) : (
                                        <Button size="sm" onClick={() => setCreateOpen(true)}>
                                            <Plus className="size-4" />
                                            Add doctor
                                        </Button>
                                    )
                                }
                            />
                        )}

                        {data?.data.map((doctor) => (
                            <TableRow key={doctor._id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <InitialsAvatar name={doctor.name} />
                                        <div className="min-w-0">
                                            <Link href={`/doctors/${doctor._id}`} className="font-medium hover:underline">
                                                {doctor.name}
                                            </Link>
                                            <div className="text-xs text-muted-foreground lg:hidden">
                                                {doctor.specialization} at {doctor.hospital}
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="hidden lg:table-cell">{doctor.specialization}</TableCell>
                                <TableCell className="hidden lg:table-cell">{doctor.hospital}</TableCell>
                                <TableCell className="hidden xl:table-cell">
                                    <div className="tabular-nums">{doctor.phone}</div>
                                    <div className="text-xs text-muted-foreground">{doctor.email}</div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Badge variant="secondary" className="tabular-nums">
                                        {doctor.patientCount ?? 0}
                                    </Badge>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">{formatDate(doctor.createdAt)}</TableCell>
                                <TableCell>
                                    <Link href={`/doctors/${doctor._id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                                        View
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {data && <PaginationControls pagination={data.pagination} onPageChange={setPage} disabled={isFetching} />}
            </TableFrame>

            <CreateDoctorDialog open={createOpen} onOpenChange={setCreateOpen} />
        </div>
    );
}