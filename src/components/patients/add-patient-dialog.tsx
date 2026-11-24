"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PatientFormFields } from "@/components/patients/patient-form-fields";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api, ApiError } from "@/lib/api";
import { invalidatePatientData } from "@/lib/query-invalidation";
import { patientSchema, type PatientValues } from "@/lib/validators";

// Today's date in the user's own time zone, in the YYYY-MM-DD format that <input type="date"> expects.
function today() {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
}

const emptyValues = (): PatientValues => ({
    name: "",
    age: "",
    gender: "male",
    phone: "",
    condition: "",
    visitDate: today(),
});

export function AddPatientDialog({
    doctorId,
    open,
    onOpenChange,
}: {
    doctorId: string;
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
    } = useForm<PatientValues>({
        resolver: zodResolver(patientSchema),
        defaultValues: emptyValues(),
    });

    const mutation = useMutation({
        mutationFn: (values: PatientValues) =>
            api(`doctors/${doctorId}/patients`, {
                method: "POST",
                body: { ...values, age: Number(values.age) },
            }),
        onSuccess: () => {
            toast.success("Patient added");
            invalidatePatientData(queryClient);
            reset(emptyValues());
            onOpenChange(false);
        },
        onError: (error) => {
            if (error instanceof ApiError && error.errors?.length) {
                error.errors.forEach((e) => setError(e.field as keyof PatientValues, { message: e.message }));
                return;
            }
            toast.error(error.message);
        },
    });

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                if (!next) reset(emptyValues());
                onOpenChange(next);
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add patient</DialogTitle>
                    <DialogDescription>The patient will be added under this doctor.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="space-y-4" noValidate>
                    <PatientFormFields register={register} errors={errors} idPrefix="add-patient" />

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? "Saving..." : "Add patient"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}