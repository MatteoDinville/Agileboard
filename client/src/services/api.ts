import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

export const api = axios.create({
	baseURL,
	withCredentials: true,
});

api.interceptors.response.use(
	(res) => res,
	async (error) => {
		const original = error.config as import("axios").AxiosRequestConfig & { _retry?: boolean };
		if (error.response?.status === 401 && !original?._retry) {
			original._retry = true;
			try {
				await axios.post(`${baseURL}/auth/refresh`, {}, { withCredentials: true });
				return api(original);
			} catch {
				console.error("Échec de la tentative de rafraîchissement du token d'authentification.");
				return Promise.reject(error);
			}
		}
		return Promise.reject(error);
	}
);
