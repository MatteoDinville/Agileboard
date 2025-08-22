import React, { useState } from "react";
import { Mail, UserPlus, X, Loader2, AlertCircle, Check, TriangleAlert } from "lucide-react";
import { invitationService } from "../services/invitation";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

interface InviteModalProps {
	projectId: number;
	isOpen: boolean;
	onClose: () => void;
}

const InviteModal: React.FC<InviteModalProps> = ({ projectId, isOpen, onClose }) => {
	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const queryClient = useQueryClient();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!email || !email.includes('@')) {
			setError("Veuillez saisir un email valide");
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			const response = await invitationService.sendInvitation(projectId, email);

			queryClient.invalidateQueries({ queryKey: ['project-members', projectId] });
			queryClient.invalidateQueries({ queryKey: ['project-invitations', projectId] });

			if (response.type === 'invitation_created' || response.type === 'invitation_sent') {
				toast.success(' Invitation envoyée avec succès !', {
					duration: 5000,
					icon: <Check className="text-green-500" />,
					style: {
						background: '#DCFCE7',
					}
				});
			} else if (response.type === 'pending_invitation_exists') {
				toast('Une invitation est déjà en attente pour cet email.', {
					duration: 6000,
					icon: <TriangleAlert className="text-yellow-500" />,
					style: {
						background: '#FFEDD5',
					},
				});
			}

			setTimeout(() => {
				handleClose();
			}, 500);

		} catch (err: unknown) {
			const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';

			if (errorMessage.includes('vous-même') || errorMessage.includes('propre projet')) {
				setError(errorMessage);
			}
			else if (errorMessage.includes('déjà membre du projet')) {
				setError(errorMessage);
			}
			else {
				setError(errorMessage);
				toast.error(`❌ ${errorMessage}`, {
					duration: 6000,
				});
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handleClose = () => {
		setEmail("");
		setError(null);
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-gradient-to-br from-slate-900/20 via-gray-900/40 to-slate-900/20 dark:[background-image:none] dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
			<div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl dark:shadow-black/30 max-w-md w-full mx-4 transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto">
				<div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:[background-image:none] dark:bg-gray-800 rounded-t-2xl">
					<div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
						<div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex-shrink-0">
							<Mail className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
						</div>
						<h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">Inviter un nouvel utilisateur</h3>
					</div>
					<button
						onClick={handleClose}
						className="p-1.5 sm:p-2 text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-all duration-200 cursor-pointer flex-shrink-0"
					>
						<X className="w-4 h-4 sm:w-5 sm:h-5" />
					</button>
				</div>

				{/* Contenu */}
				<div className="p-4 sm:p-6">
					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 sm:mb-3">
								Adresse email
							</label>
							<input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="exemple@email.com"
								className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-400 font-medium transition-all duration-200 text-sm sm:text-base"
								disabled={isLoading}
								required
							/>
						</div>

						{/* Messages d'erreur */}
						{error && (
							<div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-xl">
								<AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0" />
								<p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
							</div>
						)}

						{/* Description */}
						<div className="bg-yellow-50 dark:bg-yellow-950/40 p-3 sm:p-4 rounded-xl border border-yellow-200 dark:border-yellow-900 flex items-start space-x-2 sm:space-x-3">
							<AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 mt-0.5 sm:mt-1 flex-shrink-0" />
							<div>
								<h4 className="text-sm font-semibold text-yellow-700 dark:text-yellow-300 mb-1 sm:mb-2">Attention</h4>
								<p className="text-xs text-yellow-700 dark:text-yellow-300">
									L'adresse email saisie doit correspondre à un utilisateur ayant déjà un compte sur la plateforme.
								</p>
							</div>
						</div>

						{/* Actions */}
						<div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
							<button
								type="button"
								onClick={handleClose}
								className="flex-1 px-4 sm:px-6 py-2.5 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 border-2 border-transparent dark:border-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 font-medium cursor-pointer text-sm sm:text-base"
								disabled={isLoading}
							>
								Annuler
							</button>
							<button
								type="submit"
								disabled={isLoading || !email.trim()}
								className="flex-1 px-4 sm:px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 dark:[background-image:none] dark:bg-blue-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 dark:hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-medium shadow-lg dark:shadow-black/20 hover:shadow-xl transform hover:scale-105 disabled:transform-none cursor-pointer text-sm sm:text-base"
							>
								{isLoading ? (
									<>
										<Loader2 className="w-4 h-4 animate-spin" />
										<span>Envoi en cours...</span>
									</>
								) : (
									<>
										<UserPlus className="w-4 h-4" />
										<span>Inviter</span>
									</>
								)}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default InviteModal;
