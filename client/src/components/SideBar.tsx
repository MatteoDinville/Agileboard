import {
	LayoutDashboard,
	FolderOpen,
	ListTodo,
	Users,
	LogOut,
	Settings,
	Moon,
	Sun,
	ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { useRouter } from '@tanstack/react-router';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import { Logo } from '../components/Logo';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { api } from '../config/api';

interface User {
	firstName: string;
	lastName: string;
	email: string;
}

const fetchUser = async (): Promise<User> => {
	return api.get<User>('/auth/me');
};

export const SideBar = () => {
	const router = useRouter();
	const [showUserMenu, setShowUserMenu] = useState(false);

	const {
		data: user,
		isLoading,
	} = useQuery({
		queryKey: ['me'],
		queryFn: fetchUser,
		retry: 1,
	});

	const handleLogout = async () => {
		try {
			await api.post('/auth/logout', {});
			toast.success('Déconnexion réussie', { icon: '👋', duration: 3000 });
			router.navigate({ to: '/' });
		} catch (error) {
			console.error('Erreur lors de la déconnexion:', error);
			toast.error('Erreur lors de la déconnexion', { duration: 3000 });
		}
	};

	const handleMenuClick = (menuItem: string) => {
		toast.success(`Navigation vers ${menuItem}`, { duration: 3000 });
	};

	return (
		<ProtectedRoute>
			<div className="flex h-screen bg-gray-50">
				{/* Sidebar */}
				<div className="w-64 bg-white p-6 shadow-lg border-r border-gray-100 flex flex-col justify-between">
					<div>
						<div className="mb-8 border-b border-gray-100 pb-6">
							<button onClick={() => router.navigate({ to: '/home' })} className="cursor-pointer">
								<Logo className="text-blue-600" />
							</button>
						</div>
						<ul className="space-y-2">
							<div className="flex items-center">
								<label htmlFor="menu" className="text-gray-500 font-bold text-sm pb-2">
									Menu
								</label>
							</div>
							<button
								className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 p-3 rounded-lg cursor-pointer flex items-center transition-all duration-200 w-full"
								onClick={() => handleMenuClick('Dashboard')}
							>
								<LayoutDashboard className="mr-3 w-5 h-5" /> Dashboard
							</button>
							<button className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 p-3 rounded-lg cursor-pointer flex items-center transition-all duration-200" onClick={() => router.navigate({ to: '/home/projects' })}>
								<FolderOpen className="mr-3 w-5 h-5" /> Projects
							</button>
							<button className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 p-3 rounded-lg cursor-pointer flex items-center transition-all duration-200" onClick={() => handleMenuClick('Tasks')}>
								<ListTodo className="mr-3 w-5 h-5" /> Tasks
							</button>
							<button className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 p-3 rounded-lg cursor-pointer flex items-center transition-all duration-200" onClick={() => handleMenuClick('Team')}>
								<Users className="mr-3 w-5 h-5" /> Team
							</button>
						</ul>
					</div>
					<div>
						<button
							onClick={handleLogout}
							className="w-full text-gray-600 hover:text-white p-3 rounded-lg cursor-pointer flex items-center justify-center hover:bg-red-500 transition-all duration-200"
						>
							<LogOut className="mr-3 w-5 h-5" /> Déconnexion
						</button>
						<button
							className="mt-4 flex items-center justify-between cursor-pointer border-t border-gray-100 pt-4 w-full"
							onClick={() => setShowUserMenu(!showUserMenu)}
						>
							<div className="flex items-center">
								<img
									src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
									alt="Profile"
									className="w-10 h-10 rounded-full ring-2 ring-gray-100"
								/>
								<span className="ml-3 text-gray-700 font-medium">
									{isLoading ? 'Loading...' : `${user?.firstName} ${user?.lastName}`}
								</span>
							</div>
							<ChevronRight className={`transform ${showUserMenu ? 'rotate-90' : ''} w-5 h-5 text-gray-400 transition-transform duration-200`} />
						</button>
						{showUserMenu && (
							<div className="mt-2 bg-white rounded-lg shadow-lg border border-gray-100">
								<ul className="py-1">
									<button className="p-3 hover:bg-gray-50 cursor-pointer flex items-center text-gray-600 hover:text-blue-600 transition-colors duration-200" onClick={() => router.navigate({ to: '/home/settings' })}>
										<Settings className="mr-3 w-5 h-5" /> Settings
									</button>
									<button className="p-3 hover:bg-gray-50 cursor-pointer flex items-center text-gray-600 hover:text-blue-600 transition-colors duration-200" onClick={() => toast.success('Mode sombre activé', { duration: 3000 })}>
										<Moon className="mr-3 w-5 h-5" /> Dark Mode
									</button>
									<button className="p-3 hover:bg-gray-50 cursor-pointer flex items-center text-gray-600 hover:text-blue-600 transition-colors duration-200" onClick={() => toast.success('Mode clair activé', { duration: 3000 })}>
										<Sun className="mr-3 w-5 h-5" /> Light Mode
									</button>
								</ul>
							</div>
						)}
					</div>
				</div>
			</div>
		</ProtectedRoute>
	);
};
