import React, { useState } from "react";
import { useProjectMembers, useRemoveProjectMember } from "../utils/hooks/project";
import { Mail, Loader2, Users, UserMinus } from "lucide-react";
import InviteModal from "./InviteModal";
import PendingInvitations from "./PendingInvitations";
import InvitationHistory from "./InvitationHistory";
import { SectionLoader } from "./Loading";
import toast from "react-hot-toast";

interface MembersListOnlyProps {
	projectId: number;
	isOwner?: boolean;
}

const MembersListOnly: React.FC<MembersListOnlyProps> = ({ projectId, isOwner = false }) => {
	const [showInviteModal, setShowInviteModal] = useState(false);

	const { data: members, isLoading: membersLoading } = useProjectMembers(projectId);
	const removeMemberMutation = useRemoveProjectMember();

	const handleRemoveMember = (userId: number) => {
		try {
			if (confirm("Voulez-vous vraiment retirer ce membre du projet ?")) {
				removeMemberMutation.mutate({ projectId, userId });
				toast.success("Membre retiré avec succès", {
					icon: <UserMinus className="text-red-600 w-6 h-6" />,
					duration: 5000,
					style: {
						backgroundColor: "#ffebee",
						border: "1px solid #ef9a9a",
					},
				});
			}
		} catch {
			toast.error("Erreur lors de la suppression du membre");
		}
	};

	if (membersLoading) {
		return <SectionLoader label="Chargement des membres..." minHeight={180} />;
	}

	if (!members || members.length === 0) {
		return (
			<div className="space-y-4 sm:space-y-6">
				<PendingInvitations projectId={projectId} isOwner={isOwner} />

				<div className="text-center py-8 sm:py-12">
					<Users className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
					<p className="text-lg sm:text-xl font-medium text-gray-500 mb-2">Aucun membre</p>
					<p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">Ce projet n'a pas encore de membres</p>
					{isOwner && (
						<div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-4">
							<button
								onClick={() => setShowInviteModal(true)}
								className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-colors shadow-md hover:shadow-lg cursor-pointer text-sm sm:text-base"
							>
								<Mail className="w-4 h-4 sm:w-5 sm:h-5" />
								<span>Inviter un utilisateur</span>
							</button>
						</div>
					)}
				</div>

				<InviteModal
					projectId={projectId}
					isOpen={showInviteModal}
					onClose={() => setShowInviteModal(false)}
				/>
				<InvitationHistory projectId={projectId} isOwner={isOwner} />
			</div>
		);
	}

	return (
		<div className="w-full space-y-4 sm:space-y-6">
			<PendingInvitations projectId={projectId} isOwner={isOwner} />

			{isOwner && (
				<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
					<div>
						<h3 className="text-lg font-semibold text-gray-900">
							Membres du projet ({members?.length || 0})
						</h3>
					</div>
					<div className="flex space-x-3">
						<button
							onClick={() => setShowInviteModal(true)}
							className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-colors shadow-md hover:shadow-lg cursor-pointer text-sm sm:text-base"
						>
							<Mail className="w-4 h-4" />
							<span className="hidden sm:inline">Inviter un utilisateur</span>
							<span className="sm:hidden">Inviter</span>
						</button>
					</div>
				</div>
			)}

			<div className="space-y-3 sm:space-y-4">
				{members.map((member) => (
					<div
						key={member.id}
						className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 space-y-3 sm:space-y-0"
					>
						<div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
							<div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg flex-shrink-0">
								{member.user.name
									? member.user.name.charAt(0).toUpperCase()
									: member.user.email.charAt(0).toUpperCase()
								}
							</div>
							<div className="flex-1 min-w-0">
								<h3 className="font-semibold text-gray-900 text-base sm:text-lg truncate">
									{member.user.name || "Utilisateur"}
								</h3>
								<div className="flex items-center space-x-2 text-gray-600 mt-1">
									<Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
									<span className="text-xs sm:text-sm truncate">{member.user.email}</span>
								</div>
								<p className="text-xs text-gray-500 mt-2 bg-gray-50 px-2 sm:px-3 py-1 rounded-full inline-block">
									Membre depuis le {new Date(member.addedAt).toLocaleDateString('fr-FR', {
										day: 'numeric',
										month: 'long',
										year: 'numeric'
									})}
								</p>
							</div>
						</div>

						{isOwner && (
							<button
								onClick={() => handleRemoveMember(member.user.id)}
								disabled={removeMemberMutation.isPending}
								className="group relative p-2 sm:p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 disabled:opacity-50 cursor-pointer border border-transparent hover:border-red-200 self-end sm:self-auto"
								title="Retirer du projet"
							>
								{removeMemberMutation.isPending ? (
									<Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
								) : (
									<UserMinus className="w-4 h-4 sm:w-5 sm:h-5" />
								)}
								<span className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
									Retirer du projet
								</span>
							</button>
						)}
					</div>
				))}
			</div>

			<InviteModal
				projectId={projectId}
				isOpen={showInviteModal}
				onClose={() => setShowInviteModal(false)}
			/>
			<InvitationHistory projectId={projectId} isOwner={isOwner} />
		</div>
	);
};

export default MembersListOnly;
