import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middleware/auth.middleware";
import crypto from "crypto";

let prisma: PrismaClient = new PrismaClient();
export function setPrismaInstance(instance: PrismaClient) {
	prisma = instance;
}

export const invitationController = {
	/**
	 * POST /api/projects/:id/invite
	 * Crée une invitation pour rejoindre un projet
	 * Corps attendu : { email: string }
	 */
	sendInvitation: async (req: AuthRequest, res: Response, next: NextFunction) => {
		try {
			const currentUserId = req.userId!;
			const projectId = parseInt(req.params.id, 10);
			const { email } = req.body;

			if (!email || !email.includes("@")) {
				return res.status(400).json({ error: "Email valide requis." });
			}

			const project = await prisma.project.findUnique({
				where: { id: projectId },
				include: {
					owner: {
						select: { id: true, name: true, email: true }
					}
				}
			});

			if (!project || project.ownerId !== currentUserId) {
				return res.status(404).json({ error: "Projet non trouvé ou accès refusé." });
			}

			if (email.toLowerCase() === project.owner.email.toLowerCase()) {
				return res.status(400).json({ error: "Vous ne pouvez pas vous inviter vous-même à votre propre projet." });
			}

			const existingUser = await prisma.user.findUnique({
				where: { email: email.toLowerCase() }
			});

			if (existingUser) {
				if (existingUser.id === currentUserId) {
					return res.status(400).json({ error: "Vous ne pouvez pas vous inviter vous-même à votre propre projet." });
				}

				const existingMember = await prisma.projectMember.findUnique({
					where: {
						userId_projectId: {
							userId: existingUser.id,
							projectId
						}
					}
				});

				if (existingMember) {
					return res.status(409).json({ error: "Cette personne est déjà membre du projet." });
				}
			}
			const existingInvitation = await prisma.projectInvitation.findUnique({
				where: {
					email_projectId: {
						email: email.toLowerCase(),
						projectId
					}
				}
			});

			if (existingInvitation && !existingInvitation.acceptedAt && !existingInvitation.declinedAt) {
				if (existingInvitation.expiresAt > new Date()) {
					if (existingUser) {
						const isStillMember = await prisma.projectMember.findUnique({
							where: {
								userId_projectId: {
									userId: existingUser.id,
									projectId
								}
							}
						});

						if (isStillMember) {
							await prisma.projectInvitation.delete({
								where: { id: existingInvitation.id }
							});
							return res.status(409).json({ error: "Cette personne est déjà membre du projet." });
						}
					}

					return res.status(409).json({
						type: "pending_invitation_exists",
						message: "Une invitation est déjà en attente pour cet email.",
						invitationUrl: `${process.env.FRONTEND_URL || "http://localhost:5173"}/invite/${existingInvitation.token}`
					});
				} else {
					await prisma.projectInvitation.delete({
						where: { id: existingInvitation.id }
					});
				}
			} else if (existingInvitation && (existingInvitation.acceptedAt || existingInvitation.declinedAt)) {
				await prisma.projectInvitation.delete({
					where: { id: existingInvitation.id }
				});
			}

			const token = crypto.randomBytes(32).toString("hex");
			const expiresAt = new Date();
			expiresAt.setDate(expiresAt.getDate() + 7);

			await prisma.projectInvitation.create({
				data: {
					email: email.toLowerCase(),
					projectId,
					invitedById: currentUserId,
					token,
					expiresAt
				}
			});

			res.status(201).json({
				type: "invitation_created",
				message: "Invitation créée avec succès",
				invitationUrl: `${process.env.FRONTEND_URL || "http://localhost:5173"}/invite/${token}`
			});

		} catch (err) {
			next(err);
		}
	},

	/**
	 * GET /api/invite/:token
	 * Récupère les informations d'une invitation
	 */
	getInvitation: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { token } = req.params;

			const invitation = await prisma.projectInvitation.findUnique({
				where: { token },
				include: {
					project: {
						select: {
							id: true,
							title: true,
							description: true
						}
					},
					invitedBy: {
						select: {
							id: true,
							name: true,
							email: true
						}
					}
				}
			});

			if (!invitation) {
				return res.status(404).json({ error: "Invitation non trouvée." });
			}

			if (invitation.acceptedAt) {
				return res.status(400).json({ error: "Cette invitation a déjà été acceptée." });
			}

			if (invitation.expiresAt < new Date()) {
				return res.status(400).json({ error: "Cette invitation a expiré." });
			}

			res.json({
				email: invitation.email,
				project: invitation.project,
				invitedBy: invitation.invitedBy,
				expiresAt: invitation.expiresAt
			});

		} catch (err) {
			next(err);
		}
	},

	/**
	 * POST /api/invite/:token/accept
	 * Accepte une invitation (nécessite que l'utilisateur soit connecté)
	 */
	acceptInvitation: async (req: AuthRequest, res: Response, next: NextFunction) => {
		try {
			const userId = req.userId!;
			const { token } = req.params;

			const user = await prisma.user.findUnique({
				where: { id: userId },
				select: { id: true, email: true, name: true }
			});

			if (!user) {
				return res.status(404).json({ error: "Utilisateur non trouvé." });
			}

			const invitation = await prisma.projectInvitation.findUnique({
				where: { token },
				include: {
					project: true
				}
			});

			if (!invitation) {
				return res.status(404).json({ error: "Invitation non trouvée." });
			}

			if (invitation.acceptedAt) {
				return res.status(400).json({ error: "Cette invitation a déjà été acceptée." });
			}

			if (invitation.expiresAt < new Date()) {
				return res.status(400).json({ error: "Cette invitation a expiré." });
			}

			if (invitation.email.toLowerCase() !== user.email.toLowerCase()) {
				return res.status(403).json({ error: "Cette invitation n'est pas pour votre compte." });
			}

			const existingMember = await prisma.projectMember.findUnique({
				where: {
					userId_projectId: {
						userId,
						projectId: invitation.projectId
					}
				}
			});

			if (existingMember) {
				await prisma.projectInvitation.update({
					where: { id: invitation.id },
					data: { acceptedAt: new Date() }
				});

				return res.status(400).json({ error: "Vous êtes déjà membre de ce projet." });
			}

			await prisma.$transaction([
				prisma.projectMember.create({
					data: {
						userId,
						projectId: invitation.projectId
					}
				}),
				prisma.projectInvitation.update({
					where: { id: invitation.id },
					data: { acceptedAt: new Date() }
				})
			]);

			res.json({
				message: "Invitation acceptée avec succès",
				project: invitation.project
			});

		} catch (err) {
			next(err);
		}
	},

	/**
	 * POST /api/invite/:token/decline
	 * Décline une invitation (nécessite que l'utilisateur soit connecté)
	 */
	declineInvitation: async (req: AuthRequest, res: Response, next: NextFunction) => {
		try {
			const userId = req.userId!;
			const { token } = req.params;

			const user = await prisma.user.findUnique({
				where: { id: userId },
				select: { id: true, email: true, name: true }
			});

			if (!user) {
				return res.status(404).json({ error: "Utilisateur non trouvé." });
			}

			const invitation = await prisma.projectInvitation.findUnique({
				where: { token },
				include: {
					project: {
						select: {
							id: true,
							title: true
						}
					}
				}
			});

			if (!invitation) {
				return res.status(404).json({ error: "Invitation non trouvée." });
			}

			if (invitation.acceptedAt) {
				return res.status(400).json({ error: "Cette invitation a déjà été acceptée." });
			}

			if (invitation.expiresAt < new Date()) {
				return res.status(400).json({ error: "Cette invitation a expiré." });
			}

			if (invitation.email.toLowerCase() !== user.email.toLowerCase()) {
				return res.status(403).json({ error: "Cette invitation n'est pas pour votre compte." });
			}

			await prisma.projectInvitation.update({
				where: { id: invitation.id },
				data: { declinedAt: new Date() }
			});

			res.json({
				message: "Invitation déclinée avec succès",
				project: invitation.project
			});

		} catch (err) {
			next(err);
		}
	},

	/**
	 * GET /api/projects/:id/invitations
	 * Récupère les invitations en attente pour un projet
	 */
	getProjectInvitations: async (req: AuthRequest, res: Response, next: NextFunction) => {
		try {
			const currentUserId = req.userId!;
			const projectId = parseInt(req.params.id, 10);

			const project = await prisma.project.findUnique({
				where: { id: projectId }
			});

			if (!project || project.ownerId !== currentUserId) {
				return res.status(404).json({ error: "Projet non trouvé ou accès refusé." });
			}

			const invitations = await prisma.projectInvitation.findMany({
				where: {
					projectId,
					acceptedAt: null,
					declinedAt: null,
					expiresAt: { gt: new Date() }
				},
				select: {
					id: true,
					email: true,
					createdAt: true,
					expiresAt: true,
					invitedBy: {
						select: {
							name: true,
							email: true
						}
					}
				},
				orderBy: { createdAt: "desc" }
			});

			res.json(invitations);

		} catch (err) {
			next(err);
		}
	},

	/**
	 * GET /api/user/invitations
	 * Récupère les invitations en attente pour l'utilisateur connecté
	 */
	getUserInvitations: async (req: AuthRequest, res: Response, next: NextFunction) => {
		try {
			const currentUserId = req.userId!;

			const user = await prisma.user.findUnique({
				where: { id: currentUserId },
				select: { email: true }
			});

			if (!user) {
				return res.status(404).json({ error: "Utilisateur non trouvé." });
			}

			const invitations = await prisma.projectInvitation.findMany({
				where: {
					email: user.email.toLowerCase(),
					acceptedAt: null,
					declinedAt: null,
					expiresAt: { gt: new Date() }
				},
				select: {
					token: true,
					email: true,
					createdAt: true,
					expiresAt: true,
					project: {
						select: {
							id: true,
							title: true,
							description: true
						}
					},
					invitedBy: {
						select: {
							id: true,
							name: true,
							email: true
						}
					}
				},
				orderBy: { createdAt: "desc" }
			});

			const formattedInvitations = invitations.map((inv: {
				email: string;
				project: { id: number; title: string; description: string | null };
				invitedBy: { id: number; name: string | null; email: string };
				expiresAt: Date;
				token: string;
			}) => ({
				email: inv.email,
				project: inv.project,
				invitedBy: inv.invitedBy,
				expiresAt: inv.expiresAt.toISOString(),
				token: inv.token
			}));

			res.json(formattedInvitations);

		} catch (err) {
			next(err);
		}
	},

	/**
	 * GET /api/projects/:id/invitations/history
	 * Récupère l'historique complet des invitations pour un projet (acceptées, déclinées, en attente)
	 */
	getProjectInvitationsHistory: async (req: AuthRequest, res: Response, next: NextFunction) => {
		try {
			const currentUserId = req.userId!;
			const projectId = parseInt(req.params.id, 10);

			const project = await prisma.project.findUnique({
				where: { id: projectId }
			});

			if (!project || project.ownerId !== currentUserId) {
				return res.status(404).json({ error: "Projet non trouvé ou accès refusé." });
			}

			const invitations = await prisma.projectInvitation.findMany({
				where: {
					projectId
				},
				select: {
					id: true,
					email: true,
					createdAt: true,
					expiresAt: true,
					acceptedAt: true,
					declinedAt: true,
					invitedBy: {
						select: {
							name: true,
							email: true
						}
					}
				},
				orderBy: { createdAt: "desc" }
			});

			const pending = invitations.filter((inv: {
				acceptedAt: Date | null;
				declinedAt: Date | null;
				expiresAt: Date;
			}) => !inv.acceptedAt && !inv.declinedAt && inv.expiresAt > new Date());
			const accepted = invitations.filter((inv: { acceptedAt: Date | null }) => inv.acceptedAt);
			const declined = invitations.filter((inv: { declinedAt: Date | null }) => inv.declinedAt);
			const expired = invitations.filter((inv: {
				acceptedAt: Date | null;
				declinedAt: Date | null;
				expiresAt: Date;
			}) => !inv.acceptedAt && !inv.declinedAt && inv.expiresAt <= new Date());

			res.json({
				pending,
				accepted,
				declined,
				expired,
				total: invitations.length
			});

		} catch (err) {
			next(err);
		}
	},

	/**
	 * DELETE /api/projects/:id/invitations/:invitationId
	 * Supprime une invitation en attente
	 */
	deleteInvitation: async (req: AuthRequest, res: Response, next: NextFunction) => {
		try {
			const currentUserId = req.userId!;
			const projectId = parseInt(req.params.id, 10);
			const invitationId = parseInt(req.params.invitationId, 10);

			const project = await prisma.project.findUnique({
				where: { id: projectId }
			});

			if (!project || project.ownerId !== currentUserId) {
				return res.status(404).json({ error: "Projet non trouvé ou accès refusé." });
			}

			const invitation = await prisma.projectInvitation.findUnique({
				where: { id: invitationId }
			});

			if (!invitation || invitation.projectId !== projectId) {
				return res.status(404).json({ error: "Invitation non trouvée." });
			}

			await prisma.projectInvitation.delete({
				where: { id: invitationId }
			});

			res.status(204).send();

		} catch (err) {
			next(err);
		}
	}
};
