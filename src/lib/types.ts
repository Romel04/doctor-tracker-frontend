export type Pagination = { total: number; page: number; limit: number; totalPages: number };
export type Paginated<T> = { data: T[]; pagination: Pagination };

export type Doctor = {
    _id: string;
    name: string;
    specialization: string;
    hospital: string;
    phone: string;
    email: string;
    createdAt: string;
    patientCount?: number;
};

export type Patient = {
    _id: string;
    name: string;
    age: number;
    gender: "male" | "female" | "other";
    phone: string;
    condition: string;
    visitDate: string;
    doctor: string | { _id: string; name: string; specialization: string; hospital: string };
    createdAt: string;
};

export type DashboardData = {
    range: { days: number; from: string; to: string };
    totals: { doctors: number; patients: number; patientsInRange: number; newDoctorsInRange: number };
    patientsPerDoctor: { doctorId: string; name: string; specialization: string; patients: number }[];
    patientsOverTime: { date: string; count: number }[];
    conditions: { condition: string; count: number }[];
    gender: { gender: string; count: number }[];
    specializations: { specialization: string; count: number }[];
};