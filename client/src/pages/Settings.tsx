import { useState, useContext, useEffect } from 'react';
import {
Settings as IconSettings,
User as IconUser,
Lock as IconLock,
Home as IconHome,
Camera as IconCamera,
Save as IconSave,
} from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { AuthContext } from '../contexts/AuthContext';
import { useProfile } from '../utils/hooks/user';


export default function SettingsPage() {
	const navigate = useNavigate();
	const { user } = useContext(AuthContext);
	const { user: profileUser, updateProfile, changePassword } = useProfile();

	const [profileForm, setProfileForm] = useState({
		name: user?.name || '',
		firstName: user?.name?.split(' ')[0] || '',
		lastName: user?.name?.split(' ').slice(1).join(' ') || '',
		email: user?.email || ''
	});

	const [passwordForm, setPasswordForm] = useState({
		currentPassword: '',
		newPassword: '',
		confirmPassword: ''
	});

	useEffect(() => {
		if (profileUser) {
			setProfileForm({
				name: profileUser.name || '',
				firstName: profileUser.name?.split(' ')[0] || '',
				lastName: profileUser.name?.split(' ').slice(1).join(' ') || '',
				email: profileUser.email || ''
			});
		} else if (user) {
			setProfileForm({
				name: user.name || '',
				firstName: user.name?.split(' ')[0] || '',
				lastName: user.name?.split(' ').slice(1).join(' ') || '',
				email: user.email || ''
			});
		}
	}, [profileUser, user]);

	const handleProfileSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			const fullName = `${profileForm.firstName?.trim() || ''} ${profileForm.lastName?.trim() || ''}`.trim();

			await updateProfile.mutateAsync({
				name: fullName || undefined,
				email: profileForm.email
			});

			const successMessage = document.createElement('div');
			successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2';
			successMessage.innerHTML = `
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
				</svg>
				Profil mis à jour avec succès !
			`;
			document.body.appendChild(successMessage);

			setTimeout(() => {
				successMessage.remove();
			}, 3000);
		} catch (error) {
			console.error('Erreur lors de la mise à jour du profil:', error);
			alert('Erreur lors de la mise à jour du profil');
		}
	};

	const handlePasswordSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (passwordForm.newPassword !== passwordForm.confirmPassword) {
			const errorMessage = document.createElement('div');
			errorMessage.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2';
			errorMessage.innerHTML = `
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
				</svg>
				Les mots de passe ne correspondent pas
			`;
			document.body.appendChild(errorMessage);
			setTimeout(() => errorMessage.remove(), 4000);
			return;
		}

		if (passwordForm.newPassword.length < 6) {
			const errorMessage = document.createElement('div');
			errorMessage.className = 'fixed top-4 right-4 bg-orange-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2';
			errorMessage.innerHTML = `
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L5.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
				</svg>
				Le mot de passe doit contenir au moins 6 caractères
			`;
			document.body.appendChild(errorMessage);
			setTimeout(() => errorMessage.remove(), 4000);
			return;
		}

		try {
			await changePassword.mutateAsync({
				currentPassword: passwordForm.currentPassword,
				newPassword: passwordForm.newPassword
			});

			setPasswordForm({
				currentPassword: '',
				newPassword: '',
				confirmPassword: ''
			});

			const successMessage = document.createElement('div');
			successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2';
			successMessage.innerHTML = `
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
				</svg>
				Mot de passe modifié avec succès !
			`;
			document.body.appendChild(successMessage);
			setTimeout(() => successMessage.remove(), 4000);
		} catch (error: unknown) {
			console.error('Erreur lors du changement de mot de passe:', error);

			const errorMessage = document.createElement('div');
			errorMessage.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2';
			let errorText = 'Erreur lors du changement de mot de passe';
			if (error && typeof error === 'object' && 'response' in error) {
				const response = error as { response?: { data?: { message?: string } } };
				if (response.response?.data?.message) {
					errorText = response.response.data.message;
				}
			} else if (error && typeof error === 'object' && 'message' in error) {
				const errorObj = error as { message?: string };
				if (errorObj.message) {
					errorText = errorObj.message;
				}
			}

			const isWrongPassword = errorText.toLowerCase().includes('incorrect') ||
				errorText.toLowerCase().includes('wrong') ||
				errorText.toLowerCase().includes('invalide') ||
				errorText.toLowerCase().includes('actuel');

			errorMessage.innerHTML = `
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
				</svg>
				${isWrongPassword ? 'Mot de passe actuel incorrect' : errorText}
			`;
			document.body.appendChild(errorMessage);
			setTimeout(() => errorMessage.remove(), 5000);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-100">
			<header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						<div className="flex items-center gap-4">
							<button
								onClick={() => navigate({ to: '/dashboard' })}
								className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center"
								title="Retour au Dashboard"
							>
								<IconSettings className="w-5 h-5 text-white" />
							</button>
							<div>
								<h1 className="text-xl font-semibold text-gray-900">Paramètres</h1>
								<p className="text-gray-600 text-sm">Personnalisez votre expérience utilisateur</p>
							</div>
						</div>
						<button
							onClick={() => navigate({ to: '/dashboard' })}
							className="flex items-center space-x-2 px-4 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
							title="Retour au Dashboard"
						>
							<IconHome className="w-6 h-6 text-gray-500 hover:text-gray-700 transition-colors" />
							<span className="text-sm font-medium">Retour au dashboard</span>
						</button>
					</div>
				</div>
			</header>
			<main>
				<div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
					<div className="relative z-10 bg-white/60 backdrop-blur-lg rounded-3xl border border-gray-200 shadow-md overflow-hidden">
						<div className="p-8">
							<div className="space-y-8">
								<h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
									<IconUser className="w-6 h-6 text-blue-500" />
									Informations du profil
								</h2>
								<div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
									<div className="flex items-center gap-6">
										<div className="relative">
											<div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
												{profileForm.firstName.charAt(0).toUpperCase()}
												{profileForm.lastName.charAt(0).toUpperCase()}
											</div>
											<button className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow hover:scale-110 transition-transform">
												<IconCamera className="w-4 h-4 text-gray-600" />
											</button>
										</div>
										<div className="flex-1">
											<h3 className="text-lg font-medium text-gray-700 mb-1">Photo de profil</h3>
											<p className="text-gray-500 text-sm mb-4">Changez votre avatar ou photo de profil</p>
											<button
												disabled={true}
												className="px-4 py-2 bg-gray-400 text-white rounded-xl cursor-not-allowed font-medium opacity-50"
												title="Fonctionnalité bientôt disponible"
											>
												Bientôt disponible
											</button>
										</div>
									</div>
								</div>
								<div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
									<h3 className="text-lg font-medium text-gray-700">Informations personnelles</h3>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div>
											<label className="block text-sm font-medium text-gray-600 mb-1">Prénom</label>
											<input
												type="text"
												value={profileForm.firstName}
												onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
												className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-600 mb-1">Nom</label>
											<input
												type="text"
												value={profileForm.lastName}
												onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
												className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
											<input
												type="email"
												value={profileForm.email}
												onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
												className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
											/>
										</div>
									</div>
									<div className="flex justify-end pt-4 border-t border-gray-200">
										<button
											type="button"
											onClick={handleProfileSubmit}
											disabled={updateProfile.isPending}
											className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:opacity-90 transition-opacity font-medium shadow-lg cursor-pointer disabled:opacity-50"
										>
											{updateProfile.isPending ? (
												<>
													<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
													Mise à jour...
												</>
											) : (
												<>
													<IconSave className="w-5 h-5" />
													Sauvegarder les modifications
												</>
											)}
										</button>
									</div>
								</div>
								<div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
									<h3 className="text-lg font-medium text-gray-700 flex items-center gap-2 mb-6">
										<IconLock className="w-5 h-5 text-blue-500" />
										Changement de mot de passe
									</h3>
									<form onSubmit={handlePasswordSubmit} className="space-y-6">
										<div>
											<label className="block text-sm font-medium text-gray-600 mb-2">Mot de passe actuel</label>
											<input
												type="password"
												value={passwordForm.currentPassword}
												onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
												placeholder="Entrez votre mot de passe actuel"
												className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
												required
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-600 mb-2">Nouveau mot de passe</label>
											<input
												type="password"
												value={passwordForm.newPassword}
												onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
												placeholder="Entrez votre nouveau mot de passe"
												className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
												required
												minLength={6}
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-600 mb-2">Confirmer le nouveau mot de passe</label>
											<input
												type="password"
												value={passwordForm.confirmPassword}
												onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
												placeholder="Confirmez votre nouveau mot de passe"
												className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
												required
												minLength={6}
											/>
										</div>

										{passwordForm.newPassword && passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
											<div className="text-red-500 text-sm flex items-center gap-2">
												<IconLock className="w-4 h-4" />
												Les mots de passe ne correspondent pas
											</div>
										)}

										{passwordForm.newPassword && passwordForm.newPassword.length < 6 && (
											<div className="text-orange-500 text-sm flex items-center gap-2">
												<IconLock className="w-4 h-4" />
												Le mot de passe doit contenir au moins 6 caractères
											</div>
										)}

										{passwordForm.newPassword && (
											<div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
												<h4 className="text-sm font-medium text-blue-800 mb-2">Critères de sécurité :</h4>
												<ul className="text-sm space-y-1">
													<li className={`flex items-center gap-2 ${passwordForm.newPassword.length >= 6 ? 'text-green-600' : 'text-gray-500'}`}>
														<span className={`w-2 h-2 rounded-full ${passwordForm.newPassword.length >= 6 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
														Au moins 6 caractères
													</li>
													<li className={`flex items-center gap-2 ${/[A-Z]/.test(passwordForm.newPassword) ? 'text-green-600' : 'text-gray-500'}`}>
														<span className={`w-2 h-2 rounded-full ${/[A-Z]/.test(passwordForm.newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
														Une majuscule (recommandé)
													</li>
													<li className={`flex items-center gap-2 ${/[0-9]/.test(passwordForm.newPassword) ? 'text-green-600' : 'text-gray-500'}`}>
														<span className={`w-2 h-2 rounded-full ${/[0-9]/.test(passwordForm.newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
														Un chiffre (recommandé)
													</li>
													<li className={`flex items-center gap-2 ${/[!@#$%^&*(),.?":{}|<>]/.test(passwordForm.newPassword) ? 'text-green-600' : 'text-gray-500'}`}>
														<span className={`w-2 h-2 rounded-full ${/[!@#$%^&*(),.?":{}|<>]/.test(passwordForm.newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
														Un caractère spécial (recommandé)
													</li>
												</ul>
											</div>
										)}

										<div className="flex justify-end pt-4 border-t border-gray-200">
											<button
												type="submit"
												disabled={
													changePassword.isPending ||
													!passwordForm.currentPassword ||
													!passwordForm.newPassword ||
													!passwordForm.confirmPassword ||
													passwordForm.newPassword !== passwordForm.confirmPassword ||
													passwordForm.newPassword.length < 6
												}
												className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:opacity-90 transition-opacity font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
											>
												{changePassword.isPending ? (
													<>
														<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
														Modification...
													</>
												) : (
													<>
														<IconLock className="w-5 h-5" />
														Changer le mot de passe
													</>
												)}
											</button>
										</div>
									</form>
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
