import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { Link, useNavigate } from "@tanstack/react-router";
import {
	User, LogOut, Home, Settings,
	TrendingUp, AlertTriangle, Target, Calendar, CheckCircle2,
	BarChart3, Activity, Zap, Menu, X
} from "lucide-react";
import { useTaskStatistics, useProjectStatistics, useAllUserTasks } from "../utils/hooks/task";
import { useProjects } from "../utils/hooks/project";
import UserInvitationsNotifications from "../components/UserInvitationsNotifications";
import { PageLoader } from "../components/Loading";
import toast from "react-hot-toast";
import { useTheme } from "../contexts/useTheme";
import ThemeToggle from "../components/ThemeToggle";

const Dashboard: React.FC = () => {
	const navigate = useNavigate();
	const { user, logout } = useContext(AuthContext);
	const [message, setMessage] = useState<string>("");
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	useTheme();

	const { isLoading: projectsLoading } = useProjects();
	const { isLoading: tasksLoading } = useAllUserTasks();

	const taskStats = useTaskStatistics();
	const projectStats = useProjectStatistics();

	const isLoading = projectsLoading || tasksLoading;

	useEffect(() => {
		setMessage(`Bienvenue, ${user?.name ?? "utilisateur"} !`);
	}, [user]);

	const handleLogout = () => {
		toast.success('À bientôt ! 👋', {
			duration: 2000,
		});
		logout();
	};

	if (isLoading) {
		return <PageLoader label="Chargement du tableau de bord..." />;
	}

	return (
		<div className={"min-h-screen transition-colors duration-300 bg-white dark:bg-gray-900"}>
			{/* Header */}
			<header className="bg-white/80 dark:bg-gray-900/60 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800 sticky top-0 z-10 transition-colors">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						<div className="flex items-center space-x-3">
							<div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
								<Home className="w-5 h-5 text-white" />
							</div>
							<h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">Dashboard</h1>
						</div>

						{/* Desktop Menu */}
						<div className="hidden sm:flex items-center space-x-2 lg:space-x-4">
							<UserInvitationsNotifications />
							<ThemeToggle />
							<button
								className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
								onClick={() => navigate({ to: "/settings" })}
								title="Paramètres"
							>
								<Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
							</button>
							<button
								onClick={handleLogout}
								className="flex items-center space-x-2 px-3 lg:px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
							>
								<LogOut className="w-4 h-4" />
								<span className="text-sm font-medium dark:text-gray-100 hidden lg:inline">Déconnexion</span>
							</button>
						</div>

						{/* Mobile Menu Button */}
						<button
							onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
							className="sm:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
						>
							{isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
						</button>
					</div>

					{/* Mobile Menu */}
					{isMobileMenuOpen && (
						<div className="sm:hidden border-t border-gray-200 dark:border-gray-700 py-4 space-y-3">
							<div className="flex items-center justify-between">
								<UserInvitationsNotifications />
								<ThemeToggle />
							</div>
							<button
								className="w-full flex items-center space-x-3 p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
								onClick={() => {
									navigate({ to: "/settings" });
									setIsMobileMenuOpen(false);
								}}
							>
								<Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
								<span className="text-sm font-medium dark:text-gray-100">Paramètres</span>
							</button>
							<button
								onClick={() => {
									handleLogout();
									setIsMobileMenuOpen(false);
								}}
								className="w-full flex items-center space-x-3 p-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
							>
								<LogOut className="w-4 h-4" />
								<span className="text-sm font-medium dark:text-gray-100">Déconnexion</span>
							</button>
						</div>
					)}
				</div>
			</header>

			{/* Main Content */}
			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
				{/* Welcome Card */}
				<div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl shadow-indigo-100/50 dark:shadow-black/20 p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-gray-100 dark:border-gray-800 transition-colors">
					<div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
						<div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
							<User className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
						</div>
						<div className="text-center sm:text-left">
							<h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{message}</h2>
							<p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">Voici un aperçu de votre activité</p>
						</div>
					</div>

					{/* Quick Stats Grid */}
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
						{/* Projets actifs */}
						<div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-6 rounded-xl border border-blue-100 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-black/20 transition-shadow">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-blue-600 dark:text-blue-400 text-xs sm:text-sm font-medium">Projets actifs</p>
									<p className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-blue-300">
										{projectStats.activeProjects}
									</p>
									<p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
										sur {projectStats.totalProjects} au total
									</p>
								</div>
								<div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-950 rounded-lg flex items-center justify-center">
									<Home className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-300" />
								</div>
							</div>
						</div>

						{/* Tâches complétées */}
						<div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-6 rounded-xl border border-green-100 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-black/20 transition-shadow">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-green-600 dark:text-green-400 text-xs sm:text-sm font-medium">Tâches complétées</p>
									<p className="text-2xl sm:text-3xl font-bold text-green-900 dark:text-green-300">
										{taskStats.completedTasks}
									</p>
									<p className="text-xs text-green-600 dark:text-green-400 mt-1">
										{taskStats.completionRate}% de réussite
									</p>
								</div>
								<div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-950 rounded-lg flex items-center justify-center">
									<CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-300" />
								</div>
							</div>
						</div>

						{/* Tâches urgentes */}
						<div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-6 rounded-xl border border-orange-100 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-black/20 transition-shadow">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-orange-600 dark:text-orange-400 text-xs sm:text-sm font-medium">Tâches urgentes</p>
									<p className="text-2xl sm:text-3xl font-bold text-orange-900 dark:text-orange-300">
										{taskStats.urgentTasks}
									</p>
									<p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
										{taskStats.overdueTasks} en retard
									</p>
								</div>
								<div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 dark:bg-orange-950 rounded-lg flex items-center justify-center">
									<AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-300" />
								</div>
							</div>
						</div>

						{/* Tâches ce mois */}
						<div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-6 rounded-xl border border-purple-100 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-black/20 transition-shadow">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-purple-600 dark:text-purple-400 text-xs sm:text-sm font-medium">Ce mois-ci</p>
									<p className="text-2xl sm:text-3xl font-bold text-purple-900 dark:text-purple-300">
										{taskStats.tasksThisMonth}
									</p>
									<p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
										nouvelles tâches
									</p>
								</div>
								<div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 dark:bg-purple-950 rounded-lg flex items-center justify-center">
									<Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-300" />
								</div>
							</div>
						</div>
					</div>

					{/* Detailed Stats */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
						{/* Task Status Distribution */}
						<div className="bg-gray-50 dark:bg-gray-900/60 rounded-xl p-4 sm:p-6 border border-transparent dark:border-gray-800 transition-colors">
							<h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
								<BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
								Répartition des tâches
							</h3>
							<div className="space-y-3 sm:space-y-4">
								<div className="flex items-center justify-between">
									<div className="flex items-center">
										<div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
										<span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">À faire</span>
									</div>
									<div className="flex items-center">
										<span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 mr-2">
											{taskStats.pendingTasks}
										</span>
										<div className="w-16 sm:w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
											<div
												className="bg-blue-500 h-2 rounded-full"
												style={{ width: `${taskStats.totalTasks > 0 ? (taskStats.pendingTasks / taskStats.totalTasks) * 100 : 0}%` }}
											></div>
										</div>
									</div>
								</div>
								<div className="flex items-center justify-between">
									<div className="flex items-center">
										<div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
										<span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">En cours</span>
									</div>
									<div className="flex items-center">
										<span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 mr-2">
											{taskStats.inProgressTasks}
										</span>
										<div className="w-16 sm:w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
											<div
												className="bg-yellow-500 h-2 rounded-full"
												style={{ width: `${taskStats.totalTasks > 0 ? (taskStats.inProgressTasks / taskStats.totalTasks) * 100 : 0}%` }}
											></div>
										</div>
									</div>
								</div>
								<div className="flex items-center justify-between">
									<div className="flex items-center">
										<div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
										<span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Terminées</span>
									</div>
									<div className="flex items-center">
										<span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 mr-2">
											{taskStats.completedTasks}
										</span>
										<div className="w-16 sm:w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
											<div
												className="bg-green-500 h-2 rounded-full"
												style={{ width: `${taskStats.totalTasks > 0 ? (taskStats.completedTasks / taskStats.totalTasks) * 100 : 0}%` }}
											></div>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Project Status Distribution */}
						<div className="bg-gray-50 dark:bg-gray-900/60 rounded-xl p-4 sm:p-6 border border-transparent dark:border-gray-800 transition-colors">
							<h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
								<Activity className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
								État des projets
							</h3>
							<div className="space-y-3 sm:space-y-4">
								<div className="flex items-center justify-between">
									<div className="flex items-center">
										<div className="w-3 h-3 bg-amber-500 rounded-full mr-3"></div>
										<span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">En attente</span>
									</div>
									<div className="flex items-center">
										<span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 mr-2">
											{projectStats.pendingProjects}
										</span>
										<div className="w-16 sm:w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
											<div
												className="bg-amber-500 h-2 rounded-full"
												style={{ width: `${projectStats.totalProjects > 0 ? (projectStats.pendingProjects / projectStats.totalProjects) * 100 : 0}%` }}
											></div>
										</div>
									</div>
								</div>
								<div className="flex items-center justify-between">
									<div className="flex items-center">
										<div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
										<span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">En cours</span>
									</div>
									<div className="flex items-center">
										<span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 mr-2">
											{projectStats.activeProjects}
										</span>
										<div className="w-16 sm:w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
											<div
												className="bg-blue-500 h-2 rounded-full"
												style={{ width: `${projectStats.totalProjects > 0 ? (projectStats.activeProjects / projectStats.totalProjects) * 100 : 0}%` }}
											></div>
										</div>
									</div>
								</div>
								<div className="flex items-center justify-between">
									<div className="flex items-center">
										<div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
										<span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Terminés</span>
									</div>
									<div className="flex items-center">
										<span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 mr-2">
											{projectStats.completedProjects}
										</span>
										<div className="w-16 sm:w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
											<div
												className="bg-green-500 h-2 rounded-full"
												style={{ width: `${projectStats.totalProjects > 0 ? (projectStats.completedProjects / projectStats.totalProjects) * 100 : 0}%` }}
											></div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Action Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
					{/* Nouveau projet */}
					<div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg shadow-gray-100/50 dark:shadow-black/20 p-4 sm:p-6 border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all duration-300 hover:scale-105">
						<div className="flex items-center mb-4">
							<div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-950 rounded-lg flex items-center justify-center mr-3 sm:mr-4">
								<Zap className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-300" />
							</div>
							<h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Nouveau projet</h3>
						</div>
						<p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm mb-4">Créez un nouveau projet pour organiser vos tâches et collaborer avec votre équipe</p>
						<Link
							to="/projects/new"
							className="block w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 sm:py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors text-center font-medium text-sm sm:text-base"
						>
							Commencer un projet
						</Link>
					</div>

					{/* Mes projets */}
					<div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg shadow-gray-100/50 dark:shadow-black/20 p-4 sm:p-6 border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all duration-300 hover:scale-105">
						<div className="flex items-center mb-4">
							<div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-950 rounded-lg flex items-center justify-center mr-3 sm:mr-4">
								<Target className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-300" />
							</div>
							<h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Mes projets</h3>
						</div>
						<p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm mb-4">Consultez et gérez tous vos projets en cours et terminés</p>
						<Link
							to="/projects"
							className="block w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 sm:py-3 px-4 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-colors text-center font-medium text-sm sm:text-base"
						>
							Voir mes projets
						</Link>
					</div>

					{/* Statistiques */}
					<div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg shadow-gray-100/50 dark:shadow-black/20 p-4 sm:p-6 border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all duration-300 hover:scale-105">
						<div className="flex items-center mb-4">
							<div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 dark:bg-purple-950 rounded-lg flex items-center justify-center mr-3 sm:mr-4">
								<TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-300" />
							</div>
							<h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Productivité</h3>
						</div>
						<div className="space-y-2 mb-4">
							<div className="flex justify-between items-center">
								<span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Taux de completion</span>
								<span className="text-xs sm:text-sm font-semibold text-purple-600 dark:text-purple-300">{taskStats.completionRate}%</span>
							</div>
							<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
								<div
									className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-300"
									style={{ width: `${taskStats.completionRate}%` }}
								></div>
							</div>
							<p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
								{taskStats.totalTasks} tâches au total
							</p>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
};

export default Dashboard;
