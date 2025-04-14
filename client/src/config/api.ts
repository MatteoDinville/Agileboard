export const API_BASE_URL = 'http://localhost:4000/api';

export const api = {
	get: async <T>(endpoint: string): Promise<T> => {
		const response = await fetch(`${API_BASE_URL}${endpoint}`, {
			credentials: 'include',
		});
		if (!response.ok) {
			throw new Error(`API Error: ${response.statusText}`);
		}
		return response.json();
	},

	post: async <T, D = unknown>(endpoint: string, data: D): Promise<T> => {
		const response = await fetch(`${API_BASE_URL}${endpoint}`, {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		});
		if (!response.ok) {
			throw new Error(`API Error: ${response.statusText}`);
		}
		return response.json();
	},

	put: async <T, D = unknown>(endpoint: string, data: D): Promise<T> => {
		const response = await fetch(`${API_BASE_URL}${endpoint}`, {
			method: 'PUT',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		});
		if (!response.ok) {
			throw new Error(`API Error: ${response.statusText}`);
		}
		return response.json();
	},

	delete: async <T>(endpoint: string): Promise<T> => {
		const response = await fetch(`${API_BASE_URL}${endpoint}`, {
			method: 'DELETE',
			credentials: 'include',
		});
		if (!response.ok) {
			throw new Error(`API Error: ${response.statusText}`);
		}
		return response.json();
	},
};