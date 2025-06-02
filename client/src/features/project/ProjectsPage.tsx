import { ProjectCard } from '../../components/ProjectCard';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../config/api';
import { useRouter } from '@tanstack/react-router';
import { CreateProjectModal } from './CreateProjectModal';
import { useState } from 'react';

interface User {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
}

export function ProjetsPage() {
	const router = useRouter();
	const [isOpen, setIsOpen] = useState(false);
	// First fetch the current user
	const { data: user } = useQuery<User>({
		queryKey: ['me'],
		queryFn: () => api.get('/auth/me'),
	});

	// Then fetch projects using the user ID
	const { data: projects } = useQuery({
		queryKey: ['projects', user?.id],
		queryFn: () => api.get('/projects'),
		enabled: !!user?.id, // Only run this query when we have a user ID
	});

	const handleProjectClick = (projectId: string) => {
		router.navigate({ to: '/home/projects/$projectId', params: { projectId } });
	};

	return (
		<div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
			<div className="max-w-6xl mx-auto">
				<h1 className="text-4xl font-bold text-gray-800 text-center mb-12">
					Mes Projets
				</h1>
				<button
					onClick={() => setIsOpen(true)}
					className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors cursor-pointer"
				>
					Créer un nouveau projet
				</button>
				<CreateProjectModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
				{Array.isArray(projects) && projects.length > 0 ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
						{projects.map((project: {
							id: string;
							name: string;
							description: string;
							key: string;
						}) => (
							<button
								key={project.id}
								onClick={() => handleProjectClick(project.id)}
								className="w-full text-left cursor-pointer hover:opacity-90 transition-opacity"
							>
								<ProjectCard
									name={project.name}
									description={project.description}
									keyCode={project.key}
								/>
							</button>
						))}
					</div>
				) : (
					<div className="text-center text-gray-500 text-lg mt-12">
						Aucun projet trouvé. Créez un nouveau projet pour commencer !
					</div>
				)}
			</div>
		</div>
	);
}
