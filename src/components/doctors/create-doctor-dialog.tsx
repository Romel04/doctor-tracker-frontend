"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { api, ApiError } from "@/lib/api";
import { doctorSchema, type DoctorValues } from "@/lib/validators";

export function CreateDoctorDialog({
    open,
    onOpenChange,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const queryClient = useQueryClient();
    const {
        register,
        handleSubmit,
        reset,
        setError,
        formState: { errors },
    } = useForm<DoctorValues>({
        resolver: zodResolver(doctorSchema),
        defaultValues: { name: "", specialization: "", hospital: "", phone: "", email: "" },
    });

    const mutation = useMutation({
        mutationFn: (values: DoctorValues) => api("doctors", { method: "POST", body: values }),
        onSuccess: () => {
            toast.success("Doctor added");
            queryClient.invalidateQueries({ queryKey: ["doctors"] });
            queryClient.invalidateQueries({ queryKey: ["doctor-filters"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
            reset();
            onOpenChange(false);
        },
        onError: (error) => {
            if (error instanceof ApiError) {
                if (error.status === 409) {
                    setError("email", { message: "A doctor with this email already exists" });
                    return;
                }
                if (error.errors?.length) {
                    error.errors.forEach((e) => setError(e.field as keyof DoctorValues, { message: e.message }));
                    return;
                }
            }
            toast.error(error.message);
        },
    });

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                if (!next) reset();
                onOpenChange(next);
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add doctor</DialogTitle>
                    <DialogDescription>Enter the doctor&apos;s details.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="space-y-4" noValidate>
                    <FormField label="Name" htmlFor="doctor-name" error={errors.name?.message}>
                        <Input id="doctor-name" {...register("name")} />
                    </FormField>
                    <FormField label="Specialization" htmlFor="doctor-specialization" error={errors.specialization?.message}>
                        <Input id="doctor-specialization" {...register("specialization")} />
                    </FormField>
                    <FormField label="Hospital" htmlFor="doctor-hospital" error={errors.hospital?.message}>
                        <Input id="doctor-hospital" {...register("hospital")} />
                    </FormField>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormField label="Phone" htmlFor="doctor-phone" error={errors.phone?.message}>
                            <Input id="doctor-phone" type="tel" {...register("phone")} />
                        </FormField>
                        <FormField label="Email" htmlFor="doctor-email" error={errors.email?.message}>
                            <Input id="doctor-email" type="email" {...register("email")} />
                        </FormField>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? "Saving..." : "Add doctor"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}