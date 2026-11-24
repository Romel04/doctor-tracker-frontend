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
import type { Patient } from "@/lib/types";
import { patientSchema, type PatientValues } from "@/lib/validators";

function EditPatientForm({ patient, onClose }: { patient: Patient; onClose: () => void }) {
    const queryClient = useQueryClient();
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<PatientValues>({
        resolver: zodResolver(patientSchema),
        // Start with the patient's current values
        defaultValues: {
            name: patient.name,
            age: String(patient.age),
            gender: patient.gender,
            phone: patient.phone,
            condition: patient.condition,
            visitDate: patient.visitDate.slice(0, 10), // ISO string -> YYYY-MM-DD
        },
    });

    const mutation = useMutation({
        mutationFn: (values: PatientValues) =>
            api(`patients/${patient._id}`, {
                method: "PATCH",
                body: { ...values, age: Number(values.age) },
            }),
        onSuccess: () => {
            toast.success("Patient updated");
            invalidatePatientData(queryClient);
            onClose();
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
        <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="space-y-4" noValidate>
            <PatientFormFields register={register} errors={errors} idPrefix="edit-patient" />

            <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending ? "Saving..." : "Save changes"}
                </Button>
            </DialogFooter>
        </form>
    );
}

export function EditPatientDialog({ patient, onClose }: { patient: Patient | null; onClose: () => void }) {
    return (
        <Dialog
            open={patient !== null}
            onOpenChange={(next) => {
                if (!next) onClose();
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit patient</DialogTitle>
                    <DialogDescription>Update the patient&apos;s details.</DialogDescription>
                </DialogHeader>
                {/* key = patient id, so the form remounts with fresh values for each patient */}
                {patient && <EditPatientForm key={patient._id} patient={patient} onClose={onClose} />}
            </DialogContent>
        </Dialog>
    );
}