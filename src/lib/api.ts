export class ApiError extends Error {
    status: number;
    errors?: { field: string; message: string }[];

    constructor(message: string, status: number, errors?: { field: string; message: string }[]) {
        super(message);
        this.status = status;
        this.errors = errors;
    }
}

type Params = Record<string, string | number | undefined | null>;

export async function api<T>(
    path: string,
    options: { method?: string; body?: unknown; params?: Params } = {}
): Promise<T> {
    const { method = "GET", body, params } = options;

    const query = new URLSearchParams();
    if (params) {
        for (const [key, value] of Object.entries(params)) {
            if (value !== undefined && value !== null && value !== "") query.set(key, String(value));
        }
    }
    const qs = query.toString();

    const res = await fetch(`/api/backend/${path}${qs ? `?${qs}` : ""}`, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
        if (res.status === 401 && typeof window !== "undefined") {
            window.location.href = "/login"; // session expired
        }
        throw new ApiError(data?.message ?? "Something went wrong", res.status, data?.errors);
    }
    return data as T;
}