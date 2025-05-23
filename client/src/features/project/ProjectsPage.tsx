import { ProjectCard } from '../../components/ProjectCard';

const projects = [
	{
		id: '1',
		name: 'Site vitrine client',
		description: 'Création d’un site web pour présenter l’entreprise.',
		keyCode: 'SV-CLI',
	},
	{
		id: '2',
		name: 'Application mobile',
		description: 'Développement d’une app mobile cross-platform.',
		keyCode: 'APP-MOB',
	},
	{
		id: '3',
		name: 'Refonte CRM',
		description: 'Modernisation du CRM avec nouvelles fonctionnalités.',
		keyCode: 'CRM-REF',
	},
];

export function ProjetsPage() {
	return (
		<div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
			<div className="max-w-6xl mx-auto">
				<h1 className="text-4xl font-bold text-gray-800 text-center mb-12">
					Mes Projets
				</h1>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 cursor-pointer">
					{projects.map((project) => (
						<ProjectCard
							key={project.id}
							name={project.name}
							description={project.description}
							keyCode={project.keyCode}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
