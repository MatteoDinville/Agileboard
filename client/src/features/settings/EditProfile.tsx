import { useState, useEffect } from 'react';
import { useRouter } from '@tanstack/react-router';
import { User, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { AppLayout } from '../../layouts/AppLayout';
import { api } from '../../config/api';

interface User {
	firstName: string;
	lastName: string;
	email: string;
}

export const EditProfile = () => {
	const router = useRouter();
	const [user, setUser] = useState<User | null>(null);
	const [formData, setFormData] = useState({
		firstName: '',
		lastName: '',
		email: '',
		currentPassword: '',
		newPassword: '',
		confirmPassword: ''
	});

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const userData = await api.get<User>('/auth/me');
				setUser(userData);
				setFormData(prev => ({
					...prev,
					firstName: userData.firstName,
					lastName: userData.lastName,
					email: userData.email
				}));
			} catch (error) {
				console.error('Erreur lors de la récupération des informations utilisateur:', error);
				toast.error('Erreur lors du chargement des informations utilisateur', { duration: 3000 });
			}
		};

		fetchUser();
	}, []);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: value
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			await api.put('/auth/update-profile', {
				firstName: formData.firstName,
				lastName: formData.lastName,
				email: formData.email,
				currentPassword: formData.currentPassword,
				newPassword: formData.newPassword
			});
			toast.success('Profil mis à jour avec succès', { duration: 3000 });
			router.navigate({ to: '/settings' });
		} catch (error) {
			console.error('Erreur lors de la mise à jour du profil:', error);
			toast.error('Erreur lors de la mise à jour du profil', { duration: 3000 });
		}
	};

	return (
		<AppLayout>
			<div className="max-w-4xl mx-auto">
				<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
					<h1 className="text-2xl font-bold text-gray-800 mb-8">Modifier mon profil</h1>

					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Informations personnelles */}
						<section className="space-y-4">
							<div className="flex items-center gap-4 mb-6">
								<div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
									<span className="text-2xl font-bold text-blue-600">
										{user?.firstName?.[0]}{user?.lastName?.[0]}
									</span>
								</div>
								<div>
									<h2 className="text-lg font-semibold text-gray-800">Photo de profil</h2>
									<p className="text-sm text-gray-600">Cliquez pour changer votre photo</p>
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
										Prénom
									</label>
									<input
										id="firstName"
										type="text"
										name="firstName"
										value={formData.firstName}
										onChange={handleInputChange}
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
									/>
								</div>
								<div>
									<label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
										Nom
									</label>
									<input
										id="lastName"
										type="text"
										name="lastName"
										value={formData.lastName}
										onChange={handleInputChange}
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
									/>
								</div>
							</div>

							<div>
								<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
									Email
								</label>
								<input
									id="email"
									type="email"
									name="email"
									value={formData.email}
									onChange={handleInputChange}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								/>
							</div>
						</section>

						{/* Sécurité */}
						<section className="space-y-4">
							<h2 className="text-lg font-semibold text-gray-800">Sécurité</h2>
							<div>
								<label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
									Mot de passe actuel
								</label>
								<input
									id="currentPassword"
									type="password"
									name="currentPassword"
									value={formData.currentPassword}
									onChange={handleInputChange}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								/>
							</div>
							<div>
								<label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
									Nouveau mot de passe
								</label>
								<input
									id="newPassword"
									type="password"
									name="newPassword"
									value={formData.newPassword}
									onChange={handleInputChange}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								/>
							</div>
							<div>
								<label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
									Confirmer le nouveau mot de passe
								</label>
								<input
									id="confirmPassword"
									type="password"
									name="confirmPassword"
									value={formData.confirmPassword}
									onChange={handleInputChange}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								/>
							</div>
						</section>

						<div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
							<button
								type="button"
								onClick={() => router.navigate({ to: '/settings' })}
								className="cursor-pointer px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
							>
								Annuler
							</button>
							<button
								type="submit"
								className="cursor-pointer px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
							>
								<Save className="w-5 h-5" />
								Enregistrer les modifications
							</button>
						</div>
					</form>
				</div>
			</div>
		</AppLayout>
	);
};