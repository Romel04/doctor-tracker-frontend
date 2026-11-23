"use client";

import { useState } from "react";
import Link from "next/link";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { CreateDoctorDialog } from "@/components/doctors/create-doctor-dialog";
import { NativeSelect } from "@/components/native-select";
import { PaginationControls } from "@/components/pagination-controls";
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
import { cn } from "@/lib/utils";

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
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Doctors</h1>
                    <p className="text-sm text-muted-foreground">Manage doctors and see their patients.</p>
                </div>
                <Button onClick={() => setCreateOpen(true)}>
                    <Plus className="size-4" />
                    Add doctor
                </Button>
            </div>

            <Card>
                <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <div className="relative sm:col-span-2 lg:col-span-1">
                        <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                        <Input
                            aria-label="Search doctors"
                            placeholder="Search whole words..."
                            className="pl-9"
                            value={search}
                            onChange={onFilterChange(setSearch)}
                        />
                    </div>
                    <NativeSelect aria-label="Filter by specialization" value={specialization} onChange={onFilterChange(setSpecialization)}>
                        <option value="">All specializations</option>
                        {filterOptions?.specializations.map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </NativeSelect>
                    <NativeSelect aria-label="Filter by hospital" value={hospital} onChange={onFilterChange(setHospital)}>
                        <option value="">All hospitals</option>
                        {filterOptions?.hospitals.map((h) => (
                            <option key={h} value={h}>
                                {h}
                            </option>
                        ))}
                    </NativeSelect>
                    <Input aria-label="Added from" type="date" value={from} onChange={onFilterChange(setFrom)} />
                    <Input aria-label="Added to" type="date" value={to} onChange={onFilterChange(setTo)} />
                    {hasFilters && (
                        <div className="sm:col-span-2 lg:col-span-5">
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
                            <TableRow>
                                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                                    No doctors found.
                                </TableCell>
                            </TableRow>
                        )}

                        {data?.data.map((doctor) => (
                            <TableRow key={doctor._id}>
                                <TableCell>
                                    <div className="font-medium">{doctor.name}</div>
                                    <div className="text-xs text-muted-foreground lg:hidden">
                                        {doctor.specialization} &middot; {doctor.hospital}
                                    </div>
                                </TableCell>
                                <TableCell className="hidden lg:table-cell">{doctor.specialization}</TableCell>
                                <TableCell className="hidden lg:table-cell">{doctor.hospital}</TableCell>
                                <TableCell className="hidden xl:table-cell">
                                    <div>{doctor.phone}</div>
                                    <div className="text-xs text-muted-foreground">{doctor.email}</div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Badge variant="secondary">{doctor.patientCount ?? 0}</Badge>
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
            </div>

            <CreateDoctorDialog open={createOpen} onOpenChange={setCreateOpen} />
        </div>
    );
}