import { useState, useEffect } from 'react';
import { useRouter } from '@tanstack/react-router';
import { User, Globe, Moon, Sun } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../config/api';

interface User {
	firstName: string;
	lastName: string;
	email: string;
}

export const Settings = () => {
	const router = useRouter();
	const [user, setUser] = useState<User | null>(null);
	const [isDarkMode, setIsDarkMode] = useState(false);

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const userData = await api.get<User>('/auth/me');
				setUser(userData);
			} catch (error) {
				console.error('Erreur lors de la récupération des informations utilisateur:', error);
				toast.error('Erreur lors du chargement des informations utilisateur', { duration: 3000 });
			}
		};

		fetchUser();
	}, []);

	return (
		<div className="max-w-4xl mx-auto">
			<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
				<h1 className="text-2xl font-bold text-gray-800 mb-8">Paramètres</h1>

				{/* Profile Section */}
				<section className="mb-8">
					<div className="flex items-center gap-4 mb-6">
						<div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
							<span className="text-2xl font-bold text-blue-600">
								{user?.firstName?.[0]}{user?.lastName?.[0]}
							</span>
						</div>
						<div>
							<h2 className="text-lg font-semibold text-gray-800">
								{user?.firstName} {user?.lastName}
							</h2>
							<p className="text-gray-600">{user?.email}</p>
						</div>
					</div>

					<div className="space-y-4">
						<button
							className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors duration-200"
							onClick={() => router.navigate({ to: '/home/settings/update-profile' })}
						>
							<User className="w-5 h-5 text-gray-600" />
							<div>
								<h3 className="font-medium text-gray-800">Informations personnelles</h3>
								<p className="text-sm text-gray-600">Gérez vos informations de profil</p>
							</div>
						</button>
					</div>
				</section>

				{/* Preferences Section */}
				<section>
					<h2 className="text-lg font-semibold text-gray-800 mb-4">Préférences</h2>
					<div className="space-y-4">
						<div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
							<div className="flex items-center gap-4">
								<Globe className="w-5 h-5 text-gray-600" />
								<div>
									<h3 className="font-medium text-gray-800">Langue</h3>
									<p className="text-sm text-gray-600">Choisissez votre langue</p>
								</div>
							</div>
							<button className="text-blue-600 hover:text-blue-700">Français</button>
						</div>

						<div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
							<div className="flex items-center gap-4">
								{isDarkMode ? (
									<Moon className="w-5 h-5 text-gray-600" />
								) : (
									<Sun className="w-5 h-5 text-gray-600" />
								)}
								<div>
									<h3 className="font-medium text-gray-800">Thème</h3>
									<p className="text-sm text-gray-600">
										{isDarkMode ? 'Mode sombre' : 'Mode clair'}
									</p>
								</div>
							</div>
							<button
								onClick={() => setIsDarkMode(!isDarkMode)}
								className=" cursor-pointer text-blue-600 hover:text-blue-700"
							>
								{isDarkMode ? 'Désactiver' : 'Activer'}
							</button>
						</div>
					</div>
				</section>
			</div>
		</div>
	);
};
