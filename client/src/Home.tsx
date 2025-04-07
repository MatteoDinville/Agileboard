import { LayoutDashboard, FolderOpen, ListTodo, Users, LogOut, Settings, Moon, Sun, ChevronRight, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Logo } from './components/Logo';

interface User {
	firstName: string;
	lastName: string;
	email: string;
}

export const Home = () => {
	const navigate = useNavigate();
	const [showUserMenu, setShowUserMenu] = useState(false);
	const [user, setUser] = useState<User | null>(null);

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const response = await fetch('http://localhost:4000/api/auth/me', {
					credentials: 'include'
				});
				if (response.ok) {
					const userData = await response.json();
					setUser(userData);

					// Vérifier si le toast a déjà été affiché aujourd'hui
					const lastWelcomeDate = localStorage.getItem('lastWelcomeDate');
					const today = new Date().toDateString();

					if (lastWelcomeDate !== today) {
						toast.custom((t) => (
							<div className={`${t.visible ? 'animate-in' : 'animate-out'}`}>
								<div className="bg-green-500 text-white px-4 py-2 rounded-md">
									🎉 Bienvenue {userData.firstName} !
								</div>
							</div>
						));
						localStorage.setItem('lastWelcomeDate', today);
					}
				}
			} catch (error) {
				console.error('Erreur lors de la récupération des informations utilisateur:', error);
				toast.error('Erreur lors du chargement des informations utilisateur', { duration: 3000 });
			}
		};

		fetchUser();
	}, []);

	const handleLogout = async () => {
		try {
			const response = await fetch('http://localhost:4000/api/auth/logout', {
				method: 'POST',
				credentials: 'include'
			});

			if (response.ok) {
				//toast.success('Déconnexion réussie', { icon: '👋', duration: 3000, style: { backgroundColor: '#000000', color: '#ffffff' } });
				toast.success('Déconnexion réussie', { icon: '👋', duration: 3000 });
				navigate('/');
			} else {
				toast.error('Erreur lors de la déconnexion', { duration: 3000 });
			}
		} catch (error) {
			console.error('Erreur lors de la déconnexion:', error);
			toast.error('Erreur lors de la déconnexion', { duration: 3000 });
		}
	};

	const handleMenuClick = (menuItem: string) => {
		toast.success(`Navigation vers ${menuItem}`, { duration: 3000 });
	};

	return (
		<div className="flex h-screen bg-gray-50">
			{/* Sidebar */}
			<div className="w-64 bg-white p-6 shadow-lg border-r border-gray-100 flex flex-col justify-between">
				<div>
					<div className="mb-8 border-b border-gray-100 pb-6">
						<Logo className="text-blue-600" />
					</div>
					<ul className="space-y-2">
						<div className="flex items-center">
							<label className="text-gray-500 font-bold text-sm pb-2">
								Menu
							</label>
						</div>
						<li className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 p-3 rounded-lg cursor-pointer flex items-center transition-all duration-200" onClick={() => handleMenuClick('Dashboard')}>
							<LayoutDashboard className="mr-3 w-5 h-5" /> Dashboard
						</li>
						<li className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 p-3 rounded-lg cursor-pointer flex items-center transition-all duration-200" onClick={() => handleMenuClick('Projects')}>
							<FolderOpen className="mr-3 w-5 h-5" /> Projects
						</li>
						<li className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 p-3 rounded-lg cursor-pointer flex items-center transition-all duration-200" onClick={() => handleMenuClick('Tasks')}>
							<ListTodo className="mr-3 w-5 h-5" /> Tasks
						</li>
						<li className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 p-3 rounded-lg cursor-pointer flex items-center transition-all duration-200" onClick={() => handleMenuClick('Team')}>
							<Users className="mr-3 w-5 h-5" /> Team
						</li>
					</ul>
				</div>
				<div>
					<button
						onClick={handleLogout}
						className="w-full text-gray-600 hover:text-white p-3 rounded-lg cursor-pointer flex items-center justify-center hover:bg-red-500 transition-all duration-200"
					>
						<LogOut className="mr-3 w-5 h-5" /> Déconnexion
					</button>
					<div className="mt-4 flex items-center justify-between cursor-pointer border-t border-gray-100 pt-4" onClick={() => setShowUserMenu(!showUserMenu)}>
						<div className="flex items-center">
							<img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Profile" className="w-10 h-10 rounded-full ring-2 ring-gray-100" />
							<span className="ml-3 text-gray-700 font-medium">{user ? `${user.firstName} ${user.lastName}` : 'Chargement...'}</span>
						</div>
						<ChevronRight className={`transform ${showUserMenu ? 'rotate-90' : ''} w-5 h-5 text-gray-400 transition-transform duration-200`} />
					</div>
					{showUserMenu && (
						<div className="mt-2 bg-white rounded-lg shadow-lg border border-gray-100">
							<ul className="py-1">
								<li className="p-3 hover:bg-gray-50 cursor-pointer flex items-center text-gray-600 hover:text-blue-600 transition-colors duration-200" onClick={() => toast.success('Paramètres ouverts', { duration: 3000 })}>
									<Settings className="mr-3 w-5 h-5" /> Settings
								</li>
								<li className="p-3 hover:bg-gray-50 cursor-pointer flex items-center text-gray-600 hover:text-blue-600 transition-colors duration-200" onClick={() => toast.success('Mode sombre activé', { duration: 3000 })}>
									<Moon className="mr-3 w-5 h-5" /> Dark Mode
								</li>
								<li className="p-3 hover:bg-gray-50 cursor-pointer flex items-center text-gray-600 hover:text-blue-600 transition-colors duration-200" onClick={() => toast.success('Mode clair activé', { duration: 3000 })}>
									<Sun className="mr-3 w-5 h-5" /> Light Mode
								</li>
							</ul>
						</div>
					)}
				</div>
			</div>

			{/* Main Content */}
			<div className="flex-1 flex flex-col overflow-hidden">
				{/* Header */}
				<header className="bg-white border-b border-gray-100 px-8 py-4">
					<button className="inline-flex items-center gap-3 px-6 py-3 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md">
						<FolderOpen className="w-5 h-5 text-blue-500" />
						<span className="font-medium">Mon Projet</span>
						<ChevronDown className="w-5 h-5 text-gray-400" />
					</button>
				</header>

				{/* Main Content Area */}
				<main className="flex-1 overflow-auto p-8">
					<div className="max-w-4xl mx-auto">
						<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
							<h1 className="text-3xl font-bold mb-6 text-gray-800">Welcome to Agileboard</h1>
							<p className="text-gray-600 text-lg">You are now connected!</p>
						</div>
					</div>
				</main>
			</div>
		</div>
	);
};
