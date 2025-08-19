import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Mail, Users, Check, X, Loader2, AlertCircle, ExternalLink } from "lucide-react";
import { invitationService, InvitationInfo } from "../services/invitation";
import { useAuth } from "../contexts/AuthContext";
import InvitationAcceptSkeleton from "../components/skeleton/InvitationAcceptSkeleton";

const InvitationAcceptPage: React.FC = () => {
	const { token } = useParams({ from: "/invite/$token" });
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { user, isAuthenticated } = useAuth();

	const [invitation, setInvitation] = useState<InvitationInfo | null>(null);
	const [loading, setLoading] = useState(true);
	const [accepting, setAccepting] = useState(false);
	const [declining, setDeclining] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const [declined, setDeclined] = useState(false);

	const loadInvitation = React.useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const invitationData = await invitationService.getInvitationInfo(token);
			setInvitation(invitationData);
		} catch (err: unknown) {
			setError((err as Error).message);
		} finally {
			setLoading(false);
		}
	}, [token]);

	useEffect(() => {
		loadInvitation();
	}, [loadInvitation]);

	const handleAcceptInvitation = async () => {
		if (!isAuthenticated || !user) {
			navigate({
				to: "/login",
				search: {
					redirect: `/invite/${token}`,
					message: "Connectez-vous pour accepter l'invitation"
				}
			});
			return;
		}

		if (user.email.toLowerCase() !== invitation?.email.toLowerCase()) {
			setError("Cette invitation n'est pas pour votre compte. Vous devez vous connecter avec l'email " + invitation?.email);
			return;
		}

		try {
			setAccepting(true);
			setError(null);
			await invitationService.acceptInvitation(token);
			setSuccess(true);

			// Invalider les caches pour que l'utilisateur voit bien ses nouveaux projets
			queryClient.invalidateQueries({ queryKey: ['projects'] });
			queryClient.invalidateQueries({ queryKey: ['projects', invitation?.project.id] });
			queryClient.invalidateQueries({ queryKey: ['user', 'invitations'] });

			setTimeout(() => {
				navigate({ to: `/projects/${invitation?.project.id}` });
			}, 2000);
		} catch (err: unknown) {
			setError((err as Error).message);
		} finally {
			setAccepting(false);
		}
	};

	const handleDeclineInvitation = async () => {
		if (!isAuthenticated || !user) {
			navigate({
				to: "/login",
				search: {
					redirect: `/invite/${token}`,
					message: "Connectez-vous pour décliner l'invitation"
				}
			});
			return;
		}

		if (user.email.toLowerCase() !== invitation?.email.toLowerCase()) {
			setError("Cette invitation n'est pas pour votre compte.");
			return;
		}

		try {
			setDeclining(true);
			setError(null);
			await invitationService.declineInvitation(token);
			setDeclined(true);

			// Invalider le cache des invitations
			queryClient.invalidateQueries({ queryKey: ['user', 'invitations'] });

			setTimeout(() => {
				navigate({ to: "/" });
			}, 2000);
		} catch (err: unknown) {
			setError((err as Error).message);
		} finally {
			setDeclining(false);
		}
	};

	if (loading) {
		return <InvitationAcceptSkeleton />;
	}

	if (error && !invitation) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center p-6">
				<div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
					<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
						<X className="w-8 h-8 text-red-600" />
					</div>
					<h2 className="text-2xl font-bold text-gray-900 mb-4">
						Invitation non valide
					</h2>
					<p className="text-gray-600 mb-6">
						{error}
					</p>
					<Link
						to="/"
						className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
					>
						<span>Retour à l'accueil</span>
						<ExternalLink className="w-4 h-4" />
					</Link>
				</div>
			</div>
		);
	}

	if (success) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-6">
				<div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
					<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
						<Check className="w-8 h-8 text-green-600" />
					</div>
					<h2 className="text-2xl font-bold text-gray-900 mb-4">
						Invitation acceptée !
					</h2>
					<p className="text-gray-600 mb-6">
						Vous êtes maintenant membre du projet <strong>{invitation?.project.title}</strong>.
						Redirection en cours...
					</p>
					<div className="flex items-center justify-center space-x-2 text-blue-600">
						<Loader2 className="w-4 h-4 animate-spin" />
						<span className="text-sm">Redirection vers le projet</span>
					</div>
				</div>
			</div>
		);
	}

	if (declined) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50 flex items-center justify-center p-6">
				<div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
					<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
						<X className="w-8 h-8 text-gray-600" />
					</div>
					<h2 className="text-2xl font-bold text-gray-900 mb-4">
						Invitation déclinée
					</h2>
					<p className="text-gray-600 mb-6">
						Vous avez décliné l'invitation pour le projet <strong>{invitation?.project.title}</strong>.
						Redirection en cours...
					</p>
					<div className="flex items-center justify-center space-x-2 text-gray-600">
						<Loader2 className="w-4 h-4 animate-spin" />
						<span className="text-sm">Retour à l'accueil</span>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-6">
			<div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
				{/* En-tête */}
				<div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white text-center">
					<div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
						<Mail className="w-8 h-8" />
					</div>
					<h1 className="text-2xl font-bold mb-2">
						Invitation à rejoindre un projet
					</h1>
					<p className="text-blue-100">
						Vous avez été invité(e) à collaborer
					</p>
				</div>

				{/* Contenu */}
				<div className="p-8">
					{invitation && (
						<div className="space-y-6">
							{/* Informations du projet */}
							<div className="bg-gray-50 rounded-xl p-6">
								<h2 className="text-xl font-bold text-gray-900 mb-2">
									{invitation.project.title}
								</h2>
								{invitation.project.description && (
									<p className="text-gray-600 mb-4">
										{invitation.project.description}
									</p>
								)}
								<div className="flex items-center space-x-2 text-sm text-gray-500">
									<Users className="w-4 h-4" />
									<span>
										Invité par {invitation.invitedBy.name || invitation.invitedBy.email}
									</span>
								</div>
							</div>

							{/* Informations sur l'invitation */}
							<div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
								<p className="text-blue-800 text-sm">
									<strong>Email d'invitation :</strong> {invitation.email}
								</p>
								<p className="text-blue-600 text-xs mt-1">
									Expire le {new Date(invitation.expiresAt).toLocaleDateString('fr-FR', {
										day: 'numeric',
										month: 'long',
										year: 'numeric',
										hour: '2-digit',
										minute: '2-digit'
									})}
								</p>
							</div>

							{/* Messages d'erreur */}
							{error && (
								<div className="bg-red-50 border border-red-200 rounded-xl p-4">
									<div className="flex items-center space-x-2">
										<AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
										<p className="text-red-700 text-sm">{error}</p>
									</div>
								</div>
							)}

							{/* Actions */}
							<div className="space-y-4">
								{!isAuthenticated ? (
									<div className="text-center">
										<p className="text-gray-600 mb-4">
											Vous devez être connecté pour accepter cette invitation.
										</p>
										<div className="flex space-x-3">
											<Link
												to="/login"
												search={{ redirect: `/invite/${token}` }}
												className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors text-center font-medium"
											>
												Se connecter
											</Link>
											<Link
												to="/register"
												search={{ redirect: `/invite/${token}` }}
												className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-colors text-center font-medium"
											>
												S'inscrire
											</Link>
										</div>
									</div>
								) : (
									<div className="flex space-x-3">
										<button
											onClick={handleAcceptInvitation}
											disabled={accepting || declining}
											className="flex-1 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-medium"
										>
											{accepting ? (
												<>
													<Loader2 className="w-4 h-4 animate-spin" />
													<span>Acceptation en cours...</span>
												</>
											) : (
												<>
													<Check className="w-4 h-4" />
													<span>Accepter</span>
												</>
											)}
										</button>
										<button
											onClick={handleDeclineInvitation}
											disabled={accepting || declining}
											className="flex-1 bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-medium"
										>
											{declining ? (
												<>
													<Loader2 className="w-4 h-4 animate-spin" />
													<span>Refus en cours...</span>
												</>
											) : (
												<>
													<X className="w-4 h-4" />
													<span>Décliner</span>
												</>
											)}
										</button>
									</div>
								)}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default InvitationAcceptPage;
