import nodemailer from 'nodemailer';
import crypto from 'crypto';

export interface EmailConfig {
	host: string;
	port: number;
	secure: boolean;
	auth: {
		user: string;
		pass: string;
	};
}

export class EmailService {
	private transporter: nodemailer.Transporter;

	constructor() {
		// Configuration SMTP - à adapter selon votre fournisseur
		this.transporter = nodemailer.createTransport({
			host: process.env.SMTP_HOST || 'localhost',
			port: parseInt(process.env.SMTP_PORT || '587'),
			secure: process.env.SMTP_SECURE === 'true',
			auth: {
				user: process.env.SMTP_USER || '',
				pass: process.env.SMTP_PASSWORD || '',
			},
		});
	}

	/**
	 * Génère un token sécurisé pour l'invitation
	 */
	generateInvitationToken(): string {
		return crypto.randomBytes(32).toString('hex');
	}

	/**
	 * Envoie un email d'invitation à rejoindre un projet
	 */
	async sendProjectInvitation(
		recipientEmail: string,
		inviterName: string,
		projectTitle: string,
		invitationToken: string
	): Promise<void> {
		const invitationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/invite/${invitationToken}`;

		const mailOptions = {
			from: `"${process.env.APP_NAME || 'Agileboard'}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
			to: recipientEmail,
			subject: `Invitation à rejoindre le projet "${projectTitle}"`,
			html: this.getInvitationEmailTemplate(inviterName, projectTitle, invitationUrl),
		};

		try {
			await this.transporter.sendMail(mailOptions);
			console.log(`✅ Email d'invitation envoyé à ${recipientEmail}`);
		} catch (error) {
			console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
			throw new Error('Impossible d\'envoyer l\'email d\'invitation');
		}
	}

	/**
	 * Template HTML pour l'email d'invitation
	 */
	private getInvitationEmailTemplate(
		inviterName: string,
		projectTitle: string,
		invitationUrl: string
	): string {
		return `
		<!DOCTYPE html>
		<html lang="fr">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Invitation à rejoindre un projet</title>
			<style>
				body {
					font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
					line-height: 1.6;
					color: #333;
					background-color: #f8f9fa;
					margin: 0;
					padding: 20px;
				}
				.container {
					max-width: 600px;
					margin: 0 auto;
					background: white;
					border-radius: 12px;
					overflow: hidden;
					box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
				}
				.header {
					background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
					color: white;
					padding: 30px;
					text-align: center;
				}
				.header h1 {
					margin: 0;
					font-size: 28px;
					font-weight: 600;
				}
				.content {
					padding: 40px 30px;
				}
				.content h2 {
					color: #2d3748;
					margin-bottom: 20px;
					font-size: 24px;
				}
				.project-info {
					background: #f7fafc;
					border-left: 4px solid #667eea;
					padding: 20px;
					margin: 20px 0;
					border-radius: 4px;
				}
				.project-info strong {
					color: #667eea;
				}
				.cta-button {
					display: inline-block;
					background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
					color: white;
					text-decoration: none;
					padding: 15px 30px;
					border-radius: 8px;
					font-weight: 600;
					margin: 20px 0;
					text-align: center;
					box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
					transition: transform 0.2s;
				}
				.cta-button:hover {
					transform: translateY(-2px);
				}
				.footer {
					background: #edf2f7;
					padding: 20px 30px;
					text-align: center;
					color: #718096;
					font-size: 14px;
				}
				.small-text {
					font-size: 14px;
					color: #718096;
					margin-top: 20px;
				}
			</style>
		</head>
		<body>
			<div class="container">
				<div class="header">
					<h1>🎯 Agileboard</h1>
				</div>
				<div class="content">
					<h2>Vous êtes invité(e) à rejoindre un projet !</h2>

					<p>Bonjour,</p>

					<p><strong>${inviterName}</strong> vous invite à collaborer sur un projet passionnant :</p>

					<div class="project-info">
						<strong>Projet :</strong> ${projectTitle}
					</div>

					<p>Rejoignez l'équipe pour collaborer efficacement, suivre l'avancement des tâches et contribuer au succès du projet.</p>

					<div style="text-align: center; margin: 30px 0;">
						<a href="${invitationUrl}" class="cta-button">
							Accepter l'invitation
						</a>
					</div>

					<div class="small-text">
						<p><strong>Lien d'invitation :</strong></p>
						<p><a href="${invitationUrl}">${invitationUrl}</a></p>
						<p><em>Cette invitation expire dans 7 jours.</em></p>
					</div>
				</div>
				<div class="footer">
					<p>Si vous n'attendiez pas cette invitation, vous pouvez ignorer cet email.</p>
					<p>&copy; ${new Date().getFullYear()} Agileboard - Gestion de projets agile</p>
				</div>
			</div>
		</body>
		</html>
		`;
	}

	/**
	 * Vérifie si le service email est configuré correctement
	 */
	async verifyConnection(): Promise<boolean> {
		try {
			await this.transporter.verify();
			console.log('✅ Service email configuré correctement');
			return true;
		} catch (error) {
			console.warn('⚠️ Service email non configuré - les invitations ne seront pas envoyées');
			return false;
		}
	}
}

export const emailService = new EmailService();
