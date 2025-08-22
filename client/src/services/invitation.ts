import { Project } from "./project";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export interface ProjectInvitation {
	id: number;
	email: string;
	createdAt: string;
	expiresAt: string;
	acceptedAt?: string;
	declinedAt?: string;
	invitedBy: {
		name: string;
		email: string;
	};
}

export interface InvitationHistory {
	pending: ProjectInvitation[];
	accepted: ProjectInvitation[];
	declined: ProjectInvitation[];
	expired: ProjectInvitation[];
	total: number;
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
	token?: string;
}

export interface InvitationResponse {
	type: 'invitation_created' | 'pending_invitation_exists' | 'invitation_sent';
	message: string;
	member?: unknown;
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

			if (res.status === 409) {
				if (err.type) {
					return err; // Retourner la réponse pour gérer le renvoi d'invitation
				}
				throw new Error(err.error || "Erreur lors de l'envoi de l'invitation");
			}

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
	 * GET /api/projects/:id/invitations/history
	 * Récupère l'historique complet des invitations pour un projet
	 */
	async getProjectInvitationsHistory(projectId: number): Promise<InvitationHistory> {
		const res = await fetch(`${API_URL}/projects/${projectId}/invitations/history`, {
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
		});

		if (!res.ok) {
			const err = await res.json();
			throw new Error(err.error || "Erreur lors de la récupération de l'historique des invitations");
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
	async acceptInvitation(token: string): Promise<{ message: string; project: Project }> {
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
	 * POST /api/invite/:token/decline
	 * Décline une invitation (nécessite d'être connecté)
	 */
	async declineInvitation(token: string): Promise<{ message: string; project: Project }> {
		const res = await fetch(`${API_URL}/invite/${token}/decline`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
		});

		if (!res.ok) {
			const err = await res.json();
			throw new Error(err.error || "Erreur lors du refus de l'invitation");
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

	/**
	 * DELETE /api/projects/:id/invitations/:invitationId
	 * Supprime une invitation en attente
	 */
	async deleteInvitation(projectId: number, invitationId: number): Promise<void> {
		const res = await fetch(`${API_URL}/projects/${projectId}/invitations/${invitationId}`, {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
		});

		if (!res.ok) {
			const err = await res.json();
			throw new Error(err.error || "Erreur lors de la suppression de l'invitation");
		}
	}
}

export const invitationService = new InvitationService();
