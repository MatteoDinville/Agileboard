import { api } from "./api";

export type RegisterData = { email: string; password: string; name?: string };
export type LoginData = { email: string; password: string };

export async function register(data: RegisterData) {
	const { data: res } = await api.post("/auth/register", data);
	return res as { user: { id: number; email: string; name?: string } };
}

export async function login(data: LoginData) {
	const { data: res } = await api.post("/auth/login", data);
	return res as { user: { id: number; email: string; name?: string } };
}

export async function logout() {
	const { data } = await api.post("/auth/logout", {});
	return data;
}

export async function getCurrentUser() {
	const { data } = await api.get("/auth/me");
	return data as { user?: { id: number; email: string; name?: string } };
}
