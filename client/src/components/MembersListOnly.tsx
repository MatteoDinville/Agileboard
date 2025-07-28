import React from "react";
import { useProjectMembers } from "../utils/hooks/project";
import { Mail, Loader2, Users } from "lucide-react";

interface MembersListOnlyProps {
	projectId: number;
}

const MembersListOnly: React.FC<MembersListOnlyProps> = ({ projectId }) => {
	const { data: members, isLoading: membersLoading } = useProjectMembers(projectId);

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
			<div className="text-center py-12">
				<Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
				<p className="text-xl font-medium text-gray-500 mb-2">Aucun membre</p>
				<p className="text-gray-400">Ce projet n'a pas encore de membres</p>
			</div>
		);
	}

	return (
		<div className="w-full space-y-4">
			{members.map((member) => (
				<div
					key={member.id}
					className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100"
				>
					<div className="flex items-center space-x-4">
						<div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
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
							<p className="text-xs text-gray-400 mt-2">
								Membre depuis le {new Date(member.addedAt).toLocaleDateString('fr-FR', {
									day: 'numeric',
									month: 'long',
									year: 'numeric'
								})}
							</p>
						</div>
					</div>
				</div>
			))}
		</div>
	);
};

export default MembersListOnly;
