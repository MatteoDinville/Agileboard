import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { Link } from "@tanstack/react-router";
import { User, LogOut, Home, Settings, Bell, Loader, Play, BookmarkCheck } from "lucide-react";
import { useProjects } from "../utils/hooks/project";

const Dashboard: React.FC = () => {
	const { user, logout } = useContext(AuthContext);
	const [message, setMessage] = useState<string>("");
	const { data: projects } = useProjects();

	useEffect(() => {
		setMessage(`Bienvenue, ${user?.name ?? "utilisateur"} !`);
	}, [user]);

	const handleLogout = () => {
		logout();
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
			{/* Header */}
			<header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						<div className="flex items-center space-x-3">
							<div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
								<Home className="w-5 h-5 text-white" />
							</div>
							<h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
						</div>

						<div className="flex items-center space-x-4">
							<button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
								<Bell className="w-5 h-5" />
							</button>
							<button
								onClick={handleLogout}
								className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
							>
								<LogOut className="w-4 h-4" />
								<span className="text-sm font-medium">Déconnexion</span>
							</button>
						</div>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Welcome Card */}
				<div className="bg-white rounded-2xl shadow-xl shadow-indigo-100/50 p-8 mb-8 border border-gray-100">
					<div className="flex items-center space-x-4 mb-6">
						<div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
							<User className="w-8 h-8 text-white" />
						</div>
						<div>
							<h2 className="text-2xl font-bold text-gray-900">{message}</h2>
							<p className="text-gray-600">Ravi de vous revoir parmi nous</p>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{/* Projets actifs - Bleu (actuel/activité) */}
						<div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-blue-600 text-sm font-medium">Projets actifs</p>
									<p className="text-2xl pt-2 font-bold text-blue-900">
										{projects?.length}
									</p>
								</div>
								<div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
									<Home className="w-6 h-6 text-blue-600" />
								</div>
							</div>
						</div>

						{/* Tâches complétées - Vert (succès/terminé) */}
						<div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-green-600 text-sm font-medium">Tâches complétées</p>
									<p className="text-2xl pt-2 font-bold text-green-900">48</p>
								</div>
								<div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
									<Settings className="w-6 h-6 text-green-600" />
								</div>
							</div>
						</div>

						{/* Notifications - Orange/Rouge (attention/alerte) */}
						<div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl border border-orange-100">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-orange-600 text-sm font-medium">Notifications</p>
									<p className="text-2xl pt-2 font-bold text-orange-900">3</p>
								</div>
								<div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
									<Bell className="w-6 h-6 text-orange-600" />
								</div>
							</div>
						</div>
					</div>

					{/* Stats Section */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
						{/* Projets en attente - Jaune/Amber (attente/pause) */}
						<div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-6 rounded-xl border border-amber-100">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-amber-600 text-sm font-medium">Projets en attente</p>
									<p className="text-2xl pt-2 font-bold text-amber-900">
                                        5
									</p>
								</div>
								<div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
									<Loader className="w-6 h-6 text-amber-600" />
								</div>
							</div>
						</div>

						{/* Projets en cours - Bleu (activité/progression) */}
						<div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-100">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-blue-600 text-sm font-medium">Projets en cours</p>
									<p className="text-2xl pt-2 font-bold text-blue-900">
                                        7
									</p>
								</div>
								<div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
									<Play className="w-6 h-6 text-blue-600" />
								</div>
							</div>
						</div>

						{/* Projets terminés - Vert (succès/achevé) */}
						<div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-green-600 text-sm font-medium">Projets terminés</p>
									<p className="text-2xl pt-2 font-bold text-green-900">
										12
									</p>
								</div>
								<div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
									<BookmarkCheck className="w-6 h-6 text-green-600" />
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					<div className="bg-white rounded-xl shadow-lg shadow-gray-100/50 p-6 border border-gray-100 hover:shadow-xl transition-shadow">
						<h3 className="text-lg font-semibold text-gray-900 mb-2">Nouveau projet</h3>
						<p className="text-gray-600 text-sm mb-4">Créez un nouveau projet pour organiser vos tâches</p>
						<Link
							to="/projects/new"
							className="block w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-colors text-center"
						>
							Commencer
						</Link>
					</div>

				</div>
			</main>
		</div>
	);
};

export default Dashboard;