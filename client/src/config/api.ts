export const API_BASE_URL = 'http://localhost:4000/api';

export const api = {
	get: async <T>(endpoint: string): Promise<T> => {
		const response = await fetch(`${API_BASE_URL}${endpoint}`, {
			credentials: 'include',
		})

		if (!response.ok) {
			let errMsg = response.statusText
			try {
				const data = await response.json()
				errMsg = data.message ?? errMsg
			} catch {
				errMsg = response.statusText
			}
			throw new Error(errMsg)
		}

		return response.json()
	},

	post: async <T, D = unknown>(endpoint: string, data: D): Promise<T> => {
		const response = await fetch(`${API_BASE_URL}${endpoint}`, {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data),
		})

		if (!response.ok) {
			let errMsg = response.statusText
			try {
				const errBody = await response.json()
				errMsg = errBody.message ?? errMsg
			} catch {
				errMsg = response.statusText
			}
			throw new Error(errMsg)
		}

		return response.json()
	},

	put: async <T, D = unknown>(endpoint: string, data: D): Promise<T> => {
		const response = await fetch(`${API_BASE_URL}${endpoint}`, {
			method: 'PUT',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data),
		})

		if (!response.ok) {
			let errMsg = response.statusText
			try {
				const errBody = await response.json()
				errMsg = errBody.message ?? errMsg
			} catch {
				errMsg = response.statusText
			}
			throw new Error(errMsg)
		}

		return response.json()
	},

	delete: async <T>(endpoint: string): Promise<T> => {
		const response = await fetch(`${API_BASE_URL}${endpoint}`, {
			method: 'DELETE',
			credentials: 'include',
		})

		if (!response.ok) {
			let errMsg = response.statusText
			try {
				const errBody = await response.json()
				errMsg = errBody.message ?? errMsg
			} catch {
				errMsg = response.statusText
			}
			throw new Error(errMsg)
		}

		return response.json()
	},
}
