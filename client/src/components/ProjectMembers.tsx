import React, { useState } from "react";
import {
	useProjectMembers,
	useAddProjectMember,
	useRemoveProjectMember
} from "../utils/hooks/project";
import { useAllUsers } from "../utils/hooks/user";
import {
	Users,
	UserPlus,
	UserMinus,
	Mail,
	X,
	Plus,
	AlertCircle,
	Loader2
} from "lucide-react";
import { SectionLoader } from "./Loading";

interface ProjectMembersProps {
	projectId: number;
	isOwner?: boolean;
}

const ProjectMembers: React.FC<ProjectMembersProps> = ({
	projectId,
	isOwner = false
}) => {
	const [showAddModal, setShowAddModal] = useState(false);
	const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

	const { data: members, isLoading: membersLoading } = useProjectMembers(projectId);
	const { data: allUsers, isLoading: usersLoading } = useAllUsers();

	const addMemberMutation = useAddProjectMember();
	const removeMemberMutation = useRemoveProjectMember();

	const availableUsers = allUsers?.filter(user =>
		!members?.some(member => member.user.id === user.id)
	) || [];

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

	const handleRemoveMember = (userId: number) => {
		if (confirm("Voulez-vous vraiment retirer ce membre du projet ?")) {
			removeMemberMutation.mutate({ projectId, userId });
		}
	};

	if (membersLoading) {
		return <SectionLoader label="Chargement des membres..." minHeight={180} />;
	}

	return (
		<div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
			<div className="flex items-center justify-between mb-6">
				<div className="flex items-center space-x-3">
					<div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
						<Users className="w-5 h-5 text-indigo-600" />
					</div>
					<div>
						<h3 className="text-lg font-semibold text-gray-900">Membres du projet</h3>
						<p className="text-sm text-gray-500">
							{members?.length || 0} membre{(members?.length || 0) > 1 ? 's' : ''}
						</p>
					</div>
				</div>

				{isOwner && (
					<button
						onClick={() => setShowAddModal(true)}
						className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<UserPlus className="w-4 h-4" />
						<span>Ajouter</span>
					</button>
				)}
			</div>

			{members?.length === 0 ? (
				<div className="text-center py-8">
					<Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
					<p className="text-gray-500 mb-2">Aucun membre pour le moment</p>
				</div>
			) : (
				<div className="space-y-3">
					{members?.map((member) => (
						<div
							key={member.id}
							className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100"
						>
							<div className="flex items-center space-x-3">
								<div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
									{member.user.name
										? member.user.name.charAt(0).toUpperCase()
										: member.user.email.charAt(0).toUpperCase()
									}
								</div>
								<div>
									<p className="font-medium text-gray-900">
										{member.user.name || "Utilisateur"}
									</p>
									<div className="flex items-center space-x-1 text-sm text-gray-500">
										<Mail className="w-3 h-3 mt-1" />
										<span>{member.user.email}</span>
									</div>
									<p className="text-xs text-gray-400 mt-1">
										Ajouté le {new Date(member.addedAt).toLocaleDateString('fr-FR')}
									</p>
								</div>
							</div>

							{isOwner && (
								<button
									onClick={() => handleRemoveMember(member.user.id)}
									disabled={removeMemberMutation.isPending}
									className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
									title="Retirer du projet"
								>
									{removeMemberMutation.isPending ? (
										<Loader2 className="w-4 h-4 animate-spin" />
									) : (
										<UserMinus className="w-4 h-4" />
									)}
								</button>
							)}
						</div>
					))}
				</div>
			)}

			{showAddModal && (
				<div className="fixed inset-0 bg-[#00000063] bg-opacity-100 flex items-center justify-center z-50">
					<div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
						<div className="flex items-center justify-between p-6 border-b border-gray-200">
							<h3 className="text-lg font-semibold text-gray-900">Ajouter un membre</h3>
							<button
								onClick={() => setShowAddModal(false)}
								className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
							>
								<X className="w-5 h-5" />
							</button>
						</div>

						<div className="p-6">
							{usersLoading ? (
								<SectionLoader label="Chargement des utilisateurs..." minHeight={120} />
							) : availableUsers.length === 0 ? (
								<div className="text-center py-8">
									<AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
									<p className="text-gray-500">Aucun utilisateur disponible à ajouter</p>
								</div>
							) : (
								<>
									<p className="text-sm text-gray-600 mb-4">
										Sélectionnez un utilisateur à ajouter au projet :
									</p>
									<div className="space-y-2 max-h-60 overflow-y-auto">
										{availableUsers.map((user) => (
											<button
												key={user.id}
												onClick={() => setSelectedUserId(user.id)}
												className={`w-full flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${selectedUserId === user.id
													? "border-indigo-500 bg-indigo-50"
													: "border-gray-200 hover:bg-gray-50"
													}`}
											>
												<div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
													{user.name
														? user.name.charAt(0).toUpperCase()
														: user.email.charAt(0).toUpperCase()
													}
												</div>
												<div className="flex-1 text-left">
													<p className="font-medium text-gray-900">
														{user.name || "Utilisateur"}
													</p>
													<p className="text-sm text-gray-500">{user.email}</p>
												</div>
											</button>
										))}
									</div>
								</>
							)}
						</div>

						{availableUsers.length > 0 && (
							<div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
								<button
									onClick={() => setShowAddModal(false)}
									className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
								>
									Annuler
								</button>
								<button
									onClick={handleAddMember}
									disabled={!selectedUserId || addMemberMutation.isPending}
									className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{addMemberMutation.isPending ? (
										<Loader2 className="w-4 h-4 animate-spin" />
									) : (
										<Plus className="w-4 h-4" />
									)}
									<span>Ajouter</span>
								</button>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default ProjectMembers;
