import { z } from "zod";

export const phoneRegex = /^[0-9+\-\s()]{7,20}$/;

export const doctorSchema = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
    specialization: z.string().trim().min(2, "Specialization is required").max(100),
    hospital: z.string().trim().min(2, "Hospital is required").max(150),
    phone: z.string().trim().regex(phoneRegex, "Enter a valid phone number"),
    email: z.string().trim().min(1, "Email is required").email("Enter a valid email"),
});
export type DoctorValues = z.infer<typeof doctorSchema>;

// Patient form: every value is a string because that is what inputs give us.
// Age is converted to a number only when it is sent to the API.
export const patientSchema = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
    age: z
        .string()
        .trim()
        .regex(/^\d{1,3}$/, "Enter a valid age")
        .refine((v) => Number(v) <= 130, "Age must be 130 or less"),
    gender: z.enum(["male", "female", "other"]),
    phone: z.string().trim().regex(phoneRegex, "Enter a valid phone number"),
    condition: z.string().trim().min(2, "Condition is required").max(150),
    visitDate: z.string().min(1, "Visit date is required"),
});
export type PatientValues = z.infer<typeof patientSchema>;