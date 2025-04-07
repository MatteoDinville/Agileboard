import { BrowserRouter as Router, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Home } from './Home';
import { AuthModal } from './components/AuthModal';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';
import { Logo } from './components/Logo';

export function App() {
	return (
		<Router>
			<Toaster position="top-center" />
			<Routes>
				<Route path="/home" element={
					<ProtectedRoute>
						<Home />
					</ProtectedRoute>
				} />
				<Route path="/*" element={<MainLayout />} />
			</Routes>
		</Router>
	);
}

function MainLayout() {
	const location = useLocation();
	const [showAuthModal, setShowAuthModal] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		const checkAuth = async () => {
			try {
				const response = await fetch('http://localhost:4000/api/auth/me', {
					credentials: 'include'
				});
				if (response.ok && location.pathname === '/') {
					navigate('/home');
				} else if (!response.ok && location.pathname === '/home') {
					navigate('/');
				}
			} catch (error) {
				console.error('Erreur lors de la vérification de l\'authentification:', error);
				if (location.pathname === '/home') {
					navigate('/');
				}
			}
		};
		checkAuth();
	}, [location, navigate]);

	useEffect(() => {
		if (location.pathname === '/login' || location.pathname === '/register') {
			setShowAuthModal(true);
		} else {
			setShowAuthModal(false);
		}
	}, [location]);

	const handleCloseModal = () => {
		setShowAuthModal(false);
		navigate('/');
	};

	const defaultTab = location.pathname === '/register' ? 'register' : 'login';

	return (
		<div className="relative">
			<LandingPage />
			<AuthModal
				isOpen={showAuthModal}
				onClose={handleCloseModal}
				defaultTab={defaultTab}
			/>
		</div>
	);
}

function LandingPage() {
	const navigate = useNavigate();

	const handleLoginClick = () => {
		navigate('/login');
	};

	const handleRegisterClick = () => {
		navigate('/register');
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
			{/* Navigation */}
			<nav className="bg-white shadow-sm">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between h-16 items-center">
						<div className="flex-shrink-0">
							<Logo className="text-blue-600" />
						</div>
						<div className="flex space-x-4">
							<button
								onClick={handleLoginClick}
								className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-transform duration-300 transform hover:scale-105 cursor-pointer"
							>
								Se connecter
							</button>
							<button
								onClick={handleRegisterClick}
								className="border border-blue-600 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 transition-transform duration-300 transform hover:scale-105 cursor-pointer"
							>
								S'inscrire
							</button>
						</div>
					</div>
				</div>
			</nav>

			{/* Hero Section */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
				<div className="text-center">
					<h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
						<span className="block">Gérez vos projets</span>
						<span className="block text-blue-600">avec simplicité</span>
					</h1>
					<p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
						Agileboard est votre solution tout-en-un pour la gestion de projet agile.
						Simple, intuitif et puissant, il vous permet de suivre vos tâches et votre équipe efficacement.
					</p>
					<div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
						<div className="rounded-md shadow">
							<button
								onClick={handleRegisterClick}
								className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-transform duration-300 transform hover:scale-105 md:py-4 md:text-lg md:px-10 cursor-pointer"
							>
								Commencer gratuitement
							</button>
						</div>
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
				<div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
					<h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
						<span className="block">Prêt à commencer ?</span>
						<span className="block text-blue-200">Rejoignez Agileboard aujourd'hui.</span>
					</h2>
					<div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
						<div className="inline-flex rounded-md shadow">
							<button
								onClick={handleRegisterClick}
								className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 transition-transform duration-300 transform hover:scale-105 cursor-pointer"
							>
								Commencer gratuitement
							</button>
						</div>
					</div>
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
