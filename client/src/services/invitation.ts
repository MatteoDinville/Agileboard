const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export interface ProjectInvitation {
	id: number;
	email: string;
	createdAt: string;
	expiresAt: string;
	invitedBy: {
		name: string;
		email: string;
	};
}

export interface InvitationInfo {
	email: string;
	project: {
		id: number;
		title: string;
		description?: string;
	};
	invitedBy: {
		id: number;
		name: string;
		email: string;
	};
	expiresAt: string;
	token?: string; // Ajouté pour les notifications
}

export interface InvitationResponse {
	type: 'invitation_sent' | 'direct_add' | 'resent';
	message: string;
	member?: any;
}

export class InvitationService {
	/**
	 * POST /api/projects/:id/invite
	 * Envoie une invitation par email
	 */
	async sendInvitation(projectId: number, email: string): Promise<InvitationResponse> {
		const res = await fetch(`${API_URL}/projects/${projectId}/invite`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
			body: JSON.stringify({ email }),
		});

		if (!res.ok) {
			const err = await res.json();
			throw new Error(err.error || "Erreur lors de l'envoi de l'invitation");
		}

		return res.json();
	}

	/**
	 * GET /api/projects/:id/invitations
	 * Récupère les invitations en attente pour un projet
	 */
	async getProjectInvitations(projectId: number): Promise<ProjectInvitation[]> {
		const res = await fetch(`${API_URL}/projects/${projectId}/invitations`, {
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
		});

		if (!res.ok) {
			const err = await res.json();
			throw new Error(err.error || "Erreur lors de la récupération des invitations");
		}

		return res.json();
	}

	/**
	 * GET /api/invite/:token
	 * Récupère les informations d'une invitation
	 */
	async getInvitationInfo(token: string): Promise<InvitationInfo> {
		const res = await fetch(`${API_URL}/invite/${token}`, {
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!res.ok) {
			const err = await res.json();
			throw new Error(err.error || "Invitation non trouvée");
		}

		return res.json();
	}

	/**
	 * POST /api/invite/:token/accept
	 * Accepte une invitation (nécessite d'être connecté)
	 */
	async acceptInvitation(token: string): Promise<{ message: string; project: any }> {
		const res = await fetch(`${API_URL}/invite/${token}/accept`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
		});

		if (!res.ok) {
			const err = await res.json();
			throw new Error(err.error || "Erreur lors de l'acceptation de l'invitation");
		}

		return res.json();
	}

	/**
	 * GET /api/user/invitations
	 * Récupère les invitations en attente pour l'utilisateur connecté
	 */
	async getUserInvitations(): Promise<InvitationInfo[]> {
		const res = await fetch(`${API_URL}/user/invitations`, {
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
		});

		if (!res.ok) {
			const err = await res.json();
			throw new Error(err.error || "Erreur lors de la récupération des invitations");
		}

		return res.json();
	}
}

export const invitationService = new InvitationService();
