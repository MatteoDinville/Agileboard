import { useNavigate } from '@tanstack/react-router';
import {
	Home,
	ArrowLeft,
	Search,
	AlertCircle,
	Compass,
	RefreshCw
} from 'lucide-react';

export default function NotFound() {
	const navigate = useNavigate();

	const handleGoHome = () => {
		navigate({ to: '/dashboard' });
	};

	const handleGoBack = () => {
		window.history.back();
	};

	const handleRefresh = () => {
		window.location.reload();
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-100 relative overflow-hidden">
			{/* Éléments décoratifs de fond pleine page */}
			<div className="absolute top-20 left-20 w-40 h-40 bg-blue-100 rounded-full blur-3xl opacity-40 animate-pulse"></div>
			<div className="absolute bottom-20 right-20 w-60 h-60 bg-cyan-100 rounded-full blur-3xl opacity-40 animate-pulse" style={{ animationDelay: '1s' }}></div>
			<div className="absolute top-1/2 left-10 w-32 h-32 bg-purple-100 rounded-full blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
			<div className="absolute top-10 right-1/3 w-24 h-24 bg-pink-100 rounded-full blur-2xl opacity-30 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
			<div className="absolute bottom-1/3 left-1/4 w-28 h-28 bg-indigo-100 rounded-full blur-2xl opacity-35 animate-pulse" style={{ animationDelay: '1.5s' }}></div>			{/* Conteneur principal pleine page */}
			<div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-4">
				<div className="w-full max-w-4xl text-center">
					{/* Arrière-plan flouté pleine largeur */}
					<div className="absolute inset-0 bg-white/40 backdrop-blur-2xl rounded-3xl border border-gray-200/50 shadow-2xl"></div>

					{/* Contenu */}
					<div className="relative z-10 px-6 py-8 md:px-12 md:py-12">						{/* Icône 404 avec animation plus compacte */}
						<div className="relative mb-6">
							<div className="inline-flex items-center justify-center w-24 h-24 md:w-32 md:h-32 bg-blue-600 rounded-full mb-4 animate-pulse shadow-2xl">
								<Compass className="w-12 h-12 md:w-16 md:h-16 text-white animate-spin" style={{ animationDuration: '3s' }} />
							</div>							{/* Cercles décoratifs plus compacts */}
							<div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4">
								<div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0s' }}></div>
							</div>
							<div className="absolute top-4 right-2 md:right-4">
								<div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0.2s' }}></div>
							</div>
							<div className="absolute bottom-4 left-2 md:left-4">
								<div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0.4s' }}></div>
							</div>
							<div className="absolute top-1/2 right-0 transform translate-x-3">
								<div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0.6s' }}></div>
							</div>
							<div className="absolute top-1/2 left-0 transform -translate-x-3">
								<div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0.8s' }}></div>
							</div>
						</div>

						{/* Titre principal optimisé */}
						<h1 className="text-6xl md:text-8xl lg:text-9xl font-bold bg-blue-600 bg-clip-text text-transparent mb-3 drop-shadow-lg">
							404
						</h1>						{/* Sous-titre optimisé */}
						<h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
							Page introuvable
						</h2>

						{/* Description compacte */}
						<p className="text-gray-600 text-lg md:text-xl mb-6 leading-relaxed max-w-2xl mx-auto">
							Oups ! La page que vous recherchez semble avoir disparu dans l'espace numérique.
						</p>						{/* Message d'erreur avec icône */}
						<div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 inline-flex items-center gap-3 shadow-lg">
							<AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
							<span className="text-amber-700 text-sm md:text-base">
								L'URL demandée n'existe pas ou a été déplacée
							</span>
						</div>

						{/* Suggestions compactes */}
						<div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8 shadow-lg">
							<h3 className="text-blue-800 font-semibold text-base md:text-lg mb-4">Suggestions :</h3>
							<ul className="text-blue-700 text-sm md:text-base space-y-2 text-left max-w-lg mx-auto">
								<li className="flex items-center gap-2">
									<div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></div>
									Vérifiez l'orthographe de l'URL
								</li>
								<li className="flex items-center gap-2">
									<div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></div>
									Retournez à la page d'accueil
								</li>
								<li className="flex items-center gap-2">
									<div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></div>
									Utilisez le menu de navigation
								</li>
							</ul>
						</div>						{/* Boutons d'action compacts */}
						<div className="flex flex-col lg:flex-row gap-4 justify-center items-center mb-8">
							<button
								onClick={handleGoHome}
								className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 text-base"
							>
								<Home className="w-5 h-5" />
								Retour au dashboard
							</button>

							<button
								onClick={handleGoBack}
								className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-base"
							>
								<ArrowLeft className="w-5 h-5" />
								Page précédente
							</button>

							<button
								onClick={handleRefresh}
								className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-200 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-base"
							>
								<RefreshCw className="w-5 h-5" />
								Actualiser
							</button>
						</div>						{/* Lien de recherche compact */}
						<div className="pt-6 border-t border-gray-200">
							<button
								onClick={() => navigate({ to: '/dashboard' })}
								className="text-gray-500 hover:text-blue-600 transition-colors duration-300 flex items-center gap-2 mx-auto text-sm"
							>
								<Search className="w-4 h-4" />
								<span>Rechercher dans l'application</span>
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
