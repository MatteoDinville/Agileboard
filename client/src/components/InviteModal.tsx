import React, { useState } from "react";
import { Mail, UserPlus, X, Loader2, Check, AlertCircle } from "lucide-react";
import { invitationService, InvitationResponse } from "../services/invitation";
import { useQueryClient } from "@tanstack/react-query";

interface InviteModalProps {
	projectId: number;
	isOpen: boolean;
	onClose: () => void;
}

const InviteModal: React.FC<InviteModalProps> = ({ projectId, isOpen, onClose }) => {
	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [result, setResult] = useState<InvitationResponse | null>(null);
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
		setResult(null);

		try {
			const response = await invitationService.sendInvitation(projectId, email);
			setResult(response);

			queryClient.invalidateQueries({ queryKey: ['project-members', projectId] });
			queryClient.invalidateQueries({ queryKey: ['project-invitations', projectId] });

			setTimeout(() => {
				setEmail("");
				setResult(null);
				if (response.type === 'direct_add') {
					onClose();
				}
			}, 2000);
		} catch (err: any) {
			setError(err.message);
		} finally {
			setIsLoading(false);
		}
	};

	const handleClose = () => {
		setEmail("");
		setError(null);
		setResult(null);
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-gradient-to-br from-slate-900/20 via-gray-900/40 to-slate-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
				{/* En-tête */}
				<div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
					<div className="flex items-center space-x-3">
						<div className="p-2 bg-blue-100 rounded-lg">
							<Mail className="w-5 h-5 text-blue-600" />
						</div>
						<h3 className="text-lg font-semibold text-gray-900">Inviter par email</h3>
					</div>
					<button
						onClick={handleClose}
						className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-all duration-200"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				{/* Contenu */}
				<div className="p-6">
					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-3">
								Adresse email
							</label>
							<input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="exemple@email.com"
								className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium transition-all duration-200"
								disabled={isLoading}
								required
							/>
						</div>

						{/* Messages de statut */}
						{error && (
							<div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-xl">
								<AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
								<p className="text-red-700 text-sm">{error}</p>
							</div>
						)}

						{result && (
							<div className={`flex items-center space-x-2 p-3 rounded-xl border ${result.type === 'direct_add'
								? 'bg-green-50 border-green-200'
								: 'bg-blue-50 border-blue-200'
								}`}>
								<Check className={`w-5 h-5 flex-shrink-0 ${result.type === 'direct_add' ? 'text-green-500' : 'text-blue-500'
									}`} />
								<div>
									<p className={`text-sm font-medium ${result.type === 'direct_add' ? 'text-green-700' : 'text-blue-700'
										}`}>
										{result.message}
									</p>
									{result.type === 'invitation_sent' && (
										<p className="text-xs text-gray-600 mt-1">
											Un email a été envoyé à cette adresse avec un lien d'invitation.
										</p>
									)}
									{result.type === 'resent' && (
										<p className="text-xs text-gray-600 mt-1">
											L'invitation a été renvoyée à cette adresse.
										</p>
									)}
								</div>
							</div>
						)}

						{/* Description */}
						<div className="bg-gray-50 p-4 rounded-xl">
							<h4 className="text-sm font-semibold text-gray-700 mb-2">Comment ça marche ?</h4>
							<ul className="text-xs text-gray-600 space-y-1">
								<li>• Si la personne a déjà un compte, elle sera ajoutée directement</li>
								<li>• Sinon, elle recevra un email d'invitation à rejoindre le projet</li>
								<li>• L'invitation expire dans 7 jours</li>
							</ul>
						</div>

						{/* Actions */}
						<div className="flex space-x-3 pt-4">
							<button
								type="button"
								onClick={handleClose}
								className="flex-1 px-6 py-2.5 text-gray-700 bg-gray-100 border-2 border-transparent rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
								disabled={isLoading}
							>
								Annuler
							</button>
							<button
								type="submit"
								disabled={isLoading || !email.trim()}
								className="flex-1 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
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
