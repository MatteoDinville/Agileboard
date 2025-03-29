import { Logo } from './components/Logo';

export function App() {
	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
			{/* Navigation */}
			<nav className="bg-white shadow-sm">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-center h-16 items-center ">
						<Logo className="text-blue-600" />
					</div>
				</div>
			</nav>

			{/* Alert Banner */}
			<div className="bg-gradient-to-r from-yellow-400 to-yellow-500">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="py-3 flex items-center justify-center">
						<div className="flex items-center space-x-3">
							<div className="flex-shrink-0">
								<div className="animate-spin-slow">
									<svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
									</svg>
								</div>
							</div>
							<div className="flex items-center">
								<p className="text-white font-medium text-lg">
									Bientôt disponible
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* About Section */}
			<div className="py-16 bg-gray-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="lg:text-center">
						<h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">À propos</h2>
						<p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
							Un projet en cours de développement
						</p>
						<p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
							Agileboard est un projet de fin d'études développé par des étudiants passionnés. Notre objectif est de créer une plateforme de gestion de projet agile accessible et intuitive.
						</p>
					</div>
				</div>
			</div>

			{/* Features Section */}
			<div className="py-12 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="lg:text-center">
						<h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Fonctionnalités</h2>
						<p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
							Tout ce dont vous avez besoin
						</p>
					</div>

					<div className="mt-10">
						<div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
							{/* Feature 1 */}
							<div className="relative p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
								<div className="text-blue-600 mb-4">
									<svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
									</svg>
								</div>
								<h3 className="text-lg font-medium text-gray-900">Tableaux Kanban</h3>
								<p className="mt-2 text-base text-gray-500">
									Visualisez et gérez vos tâches avec des tableaux Kanban intuitifs.
								</p>
							</div>

							{/* Feature 2 */}
							<div className="relative p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
								<div className="text-blue-600 mb-4">
									<svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
									</svg>
								</div>
								<h3 className="text-lg font-medium text-gray-900">Gestion d'équipe</h3>
								<p className="mt-2 text-base text-gray-500">
									Collaborez efficacement avec votre équipe en temps réel.
								</p>
							</div>

							{/* Feature 3 */}
							<div className="relative p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
								<div className="text-blue-600 mb-4">
									<svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
									</svg>
								</div>
								<h3 className="text-lg font-medium text-gray-900">Tableaux de bord</h3>
								<p className="mt-2 text-base text-gray-500">
									Suivez la progression de vos projets avec des tableaux de bord personnalisables.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* CTA Section */}
			<div className="bg-blue-600">
				<div className="flex justify-center items-center sm:py-8 py-12">
					<h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
						<span className="block">Intéressé par le projet ?</span>
						<span className="block text-blue-200">Suivez notre progression</span>
					</h2>
				</div>
			</div>

			{/* Footer */}
			<footer className="bg-white">
				<div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
					<div className="text-center text-gray-500 text-sm">
						© 2025 Agileboard. Tous droits réservés.
					</div>
				</div>
			</footer>
		</div>
	);
}
