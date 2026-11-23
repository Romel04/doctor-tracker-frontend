// Server-side only: used by route handlers and proxy.ts
export const BACKEND_API_URL = process.env.BACKEND_API_URL ?? "http://localhost:5000/api";
export const TOKEN_COOKIE = "dt_token";