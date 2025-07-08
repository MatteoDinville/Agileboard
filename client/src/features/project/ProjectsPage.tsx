import { ProjectCard } from '../../components/ProjectCard';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../config/api';
import { useRouter } from '@tanstack/react-router';

interface User {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
}

export function ProjetsPage() {
	const router = useRouter();
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
				{Array.isArray(projects) && projects.length > 0 ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
						{projects.map((project: {
							id: string;
							name: string;
							description: string;
							key: string;
						}) => (
							<div
								key={project.id}
								onClick={() => handleProjectClick(project.id)}
								className="cursor-pointer"
							>
								<ProjectCard
									name={project.name}
									description={project.description}
									keyCode={project.key}
								/>
							</div>
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
