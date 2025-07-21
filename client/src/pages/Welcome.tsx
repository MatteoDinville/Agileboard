import React from 'react';
import logoIcon from '../assets/logo_icon_blue.png';
import { Link } from '@tanstack/react-router';
import {
	ArrowRight,
	CheckCircle,
	Users,
	Zap,
	Shield,
	Star,
	PlayCircle
} from 'lucide-react';

const Welcome: React.FC = () => {
	return (
		<div className="min-h-screen bg-white">
			{/* Header */}
			<header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						<div className="flex items-center space-x-3">
							<img src={logoIcon} alt="Agileboard Logo" className="w-10 h-10" />
							<span className="text-2xl font-bold text-blue-600 bg-clip-text">
								Agileboard
							</span>
						</div>

						<div className="flex items-center space-x-4">
							<Link
								to="/login"
								className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
							>
								Connexion
							</Link>
							<Link
								to="/register"
								className="bg-gradient-to-r bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 shadow-lg"
							>
								S'inscrire
							</Link>
						</div>
					</div>
				</div>
			</header>

			{/* Hero Section */}
			<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
				<div className="text-center">
					<h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
						Gérez vos projets
						<span className="block text-blue-600">
							avec simplicité
						</span>
					</h1>

					<p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
						Une plateforme moderne et intuitive pour organiser, suivre et collaborer sur tous vos projets.
						Augmentez votre productivité et celle de votre équipe.
					</p>

					<div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
						<Link
							to="/register"
							className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center space-x-2"
						>
							<span>Commencer gratuitement</span>
							<ArrowRight className="w-5 h-5" />
						</Link>

						<button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-8 py-4 rounded-xl hover:bg-gray-100 transition-colors">
							<PlayCircle className="w-5 h-5" />
							<span>Voir la démo</span>
						</button>
					</div>

					{/* Stats */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
						<div className="bg-gradient-to-br from-blue-50 to-cyan-50 backdrop-blur-sm rounded-2xl p-6 border border-blue-100/50">
							<div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
							<div className="text-gray-600">Projets créés</div>
						</div>
						<div className="bg-gradient-to-br from-cyan-50 to-sky-50 backdrop-blur-sm rounded-2xl p-6 border border-cyan-100/50">
							<div className="text-3xl font-bold text-sky-600 mb-2">150+</div>
							<div className="text-gray-600">Utilisateurs actifs</div>
						</div>
						<div className="bg-gradient-to-br from-sky-50 to-blue-50 backdrop-blur-sm rounded-2xl p-6 border border-sky-100/50">
							<div className="text-3xl font-bold text-green-600 mb-2">99%</div>
							<div className="text-gray-600">Satisfaction client</div>
						</div>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
				<div className="text-center mb-16">
					<h2 className="text-4xl font-bold text-gray-900 mb-4">
						Tout ce dont vous avez besoin
					</h2>
					<p className="text-xl text-gray-600 max-w-2xl mx-auto">
						Des fonctionnalités puissantes conçues pour simplifier la gestion de vos projets
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					<div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 shadow-lg shadow-blue-100/50 border border-blue-100 hover:shadow-xl hover:shadow-blue-200/50 transition-all">
						<div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6">
							<CheckCircle className="w-6 h-6 text-white" />
						</div>
						<h3 className="text-xl font-semibold text-gray-900 mb-4">Suivi de statut</h3>
						<p className="text-gray-600">
							Suivez l'avancement de vos projets avec des statuts clairs : En attente, En cours, Terminé.
						</p>
					</div>

					<div className="bg-gradient-to-br from-cyan-50 to-sky-50 rounded-2xl p-8 shadow-lg shadow-cyan-100/50 border border-cyan-100 hover:shadow-xl hover:shadow-cyan-200/50 transition-all">
						<div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-sky-500 rounded-xl flex items-center justify-center mb-6">
							<Star className="w-6 h-6 text-white" />
						</div>
						<h3 className="text-xl font-semibold text-gray-900 mb-4">Gestion des priorités</h3>
						<p className="text-gray-600">
							Organisez vos tâches par priorité (Basse, Moyenne, Haute) pour une meilleure productivité.
						</p>
					</div>

					<div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl p-8 shadow-lg shadow-sky-100/50 border border-sky-100 hover:shadow-xl hover:shadow-sky-200/50 transition-all">
						<div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-blue-500 rounded-xl flex items-center justify-center mb-6">
							<Users className="w-6 h-6 text-white" />
						</div>
						<h3 className="text-xl font-semibold text-gray-900 mb-4">Collaboration</h3>
						<p className="text-gray-600">
							Travaillez en équipe sur vos projets avec des outils de collaboration intégrés.
						</p>
					</div>

					<div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 shadow-lg shadow-blue-100/50 border border-blue-100 hover:shadow-xl hover:shadow-blue-200/50 transition-all">
						<div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mb-6">
							<Zap className="w-6 h-6 text-white" />
						</div>
						<h3 className="text-xl font-semibold text-gray-900 mb-4">Interface moderne</h3>
						<p className="text-gray-600">
							Une interface utilisateur moderne et intuitive pour une expérience optimale.
						</p>
					</div>

					<div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-8 shadow-lg shadow-indigo-100/50 border border-indigo-100 hover:shadow-xl hover:shadow-indigo-200/50 transition-all">
						<div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center mb-6">
							<Shield className="w-6 h-6 text-white" />
						</div>
						<h3 className="text-xl font-semibold text-gray-900 mb-4">Sécurisé</h3>
						<p className="text-gray-600">
							Vos données sont protégées avec les plus hauts standards de sécurité.
						</p>
					</div>

					<div className="bg-gradient-to-br from-sky-50 to-cyan-50 rounded-2xl p-8 shadow-lg shadow-sky-100/50 border border-sky-100 hover:shadow-xl hover:shadow-sky-200/50 transition-all">
						<div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6">
							<PlayCircle className="w-6 h-6 text-white" />
						</div>
						<h3 className="text-xl font-semibold text-gray-900 mb-4">Démarrage rapide</h3>
						<p className="text-gray-600">
							Créez votre premier projet en quelques clics et commencez immédiatement.
						</p>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
				<div className="bg-blue-600 rounded-3xl p-12 text-center text-white relative overflow-hidden">
					<div className="absolute inset-0 bg-gradient-to-r from-blue-700/30 to-cyan-700/30"></div>
					<div className="relative z-10">
						<h2 className="text-4xl font-bold mb-6">
							Prêt à transformer votre gestion de projets ?
						</h2>
						<p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
							Rejoignez des centaines d'utilisateurs qui ont déjà amélioré leur productivité avec MonProjet.
						</p>
						<Link
							to="/register"
							className="inline-flex items-center space-x-2 bg-white text-blue-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-xl hover:shadow-2xl transform hover:scale-105"
						>
							<span>Commencer maintenant</span>
							<ArrowRight className="w-5 h-5" />
						</Link>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="bg-gray-900 text-white py-12">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex flex-col md:flex-row justify-between items-center">
						<div className="flex items-center space-x-3 mb-4 md:mb-0">
							<img src={logoIcon} alt="Agileboard Logo" className="w-10 h-10" />
							<span className="text-xl font-bold">Agileboard</span>
						</div>

						<div className="text-gray-400 text-sm">
							© 2025 Agileboard. Tous droits réservés.
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
};

export default Welcome;