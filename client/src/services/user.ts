const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

export interface IUser
{
	id: number;
	email: string;
	name?: string;
	createdAt: string;
	updatedAt: string;
}

export interface UpdateProfileData
{
	name?: string;
	email?: string;
}

export interface ChangePasswordData
{
	currentPassword: string;
	newPassword: string;
}

export const userService = {
	async getProfile(): Promise<IUser>
	{
		const res = await fetch(`${API_URL}/user/profile`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include"
		});

		if (!res.ok)
		{
			const err = await res.json();
			throw new Error(err.error ?? "Erreur lors de la récupération du profil");
		}

		return res.json();
	},

	async updateProfile(data: UpdateProfileData)
	{
		const res = await fetch(`${API_URL}/user/profile`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
			body: JSON.stringify(data),
		});

		if (!res.ok)
		{
			const err = await res.json();
			throw new Error(err.error ?? "Erreur lors de la mise à jour du profil");
		}

		return res.json();
	},

	async changePassword(data: ChangePasswordData)
	{
		const res = await fetch(`${API_URL}/user/password`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
			body: JSON.stringify(data),
		});

		if (!res.ok)
		{
			const err = await res.json();
			throw new Error(err.error ?? "Erreur lors du changement de mot de passe");
		}

		return res.json();
	},

	async getAllUsers(): Promise<IUser[]>
	{
		const res = await fetch(`${API_URL}/user/all`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
		});

		if (!res.ok)
		{
			const err = await res.json();
			throw new Error(err.error ?? "Erreur lors de la récupération des utilisateurs");
		}

		return res.json();
	}
}