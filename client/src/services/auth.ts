const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

export interface RegisterData {
	email: string;
	password: string;
	name?: string;
}

export interface LoginData {
	email: string;
	password: string;
}

export async function register(data: RegisterData) {
	const res = await fetch(`${API_URL}/auth/register`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify(data),
	});
	if (!res.ok) {
		const err = await res.json();
		throw new Error(err.error ?? "Erreur inscription");
	}
	return res.json();
}

export async function login(data: LoginData) {
	const res = await fetch(`${API_URL}/auth/login`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify(data),
	});
	if (!res.ok) {
		const err = await res.json();
		throw new Error(err.error ?? "Erreur connexion");
	}
	return res.json();
}

export async function logout() {
    const res = await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Erreur déconnexion");
    }
    return res.json();
}