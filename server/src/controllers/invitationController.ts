import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { emailService } from "../services/emailService";
import { AuthRequest } from "../middleware/auth.middleware";

let prisma: PrismaClient = new PrismaClient();
export function setPrismaInstance(instance: PrismaClient) {
	prisma = instance;
}

export const invitationController = {
	/**
	 * POST /api/projects/:id/invite
	 * Envoie une invitation par email pour rejoindre un projet
	 * Corps attendu : { email: string }
	 */
	sendInvitation: async (req: AuthRequest, res: Response, next: NextFunction) => {
		try {
			const currentUserId = req.userId!;
			const projectId = parseInt(req.params.id, 10);
			const { email } = req.body;

			if (!email || !email.includes('@')) {
				return res.status(400).json({ error: "Email valide requis." });
			}

			// Vérifier que le projet existe et que l'utilisateur en est propriétaire
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

			// Vérifier si l'utilisateur avec cet email existe déjà
			const existingUser = await prisma.user.findUnique({
				where: { email: email.toLowerCase() }
			});

			if (existingUser) {
				// Si l'utilisateur existe, vérifier s'il n'est pas déjà membre
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

				// Pour un utilisateur existant, créer quand même une invitation
				// au lieu de l'ajouter directement - cela permet un workflow cohérent
			}

			// Vérifier s'il n'y a pas déjà une invitation en attente pour cet email
			const existingInvitation = await prisma.projectInvitation.findUnique({
				where: {
					email_projectId: {
						email: email.toLowerCase(),
						projectId
					}
				}
			});

			if (existingInvitation && !existingInvitation.acceptedAt && !existingInvitation.declinedAt) {
				// Si l'invitation n'a pas expiré, la renvoyer
				if (existingInvitation.expiresAt > new Date()) {
					// Optionnel : renvoyer l'email
					try {
						await emailService.sendProjectInvitation(
							email.toLowerCase(),
							project.owner.name || project.owner.email,
							project.title,
							existingInvitation.token
						);
						console.log(`✅ Email d'invitation renvoyé à ${email.toLowerCase()}`);
					} catch (emailError) {
						console.warn('Erreur envoi email:', emailError);
						// Continuer même si l'email échoue
						return res.json({
							type: 'resent_no_email',
							message: 'Invitation existante',
							invitationUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/invite/${existingInvitation.token}`,
							note: 'Configuration email requise pour l\'envoi automatique'
						});
					}

					return res.json({
						type: 'resent',
						message: 'Invitation renvoyée par email'
					});
				} else {
					// Supprimer l'ancienne invitation expirée
					await prisma.projectInvitation.delete({
						where: { id: existingInvitation.id }
					});
				}
			}

			// Créer une nouvelle invitation
			const token = emailService.generateInvitationToken();
			const expiresAt = new Date();
			expiresAt.setDate(expiresAt.getDate() + 7); // Expire dans 7 jours

			const invitation = await prisma.projectInvitation.create({
				data: {
					email: email.toLowerCase(),
					token,
					projectId,
					invitedById: currentUserId,
					expiresAt
				}
			});

			// Envoyer l'email d'invitation
			try {
				await emailService.sendProjectInvitation(
					email.toLowerCase(),
					project.owner.name || project.owner.email,
					project.title,
					token
				);
				console.log(`✅ Email d'invitation envoyé à ${email.toLowerCase()}`);
			} catch (emailError) {
				console.error('Erreur envoi email:', emailError);

				// Ne pas supprimer l'invitation si l'email échoue
				// L'utilisateur peut toujours utiliser le lien directement
				console.warn(`⚠️ Email non envoyé à ${email.toLowerCase()}, mais l'invitation est créée avec le token: ${token}`);

				return res.status(201).json({
					type: 'invitation_created',
					message: 'Invitation créée',
					invitationUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/invite/${token}`,
					note: 'Configuration email requise pour l\'envoi automatique'
				});
			}

			res.status(201).json({
				type: 'invitation_sent',
				message: 'Invitation envoyée par email'
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

			// Récupérer l'utilisateur connecté
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

			// Vérifier que l'email de l'invitation correspond à l'utilisateur connecté
			if (invitation.email.toLowerCase() !== user.email.toLowerCase()) {
				return res.status(403).json({ error: "Cette invitation n'est pas pour votre compte." });
			}

			// Vérifier si l'utilisateur n'est pas déjà membre
			const existingMember = await prisma.projectMember.findUnique({
				where: {
					userId_projectId: {
						userId,
						projectId: invitation.projectId
					}
				}
			});

			if (existingMember) {
				// Marquer l'invitation comme acceptée même si l'utilisateur est déjà membre
				await prisma.projectInvitation.update({
					where: { id: invitation.id },
					data: { acceptedAt: new Date() }
				});

				return res.status(400).json({ error: "Vous êtes déjà membre de ce projet." });
			}

			// Transaction pour ajouter le membre et marquer l'invitation comme acceptée
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

			// Récupérer l'utilisateur connecté
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

			// Vérifier que l'email de l'invitation correspond à l'utilisateur connecté
			if (invitation.email.toLowerCase() !== user.email.toLowerCase()) {
				return res.status(403).json({ error: "Cette invitation n'est pas pour votre compte." });
			}

			// Marquer l'invitation comme déclinée au lieu de la supprimer
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
				orderBy: { createdAt: 'desc' }
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
			console.log(`🔍 Recherche des invitations pour l'utilisateur ${currentUserId}`);

			// Récupérer l'utilisateur pour obtenir son email
			const user = await prisma.user.findUnique({
				where: { id: currentUserId },
				select: { email: true }
			});

			if (!user) {
				console.log(`❌ Utilisateur ${currentUserId} non trouvé`);
				return res.status(404).json({ error: "Utilisateur non trouvé." });
			}

			console.log(`📧 Recherche des invitations pour l'email: ${user.email}`);

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
				orderBy: { createdAt: 'desc' }
			});

			console.log(`📨 Trouvé ${invitations.length} invitation(s) pour ${user.email}`);

			// Formater les données pour correspondre à l'interface InvitationInfo
			const formattedInvitations = invitations.map(inv => ({
				email: inv.email,
				project: inv.project,
				invitedBy: inv.invitedBy,
				expiresAt: inv.expiresAt.toISOString(),
				token: inv.token
			}));

			res.json(formattedInvitations);

		} catch (err) {
			console.error('❌ Erreur lors de la récupération des invitations utilisateur:', err);
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
				orderBy: { createdAt: 'desc' }
			});

			// Grouper les invitations par statut
			const pending = invitations.filter(inv => !inv.acceptedAt && !inv.declinedAt && inv.expiresAt > new Date());
			const accepted = invitations.filter(inv => inv.acceptedAt);
			const declined = invitations.filter(inv => inv.declinedAt);
			const expired = invitations.filter(inv => !inv.acceptedAt && !inv.declinedAt && inv.expiresAt <= new Date());

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
	}
};
