import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Clock, Check, X, History, Mail, Calendar, User } from "lucide-react";
import { invitationService } from "../services/invitation";

interface InvitationHistoryProps {
	projectId: number;
	isOwner?: boolean;
}

const InvitationHistory: React.FC<InvitationHistoryProps> = ({ projectId, isOwner = false }) => {
	const [activeTab, setActiveTab] = useState<'accepted' | 'declined' | 'expired'>('accepted');

	const {
		data: history,
		isLoading,
		isError,
		error,
	} = useQuery({
		queryKey: ['project-invitations-history', projectId],
		queryFn: () => invitationService.getProjectInvitationsHistory(projectId),
		enabled: isOwner,
	});

	if (!isOwner) {
		return null;
	}

	if (isLoading) {
		return (
			<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
				<div className="flex items-center space-x-3 mb-4">
					<div className="p-2 bg-gray-100 rounded-lg">
						<History className="w-5 h-5 text-gray-600" />
					</div>
					<div>
						<h3 className="text-lg font-semibold text-gray-900">Historique des invitations</h3>
						<p className="text-sm text-gray-600">Chargement...</p>
					</div>
				</div>
			</div>
		);
	}

	if (isError || !history) {
		return (
			<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
				<div className="flex items-center space-x-3 mb-4">
					<div className="p-2 bg-red-100 rounded-lg">
						<X className="w-5 h-5 text-red-600" />
					</div>
					<div>
						<h3 className="text-lg font-semibold text-gray-900">Historique des invitations</h3>
						<p className="text-sm text-red-600">
							{error instanceof Error ? error.message : "Erreur lors du chargement"}
						</p>
					</div>
				</div>
			</div>
		);
	}

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('fr-FR', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case 'accepted':
				return <Check className="w-4 h-4 text-green-600" />;
			case 'declined':
				return <X className="w-4 h-4 text-red-600" />;
			case 'expired':
				return <Clock className="w-4 h-4 text-gray-600" />;
			default:
				return <Mail className="w-4 h-4 text-gray-600" />;
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'accepted':
				return 'bg-green-100 text-green-800 border-green-200';
			case 'declined':
				return 'bg-red-100 text-red-800 border-red-200';
			case 'expired':
				return 'bg-gray-100 text-gray-800 border-gray-200';
			default:
				return 'bg-gray-100 text-gray-800 border-gray-200';
		}
	};

	const getStatusLabel = (status: string) => {
		switch (status) {
			case 'accepted':
				return 'Acceptée';
			case 'declined':
				return 'Déclinée';
			case 'expired':
				return 'Expirée';
			default:
				return 'Inconnue';
		}
	};

	const tabs = [
		{ key: 'accepted' as const, label: 'Acceptées', count: history.accepted.length },
		{ key: 'declined' as const, label: 'Déclinées', count: history.declined.length },
		{ key: 'expired' as const, label: 'Expirées', count: history.expired.length },
	];

	const currentInvitations = history[activeTab] || [];

	return (
		<div className="bg-white rounded-xl shadow-sm border border-gray-200">
			{/* En-tête */}
			<div className="p-6 border-b border-gray-200">
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-3">
						<div className="p-2 bg-indigo-100 rounded-lg">
							<History className="w-5 h-5 text-indigo-600" />
						</div>
						<div>
							<h3 className="text-lg font-semibold text-gray-900">
								Historique des invitations
							</h3>
							<p className="text-sm text-gray-600">
								{history.total} invitation{history.total > 1 ? 's' : ''} au total
							</p>
						</div>
					</div>
				</div>

				{/* Onglets */}
				<div className="mt-4">
					<div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
						{tabs.map((tab) => (
							<button
								key={tab.key}
								onClick={() => setActiveTab(tab.key)}
								className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${activeTab === tab.key
									? 'bg-white text-gray-900 shadow-sm'
									: 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
									}`}
							>
								{tab.label} ({tab.count})
							</button>
						))}
					</div>
				</div>
			</div>

			{/* Contenu */}
			<div className="p-6">
				{currentInvitations.length === 0 ? (
					<div className="text-center py-8">
						<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
							{getStatusIcon(activeTab)}
						</div>
						<h4 className="text-lg font-medium text-gray-900 mb-2">
							Aucune invitation {getStatusLabel(activeTab).toLowerCase()}
						</h4>
						<p className="text-gray-600 text-sm">
							{activeTab === 'accepted' && "Aucune invitation n'a encore été acceptée."}
							{activeTab === 'declined' && "Aucune invitation n'a été déclinée."}
							{activeTab === 'expired' && "Aucune invitation n'a expiré."}
						</p>
					</div>
				) : (
					<div className="space-y-4">
						{currentInvitations.map((invitation) => (
							<div
								key={invitation.id}
								className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
							>
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<div className="flex items-center space-x-3 mb-2">
											<Mail className="w-4 h-4 text-gray-400" />
											<span className="font-medium text-gray-900">
												{invitation.email}
											</span>
											<span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(activeTab)}`}>
												{getStatusLabel(activeTab)}
											</span>
										</div>

										<div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
											<div className="flex items-center space-x-2">
												<User className="w-3 h-3" />
												<span>Invité par {invitation.invitedBy.name || invitation.invitedBy.email}</span>
											</div>
											<div className="flex items-center space-x-2">
												<Calendar className="w-3 h-3" />
												<span>Créée le {formatDate(invitation.createdAt)}</span>
											</div>
											<div className="flex items-center space-x-2">
												<Clock className="w-3 h-3" />
												<span>Expire le {formatDate(invitation.expiresAt)}</span>
											</div>
											{invitation.acceptedAt && (
												<div className="flex items-center space-x-2">
													<Check className="w-3 h-3 text-green-600" />
													<span>Acceptée le {formatDate(invitation.acceptedAt)}</span>
												</div>
											)}
											{invitation.declinedAt && (
												<div className="flex items-center space-x-2">
													<X className="w-3 h-3 text-red-600" />
													<span>Déclinée le {formatDate(invitation.declinedAt)}</span>
												</div>
											)}
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default InvitationHistory;
