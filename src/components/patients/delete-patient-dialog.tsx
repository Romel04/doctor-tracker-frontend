"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { invalidatePatientData } from "@/lib/query-invalidation";
import type { Patient } from "@/lib/types";

export function DeletePatientDialog({
    patient,
    onClose,
    onDeleted,
}: {
    patient: Patient | null; // null means the dialog is closed
    onClose: () => void;
    onDeleted?: () => void;
}) {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (id: string) => api(`patients/${id}`, { method: "DELETE" }),
        onSuccess: () => {
            toast.success("Patient deleted");
            invalidatePatientData(queryClient);
            onDeleted?.();
            onClose();
        },
        onError: (error) => toast.error(error.message),
    });

    return (
        <Dialog
            open={patient !== null}
            onOpenChange={(next) => {
                if (!next) onClose();
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete patient?</DialogTitle>
                    <DialogDescription>
                        {patient ? `${patient.name} will be permanently removed. This cannot be undone.` : ""}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        disabled={mutation.isPending || !patient}
                        onClick={() => patient && mutation.mutate(patient._id)}
                    >
                        {mutation.isPending ? "Deleting..." : "Delete"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}