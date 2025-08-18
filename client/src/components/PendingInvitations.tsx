import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Mail, Clock, User, Loader2, AlertCircle, Trash2, RefreshCw } from "lucide-react";
import { invitationService, ProjectInvitation } from "../services/invitation";

interface PendingInvitationsProps {
	projectId: number;
	isOwner?: boolean;
}

const PendingInvitations: React.FC<PendingInvitationsProps> = ({ projectId, isOwner = false }) => {
	const {
		data: invitations,
		isLoading,
		error
	} = useQuery<ProjectInvitation[]>({
		queryKey: ['project-invitations', projectId],
		queryFn: () => invitationService.getProjectInvitations(projectId),
		enabled: isOwner,
	});

	const deleteInvitationMutation = useMutation({
		mutationFn: ({ invitationId }: { invitationId: number }) =>
			invitationService.deleteInvitation(projectId, invitationId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['project-invitations', projectId] });
			toast.success('🗑️ Invitation supprimée avec succès !', {
				duration: 4000,
			});
		},
		onError: (error: Error) => {
			toast.error(`❌ ${error.message}`, {
				duration: 6000,
			});
		}
	});


	const handleDeleteInvitation = (invitationId: number, email: string) => {
		if (confirm(`Voulez-vous vraiment supprimer l'invitation pour ${email} ?`)) {
			deleteInvitationMutation.mutate({ invitationId });
		}
	};

	if (!isOwner) {
		return null;
	}

	if (isLoading) {
		return (
			<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
				<div className="flex items-center justify-center py-4">
					<Loader2 className="w-5 h-5 animate-spin text-blue-600" />
					<span className="ml-2 text-gray-600 text-sm">Chargement des invitations...</span>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="bg-white rounded-xl shadow-sm border border-red-200 p-3 sm:p-4">
				<div className="flex items-center space-x-2 text-red-600">
					<AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
					<span className="text-xs sm:text-sm">Erreur lors du chargement des invitations</span>
				</div>
			</div>
		);
	}

	if (!invitations || invitations.length === 0) {
		return null;
	}

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('fr-FR', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	const getTimeUntilExpiry = (expiresAt: string) => {
		const now = new Date();
		const expiry = new Date(expiresAt);
		const diffTime = expiry.getTime() - now.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		if (diffDays <= 0) {
			return "Expirée";
		} else if (diffDays === 1) {
			return "Expire demain";
		} else {
			return `Expire dans ${diffDays} jours`;
		}
	};

	return (
		<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
			<div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
				<div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-100 rounded-lg flex items-center justify-center">
					<Clock className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600" />
				</div>
				<div>
					<h3 className="text-base sm:text-lg font-semibold text-gray-900">
						Invitations en attente
					</h3>
					<p className="text-xs sm:text-sm text-gray-500">
						{invitations.length} invitation{invitations.length > 1 ? 's' : ''} en attente de réponse
					</p>
				</div>
			</div>

			<div className="space-y-2 sm:space-y-3">
				{invitations.map((invitation) => (
					<div
						key={invitation.id}
						className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-100 hover:shadow-md transition-all duration-200 space-y-3 sm:space-y-0"
					>
						<div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
							<div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
								<Mail className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
							</div>
							<div className="flex-1 min-w-0">
								<p className="font-medium text-gray-900 truncate text-sm sm:text-base">
									{invitation.email}
								</p>
								<div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 mt-1">
									<div className="flex items-center space-x-1 text-xs text-gray-500">
										<User className="w-3 h-3 flex-shrink-0" />
										<span className="truncate">Invité par {invitation.invitedBy.name || invitation.invitedBy.email}</span>
									</div>
									<div className="flex items-center space-x-1 text-xs text-gray-500">
										<Clock className="w-3 h-3 flex-shrink-0" />
										<span>{formatDate(invitation.createdAt)}</span>
									</div>
								</div>
							</div>
						</div>

						<div className="flex items-center gap-2 sm:gap-3">
							{/* Statut d'expiration */}
							<span className={`px-2 py-1 rounded-full text-xs font-medium ${getTimeUntilExpiry(invitation.expiresAt) === "Expirée"
								? "bg-red-100 text-red-700"
								: getTimeUntilExpiry(invitation.expiresAt).includes("demain")
									? "bg-yellow-100 text-yellow-700"
									: "bg-green-100 text-green-700"
								}`}>
								{getTimeUntilExpiry(invitation.expiresAt)}
							</span>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default PendingInvitations;
