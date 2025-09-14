import { API_BASE_URL } from "@/app/config";

export async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
    try {
        const res = await fetch(`${url}`, {
            credentials: "include",
            ...options,
        });

        const data = await res.json();

        if(!res.ok) {
            const message = data?.message || `Request failed with status ${res.status}`;
            console.error(message || "Request Failed, unkown message");
            throw new Error(message);
        }

        return data as T;
    } catch (err: any) {
        console.error(err.message || "Blad przy wysylaniu, nie serwera");
        throw err;
    }
    
}