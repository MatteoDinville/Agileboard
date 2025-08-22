import { api } from "./api";
import { AxiosError } from "axios";

export type RegisterData = { email: string; password: string; name?: string };
export type LoginData = { email: string; password: string };

export const authService = {
	async register(data: RegisterData) {
		try {
			const { data: res } = await api.post("/auth/register", data);
			return res as { user: { id: number; email: string; name?: string }; };
		} catch (error: unknown) {
			const axiosError = error as AxiosError<{ error?: string; message?: string }>;
			const message = axiosError.response?.data?.error || axiosError.response?.data?.message || "Inscription échouée : Erreur serveur";
			throw new Error(message);
		}
	},
	async login(data: LoginData) {
		try {
			const { data: res } = await api.post("/auth/login", data);
			return res as { user: { id: number; email: string; name?: string }; };
		} catch (error: unknown) {
			const axiosError = error as AxiosError<{ error?: string; message?: string }>;
			const message = axiosError.response?.data?.error || axiosError.response?.data?.message || "Connexion échouée : Erreur serveur";
			throw new Error(message);
		}
	},
	async logout() {
		const { data } = await api.post("/auth/logout", {});
		return data;
	},
	async getCurrentUser() {
		const { data } = await api.get("/auth/me");
		return data as { user?: { id: number; email: string; name?: string } };
	}
}