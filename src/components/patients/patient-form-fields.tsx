import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { FormField } from "@/components/form-field";
import { NativeSelect } from "@/components/native-select";
import { Input } from "@/components/ui/input";
import type { PatientValues } from "@/lib/validators";

// The inputs shared by the Add and Edit patient dialogs.
// idPrefix keeps the HTML ids unique if two forms ever exist on the same page.
export function PatientFormFields({
    register,
    errors,
    idPrefix,
}: {
    register: UseFormRegister<PatientValues>;
    errors: FieldErrors<PatientValues>;
    idPrefix: string;
}) {
    return (
        <>
            <FormField label="Name" htmlFor={`${idPrefix}-name`} error={errors.name?.message}>
                <Input id={`${idPrefix}-name`} {...register("name")} />
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Age" htmlFor={`${idPrefix}-age`} error={errors.age?.message}>
                    <Input id={`${idPrefix}-age`} inputMode="numeric" {...register("age")} />
                </FormField>
                <FormField label="Gender" htmlFor={`${idPrefix}-gender`} error={errors.gender?.message}>
                    <NativeSelect id={`${idPrefix}-gender`} {...register("gender")}>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </NativeSelect>
                </FormField>
            </div>

            <FormField label="Phone" htmlFor={`${idPrefix}-phone`} error={errors.phone?.message}>
                <Input id={`${idPrefix}-phone`} type="tel" {...register("phone")} />
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Condition" htmlFor={`${idPrefix}-condition`} error={errors.condition?.message}>
                    <Input id={`${idPrefix}-condition`} placeholder="e.g. Hypertension" {...register("condition")} />
                </FormField>
                <FormField label="Visit date" htmlFor={`${idPrefix}-visit-date`} error={errors.visitDate?.message}>
                    <Input id={`${idPrefix}-visit-date`} type="date" {...register("visitDate")} />
                </FormField>
            </div>
        </>
    );
}