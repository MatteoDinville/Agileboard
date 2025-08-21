type ProjectCardProps = {
	readonly name: string;
	readonly description: string;
	readonly keyCode: string;
};

export function ProjectCard({ name, description, keyCode }: ProjectCardProps) {
	return (
		<div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-1">
			<h2 className="text-2xl font-semibold text-gray-800 mb-3">{name}</h2>
			<p className="text-gray-600 mb-6 h-20 overflow-hidden">{description}</p>
			<span className="inline-block bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-full shadow-md hover:bg-blue-600 transition-colors duration-300">
				{keyCode}
			</span>
		</div>
	);
}