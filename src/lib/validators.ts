import { z } from "zod";

// Person name: letters (any language), spaces, dots, hyphens and apostrophes. No digits or other symbols.
// \p{L} = any letter, \p{M} = combining marks (needed for scripts like Bangla).
// Built with RegExp() because the project targets ES2017, where regex literals with \p are not type-checked.
const nameRegex = new RegExp("^[\\p{L}\\p{M}][\\p{L}\\p{M}\\s.'-]*$", "u");

// Bangladeshi mobile format: 11 digits, starting with 01
const phoneRegex = /^01\d{9}$/;

const nameField = z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100)
    .regex(nameRegex, "Name can only contain letters, spaces, dots, hyphens and apostrophes");

const phoneField = z.string().trim().regex(phoneRegex, "Phone must be 11 digits and start with 01");

export const doctorSchema = z.object({
    name: nameField,
    specialization: z.string().trim().min(2, "Specialization is required").max(100),
    hospital: z.string().trim().min(2, "Hospital is required").max(150),
    phone: phoneField,
    email: z.string().trim().min(1, "Email is required").email("Enter a valid email"),
});
export type DoctorValues = z.infer<typeof doctorSchema>;

// Patient form: every value is a string because that is what inputs give us.
// Age is converted to a number only when it is sent to the API.
export const patientSchema = z.object({
    name: nameField,
    age: z
        .string()
        .trim()
        .regex(/^\d{1,3}$/, "Enter a valid age")
        .refine((v) => Number(v) <= 130, "Age must be 130 or less"),
    gender: z.enum(["male", "female", "other"]),
    phone: phoneField,
    condition: z.string().trim().min(2, "Condition is required").max(150),
    visitDate: z.string().min(1, "Visit date is required"),
});
export type PatientValues = z.infer<typeof patientSchema>;