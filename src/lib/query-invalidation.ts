import type { QueryClient } from "@tanstack/react-query";

// Anything that shows patient data or patient counts. Call this after a patient is added, edited or deleted.
const PATIENT_RELATED_KEYS = ["doctor-patients", "doctor", "doctors", "patients", "patient-conditions", "dashboard"];

export function invalidatePatientData(queryClient: QueryClient) {
    for (const key of PATIENT_RELATED_KEYS) {
        queryClient.invalidateQueries({ queryKey: [key] });
    }
}