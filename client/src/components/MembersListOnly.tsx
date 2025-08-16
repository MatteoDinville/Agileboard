import React, { useState } from "react";
import { useProjectMembers, useRemoveProjectMember, useAddProjectMember } from "../utils/hooks/project";
import { useAllUsers } from "../utils/hooks/user";
import { Mail, Loader2, Users, UserMinus, UserPlus, X, AlertCircle } from "lucide-react";
import InviteModal from "./InviteModal";
import PendingInvitations from "./PendingInvitations";
import InvitationHistory from "./InvitationHistory";

interface MembersListOnlyProps {
	projectId: number;
	isOwner?: boolean;
}

const MembersListOnly: React.FC<MembersListOnlyProps> = ({ projectId, isOwner = false }) => {
	const [showAddModal, setShowAddModal] = useState(false);
	const [showInviteModal, setShowInviteModal] = useState(false);
	const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

	const { data: members, isLoading: membersLoading } = useProjectMembers(projectId);
	const { data: allUsers, isLoading: usersLoading } = useAllUsers();
	const removeMemberMutation = useRemoveProjectMember();
	const addMemberMutation = useAddProjectMember();

	const availableUsers = allUsers?.filter(user =>
		!members?.some(member => member.user.id === user.id)
	) || [];

	const handleRemoveMember = (userId: number) => {
		if (confirm("Voulez-vous vraiment retirer ce membre du projet ?")) {
			removeMemberMutation.mutate({ projectId, userId });
		}
	};

	const handleAddMember = () => {
		if (selectedUserId && projectId) {
			addMemberMutation.mutate(
				{ projectId, userId: selectedUserId },
				{
					onSuccess: () => {
						setShowAddModal(false);
						setSelectedUserId(null);
					}
				}
			);
		}
	};

	if (membersLoading) {
		return (
			<div className="flex items-center justify-center p-8">
				<Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
				<span className="ml-2 text-gray-600">Chargement des membres...</span>
			</div>
		);
	}

	if (!members || members.length === 0) {
		return (
			<div className="space-y-6">
				<div className="text-center py-12">
					<Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
					<p className="text-xl font-medium text-gray-500 mb-2">Aucun membre</p>
					<p className="text-gray-400 mb-6">Ce projet n'a pas encore de membres</p>
					{isOwner && (
						<button
							onClick={() => setShowAddModal(true)}
							className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
						>
							<UserPlus className="w-5 h-5" />
							<span>Ajouter un membre</span>
						</button>
					)}
				</div>
			</div>
		);
	}

	return (
		<div className="w-full space-y-6">
			{/* Invitations en attente */}
			<PendingInvitations projectId={projectId} isOwner={isOwner} />

			{/* En-tête avec boutons d'ajout */}
			{isOwner && (
				<div className="flex justify-between items-center">
					<div>
						<h3 className="text-lg font-semibold text-gray-900">
							Membres du projet ({members?.length || 0})
						</h3>
					</div>
					<div className="flex space-x-3">
						<button
							onClick={() => setShowInviteModal(true)}
							className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-colors shadow-md hover:shadow-lg"
						>
							<Mail className="w-4 h-4" />
							<span>Inviter par email</span>
						</button>
						<button
							onClick={() => setShowAddModal(true)}
							className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
						>
							<UserPlus className="w-4 h-4" />
							<span>Ajouter membre</span>
						</button>
					</div>
				</div>
			)}

			{/* Liste des membres */}
			{members.map((member) => (
				<div
					key={member.id}
					className="flex items-center justify-between p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
				>
					<div className="flex items-center space-x-4">
						<div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
							{member.user.name
								? member.user.name.charAt(0).toUpperCase()
								: member.user.email.charAt(0).toUpperCase()
							}
						</div>
						<div className="flex-1">
							<h3 className="font-semibold text-gray-900 text-lg">
								{member.user.name || "Utilisateur"}
							</h3>
							<div className="flex items-center space-x-2 text-gray-600 mt-1">
								<Mail className="w-4 h-4" />
								<span className="text-sm">{member.user.email}</span>
							</div>
							<p className="text-xs text-gray-500 mt-2 bg-gray-50 px-3 py-1 rounded-full inline-block">
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
							className="group relative p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 disabled:opacity-50 cursor-pointer border border-transparent hover:border-red-200"
							title="Retirer du projet"
						>
							{removeMemberMutation.isPending ? (
								<Loader2 className="w-5 h-5 animate-spin" />
							) : (
								<UserMinus className="w-5 h-5" />
							)}
							<span className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
								Retirer du projet
							</span>
						</button>
					)}
				</div>
			))}

			{/* Modal d'ajout de membre */}
			{showAddModal && (
				<div className="fixed inset-0 bg-gradient-to-br from-slate-900/20 via-gray-900/40 to-slate-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
						<div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
							<div className="flex items-center space-x-3">
								<div className="p-2 bg-blue-100 rounded-lg">
									<UserPlus className="w-5 h-5 text-blue-600" />
								</div>
								<h3 className="text-lg font-semibold text-gray-900">Ajouter un membre</h3>
							</div>
							<button
								onClick={() => setShowAddModal(false)}
								className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-all duration-200"
							>
								<X className="w-5 h-5" />
							</button>
						</div>

						<div className="p-6 bg-gray-50/50">
							{usersLoading ? (
								<div className="flex items-center justify-center py-8">
									<div className="flex flex-col items-center space-y-3">
										<div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
										<span className="text-gray-600 font-medium">Chargement des utilisateurs...</span>
									</div>
								</div>
							) : availableUsers.length === 0 ? (
								<div className="text-center py-8">
									<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
										<AlertCircle className="w-8 h-8 text-gray-400" />
									</div>
									<p className="text-gray-600 font-medium mb-2">Aucun utilisateur disponible</p>
									<p className="text-gray-500 text-sm">Tous les utilisateurs sont déjà membres de ce projet</p>
								</div>
							) : (
								<div className="space-y-4">
									<div>
										<label htmlFor="user-select" className="block text-sm font-semibold text-gray-700 mb-3">
											Sélectionner un utilisateur
										</label>
										<div className="relative">
											<select
												id="user-select"
												value={selectedUserId || ''}
												onChange={(e) => setSelectedUserId(Number(e.target.value) || null)}
												className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium transition-all duration-200 appearance-none cursor-pointer hover:border-gray-300"
											>
												<option value="" className="text-gray-500">Choisir un utilisateur...</option>
												{availableUsers.map((user) => (
													<option key={user.id} value={user.id} className="text-gray-900 py-2">
														{user.name ? `${user.name} (${user.email})` : user.email}
													</option>
												))}
											</select>
											<div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
												<svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
												</svg>
											</div>
										</div>
									</div>
								</div>
							)}
						</div>

						{availableUsers.length > 0 && (
							<div className="flex justify-end space-x-3 p-6 border-t border-gray-100 bg-white rounded-b-2xl">
								<button
									onClick={() => setShowAddModal(false)}
									className="px-6 py-2.5 text-gray-700 bg-gray-100 border-2 border-transparent rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
								>
									Annuler
								</button>
								<button
									onClick={handleAddMember}
									disabled={!selectedUserId || addMemberMutation.isPending}
									className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
								>
									{addMemberMutation.isPending ? (
										<>
											<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
											<span>Ajout en cours...</span>
										</>
									) : (
										<>
											<UserPlus className="w-4 h-4" />
											<span>Ajouter au projet</span>
										</>
									)}
								</button>
							</div>
						)}
					</div>
				</div>
			)}

			{/* Modal d'invitation par email */}
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
