import { useEffect, useState } from 'react';
import { useRouter } from '@tanstack/react-router';
import { Modal } from '../../components/Modal';
import toast from 'react-hot-toast';
import { AuthTabs } from './AuthTabs';

interface AuthModalProps {
	isOpen: boolean;
	onClose: () => void;
	defaultTab?: 'login' | 'register';
}

export const AuthModal = ({ isOpen, onClose, defaultTab = 'login' }: AuthModalProps) => {
	const router = useRouter();
	const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab);
	const [formData, setFormData] = useState({
		firstName: '',
		lastName: '',
		email: '',
		password: '',
		confirmPassword: ''
	});
	const [error, setError] = useState('');

	useEffect(() => {
		setActiveTab(defaultTab);
	}, [defaultTab]);

	const handleClose = () => {
		onClose();
		router.navigate({ to: '/' });
	};

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault()
		setError('')

		try {
			const response = await fetch('http://localhost:4000/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({
					email: formData.email,
					password: formData.password
				}),
			})

			const data = await response.json()

			if (response.ok) {
				router.navigate({ to: '/home' })
			} else {
				const msg = data.message || 'Identifiants invalides'
				setError(msg)
				toast.error(msg)
			}
		} catch (err) {
			const msg = 'Erreur de connexion au serveur : ' + err
			setError(msg)
			toast.error(msg)
		}
	}


	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();
		if (formData.password !== formData.confirmPassword) {
			setError('Les mots de passe ne correspondent pas');
			return;
		}

		try {
			const response = await fetch('http://localhost:4000/api/auth/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					firstName: formData.firstName,
					lastName: formData.lastName,
					email: formData.email,
					password: formData.password
				}),
			});

			if (response.ok) {
				toast.success('🎉 Inscription réussie !');
				setActiveTab('login');
				setFormData({
					firstName: '',
					lastName: '',
					email: '',
					password: '',
					confirmPassword: ''
				});
			} else {
				const data = await response.json();
				setError(data.message || 'Une erreur est survenue');
			}
		} catch (err) {
			setError('Erreur de connexion au serveur : ' + err);
		}
	};

	const handleTabChange = (tab: 'login' | 'register') => {
		setActiveTab(tab);
		setError('');
		setFormData({
			firstName: '',
			lastName: '',
			email: '',
			password: '',
			confirmPassword: ''
		});
		router.navigate({ to: tab === 'login' ? '/login' : '/register' });
	};

	const handleSocialLogin = (provider: 'github' | 'google') => {
		console.log(`Login with ${provider}`);
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
		>
			<AuthTabs activeTab={activeTab} onTabChange={handleTabChange} />
			<div className="w-full px-6 pb-8">
				{error && (
					<div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
						<span className="block sm:inline">{error}</span>
					</div>
				)}

				{activeTab === 'login' ? (
					<form onSubmit={handleLogin} className="mt-8 space-y-8">
						<div className="space-y-6">
							<div>
								<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
									Email <span className="text-red-500">*</span>
								</label>
								<input
									type="email"
									id="email"
									name="email"
									required
									className={`p-2 mt-1 block w-full rounded-md shadow-sm sm:text-sm py-2.5 border ${error ? 'border-red-500' : 'border-gray-300'} focus:border-2 focus:outline-none focus:border-blue-500`}
									value={formData.email}
									onChange={(e) => setFormData({ ...formData, email: e.target.value })}
								/>
							</div>
							<div>
								<label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
									Mot de passe <span className="text-red-500">*</span>
								</label>
								<input
									id="password"
									name="password"
									type="password"
									required
									className={`p-2 mt-1 block w-full rounded-md shadow-sm sm:text-sm py-2.5 border ${error ? 'border-red-500' : 'border-gray-300'
										} focus:border-2 focus:outline-none focus:border-blue-500`}
									value={formData.password}
									onChange={(e) => setFormData({ ...formData, password: e.target.value })}
								/>
							</div>
						</div>

						<div>
							<button
								type="submit"
								className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
							>
								Se connecter
							</button>
						</div>

						{/* Social Login Buttons */}
						<div className="mt-8">
							<div className="relative">
								<div className="absolute inset-0 flex items-center">
									<div className="w-full border-t border-gray-300" />
								</div>
								<div className="relative flex justify-center text-sm">
									<span className="px-2 bg-white text-gray-500">Ou continuer avec</span>
								</div>
							</div>
							<div className="mt-8 grid grid-cols-2 gap-3">
								<button
									type="button"
									onClick={() => handleSocialLogin('github')}
									className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-800 hover:bg-gray-50 cursor-pointer transition-transform duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
								>
									<span className="sr-only">Se connecter avec GitHub</span>
									<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.91-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
									</svg>
									<span className='ml-2'>GitHub</span>
								</button>
								<button
									type="button"
									onClick={() => handleSocialLogin('google')}
									className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium hover:bg-gray-50 cursor-pointer transition-transform duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
								>
									<svg className="w-5 h-5" viewBox="0 0 24 24">
										<path
											fill="#4285F4"
											d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
										/>
										<path
											fill="#34A853"
											d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
										/>
										<path
											fill="#FBBC05"
											d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
										/>
										<path
											fill="#EA4335"
											d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
										/>
									</svg>
									<span className='ml-2'>Google</span>
								</button>
							</div>
						</div>
					</form>
				) : (
					<form onSubmit={handleRegister} className="mt-8 space-y-8">
						<div className="space-y-6">
							<div className="grid grid-cols-2 gap-6">
								<div>
									<label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
										Prénom
									</label>
									<input
										id="firstName"
										name="firstName"
										type="text"
										required
										className={`p-2 mt-1 block w-full rounded-md shadow-sm sm:text-sm py-2.5 border ${error ? 'border-red-500' : 'border-gray-300'
											} focus:border-2 focus:outline-none focus:border-blue-500`}
										value={formData.firstName}
										onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
									/>
								</div>
								<div>
									<label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
										Nom
									</label>
									<input
										id="lastName"
										name="lastName"
										type="text"
										required
										className={`p-2 mt-1 block w-full rounded-md shadow-sm sm:text-sm py-2.5 border ${error ? 'border-red-500' : 'border-gray-300'
											} focus:border-2 focus:outline-none focus:border-blue-500`}
										value={formData.lastName}
										onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
									/>
								</div>
							</div>
							<div>
								<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
									Email
								</label>
								<input
									id="email"
									name="email"
									type="email"
									required
									className={`p-2 mt-1 block w-full rounded-md shadow-sm sm:text-sm py-2.5 border ${error ? 'border-red-500' : 'border-gray-300'
										} focus:border-2 focus:outline-none focus:border-blue-500`}
									value={formData.email}
									onChange={(e) => setFormData({ ...formData, email: e.target.value })}
								/>
							</div>
							<div>
								<label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
									Mot de passe
								</label>
								<input
									id="password"
									name="password"
									type="password"
									required
									className={`p-2 mt-1 block w-full rounded-md shadow-sm sm:text-sm py-2.5 border ${error ? 'border-red-500' : 'border-gray-300'
										} focus:border-2 focus:outline-none focus:border-blue-500`}
									value={formData.password}
									onChange={(e) => setFormData({ ...formData, password: e.target.value })}
								/>
							</div>
							<div>
								<label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
									Confirmer le mot de passe
								</label>
								<input
									id="confirmPassword"
									name="confirmPassword"
									type="password"
									required
									className={`p-2 mt-1 block w-full rounded-md shadow-sm sm:text-sm py-2.5 border ${error ? 'border-red-500' : 'border-gray-300'
										} focus:border-2 focus:outline-none focus:border-blue-500`}
									value={formData.confirmPassword}
									onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
								/>
							</div>
						</div>

						<div>
							<button
								type="submit"
								className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none cursor-pointer"
							>
								S'inscrire
							</button>
						</div>

						{/* Social Login Buttons */}
						<div className="mt-8">
							<div className="relative">
								<div className="absolute inset-0 flex items-center">
									<div className="w-full border-t border-gray-300" />
								</div>
								<div className="relative flex justify-center text-sm">
									<span className="px-2 bg-white text-gray-500">Ou continuer avec</span>
								</div>
							</div>

							<div className="mt-8 grid grid-cols-2 gap-3">
								<button
									type="button"
									onClick={() => handleSocialLogin('github')}
									className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-800 hover:bg-gray-50 cursor-pointer transition-transform duration-300 transform hover:scale-105"
								>
									<span className="sr-only">Se connecter avec GitHub</span>
									<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.91-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
									</svg>
									<span className='ml-2'>GitHub</span>
								</button>
								<button
									type="button"
									onClick={() => handleSocialLogin('google')}
									className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium hover:bg-gray-50 cursor-pointer transition-transform duration-300 transform hover:scale-105"
								>
									<span className="sr-only">Se connecter avec Google</span>
									<svg className="w-5 h-5" viewBox="0 0 24 24">
										<path
											fill="#4285F4"
											d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
										/>
										<path
											fill="#34A853"
											d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
										/>
										<path
											fill="#FBBC05"
											d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
										/>
										<path
											fill="#EA4335"
											d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
										/>
									</svg>
									<span className='ml-2'>Google</span>
								</button>
							</div>
						</div>
					</form>
				)}
			</div>
		</Modal>
	);
};
