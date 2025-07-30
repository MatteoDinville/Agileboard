import { api } from "./api";

export type RegisterData = { email: string; password: string; name?: string };
export type LoginData = { email: string; password: string };

export const authService = {
	async register(data: RegisterData) {
		const { data: res } = await api.post("/auth/register", data);
		return res as { user: { id: number; email: string; name?: string } };
	},
	async login(data: LoginData) {
		try {
			const { data: res } = await api.post("/auth/login", data);
			return res as { user: { id: number; email: string; name?: string } };
		} catch (error) {
			console.log("ceci est une ereuur", error)
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