import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Check, X, Clock, Mail } from "lucide-react";
import { invitationService } from "../services/invitation";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";


const UserInvitationsNotifications: React.FC = () => {
	const { user, isAuthenticated } = useAuth();
	const queryClient = useQueryClient();
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const { data: invitations = [], isLoading } = useQuery({
		queryKey: ['user', 'invitations'],
		queryFn: invitationService.getUserInvitations,
		enabled: isAuthenticated && !!user,
		refetchInterval: 30000,
	});

	const acceptMutation = useMutation({
		mutationFn: (token: string) => invitationService.acceptInvitation(token),
		onSuccess: (_, token) => {
			queryClient.invalidateQueries({ queryKey: ['user', 'invitations'] });
			queryClient.invalidateQueries({ queryKey: ['projects'] });

			const invitation = invitations.find(inv => inv.token === token);
			const projectName = invitation?.project?.title || 'le projet';

			const toastMessageAccept = <p className="text-green-500">
				Vous avez rejoint le projet <span className="font-bold">{projectName}</span> avec succès 🎉 !
			</p>
			toast.success(<div>
				{toastMessageAccept}
			</div>, {
				icon: <Check className="text-green-500 w-10 h-10" />,
				duration: 5000,
				style: {
					background: '#DCFCE7',
				},
			});

			setIsOpen(false);
		},
		onError: (error: unknown) => {
			const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'acceptation de l\'invitation';
			toast.error(`❌ ${errorMessage}`, {
				duration: 5000,
			});
		},
	});

	const declineMutation = useMutation({
		mutationFn: (token: string) => invitationService.declineInvitation(token),
		onSuccess: (_, token) => {
			queryClient.invalidateQueries({ queryKey: ['user', 'invitations'] });

			const invitation = invitations.find(inv => inv.token === token);
			const projectName = invitation?.project?.title || 'le projet';

			const toastMessageDecline = <p className="text-green-500">
				Invitation à <span className="font-bold">{projectName}</span> déclinée
			</p>
			toast.success(<div>
				{toastMessageDecline}
			</div>, {
				icon: '✋',
				duration: 4000,
				style: {
					background: '#DCFCE7',
				},
			});
		},
		onError: (error: unknown) => {
			const errorMessage = error instanceof Error ? error.message : 'Erreur lors du refus de l\'invitation';
			toast.error(`❌ ${errorMessage}`, {
				duration: 5000,
			});
		},
	});

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	const handleAcceptInvitation = (token: string) => {
		acceptMutation.mutate(token);
	};

	const handleDeclineInvitation = (token: string) => {
		declineMutation.mutate(token);
	};

	const toggleDropdown = () => {
		setIsOpen(!isOpen);
	};

	if (!isAuthenticated || isLoading) {
		return null;
	}

	const hasInvitations = invitations && invitations.length > 0;

	return (
		<div className="relative" ref={dropdownRef}>
			<button
				onClick={toggleDropdown}
				className="relative p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-300"
			>
				<Bell className="w-5 h-5" />
				{hasInvitations && (
					<div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
						{invitations.length}
					</div>
				)}
			</button>

			{isOpen && (
				<div className="absolute top-12 right-0 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
					<div className="p-4 border-b border-gray-200">
						<h3 className="font-semibold text-gray-900 flex items-center space-x-2">
							<Mail className="w-4 h-4" />
							<span>Invitations en attente</span>
						</h3>
						<p className="text-sm text-gray-600">
							{hasInvitations
								? `${invitations.length} invitation${invitations.length > 1 ? 's' : ''} à rejoindre des projets`
								: 'Aucune invitation en attente'
							}
						</p>
					</div>

					<div className="max-h-64 overflow-y-auto">
						{hasInvitations ? (
							invitations.map((invitation) => (
								<div key={invitation.token} className="p-4 border-b border-gray-100 hover:bg-gray-50">
									<div className="space-y-2">
										<div>
											<h4 className="font-medium text-gray-900">
												{invitation.project.title}
											</h4>
											{invitation.project.description && (
												<p className="text-sm text-gray-600 line-clamp-2">
													{invitation.project.description}
												</p>
											)}
										</div>

										<div className="flex items-center space-x-2 text-xs text-gray-500">
											<span>Invité par {invitation.invitedBy.name || invitation.invitedBy.email}</span>
										</div>

										<div className="flex items-center space-x-2 text-xs text-gray-500">
											<Clock className="w-3 h-3" />
											<span>
												Expire le {new Date(invitation.expiresAt).toLocaleDateString('fr-FR')}
											</span>
										</div>

										<div className="flex space-x-2 pt-2">
											<button
												onClick={() => handleAcceptInvitation(invitation.token!)}
												disabled={acceptMutation.isPending || declineMutation.isPending}
												className="flex-1 bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-1 text-sm cursor-pointer"
											>
												<Check className="w-3 h-3" />
												<span>Accepter</span>
											</button>
											<button
												onClick={() => handleDeclineInvitation(invitation.token!)}
												disabled={acceptMutation.isPending || declineMutation.isPending}
												className="flex-1 bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-1 text-sm cursor-pointer"
											>
												<X className="w-3 h-3" />
												<span>Décliner</span>
											</button>
										</div>
									</div>
								</div>
							))
						) : (
							<div className="p-8 text-center text-gray-500">
								<Mail className="w-8 h-8 mx-auto mb-2 opacity-50" />
								<p className="text-sm">Aucune invitation en attente</p>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default UserInvitationsNotifications;
