import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { Link, useNavigate } from "@tanstack/react-router";
import {
	User, LogOut, Home, Settings,
	TrendingUp, AlertTriangle, Target, Calendar, CheckCircle2,
	BarChart3, Activity, Zap
} from "lucide-react";
import { useTaskStatistics, useProjectStatistics, useAllUserTasks } from "../utils/hooks/task";
import { useProjects } from "../utils/hooks/project";
import UserInvitationsNotifications from "../components/UserInvitationsNotifications";
import { PageLoader } from "../components/Loading";
import toast from "react-hot-toast";

const Dashboard: React.FC = () => {
	const navigate = useNavigate();
	const { user, logout } = useContext(AuthContext);
	const [message, setMessage] = useState<string>("");

	const { data: projects, isLoading: projectsLoading } = useProjects();
	const { data: tasks, isLoading: tasksLoading } = useAllUserTasks();

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
							<UserInvitationsNotifications />
							<button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
								onClick={() => navigate({ to: "/settings" })}
								title="Paramètres"
							>
								<Settings className="w-5 h-5" />
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
							<p className="text-gray-600">Voici un aperçu de votre activité</p>
						</div>
					</div>

					{/* Quick Stats Grid */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
						{/* Projets actifs */}
						<div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100 hover:shadow-lg transition-shadow">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-blue-600 text-sm font-medium">Projets actifs</p>
									<p className="text-3xl font-bold text-blue-900">
										{projectStats.activeProjects}
									</p>
									<p className="text-xs text-blue-600 mt-1">
										sur {projectStats.totalProjects} au total
									</p>
								</div>
								<div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
									<Home className="w-6 h-6 text-blue-600" />
								</div>
							</div>
						</div>

						{/* Tâches complétées */}
						<div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100 hover:shadow-lg transition-shadow">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-green-600 text-sm font-medium">Tâches complétées</p>
									<p className="text-3xl font-bold text-green-900">
										{taskStats.completedTasks}
									</p>
									<p className="text-xs text-green-600 mt-1">
										{taskStats.completionRate}% de réussite
									</p>
								</div>
								<div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
									<CheckCircle2 className="w-6 h-6 text-green-600" />
								</div>
							</div>
						</div>

						{/* Tâches urgentes */}
						<div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl border border-orange-100 hover:shadow-lg transition-shadow">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-orange-600 text-sm font-medium">Tâches urgentes</p>
									<p className="text-3xl font-bold text-orange-900">
										{taskStats.urgentTasks}
									</p>
									<p className="text-xs text-orange-600 mt-1">
										{taskStats.overdueTasks} en retard
									</p>
								</div>
								<div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
									<AlertTriangle className="w-6 h-6 text-orange-600" />
								</div>
							</div>
						</div>

						{/* Tâches ce mois */}
						<div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100 hover:shadow-lg transition-shadow">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-purple-600 text-sm font-medium">Ce mois-ci</p>
									<p className="text-3xl font-bold text-purple-900">
										{taskStats.tasksThisMonth}
									</p>
									<p className="text-xs text-purple-600 mt-1">
										nouvelles tâches
									</p>
								</div>
								<div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
									<Calendar className="w-6 h-6 text-purple-600" />
								</div>
							</div>
						</div>
					</div>

					{/* Detailed Stats */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
						{/* Task Status Distribution */}
						<div className="bg-gray-50 rounded-xl p-6">
							<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
								<BarChart3 className="w-5 h-5 mr-2" />
								Répartition des tâches
							</h3>
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<div className="flex items-center">
										<div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
										<span className="text-sm text-gray-600">À faire</span>
									</div>
									<div className="flex items-center">
										<span className="text-sm font-semibold text-gray-900 mr-2">
											{taskStats.pendingTasks}
										</span>
										<div className="w-20 bg-gray-200 rounded-full h-2">
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
										<span className="text-sm text-gray-600">En cours</span>
									</div>
									<div className="flex items-center">
										<span className="text-sm font-semibold text-gray-900 mr-2">
											{taskStats.inProgressTasks}
										</span>
										<div className="w-20 bg-gray-200 rounded-full h-2">
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
										<span className="text-sm text-gray-600">Terminées</span>
									</div>
									<div className="flex items-center">
										<span className="text-sm font-semibold text-gray-900 mr-2">
											{taskStats.completedTasks}
										</span>
										<div className="w-20 bg-gray-200 rounded-full h-2">
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
						<div className="bg-gray-50 rounded-xl p-6">
							<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
								<Activity className="w-5 h-5 mr-2" />
								État des projets
							</h3>
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<div className="flex items-center">
										<div className="w-3 h-3 bg-amber-500 rounded-full mr-3"></div>
										<span className="text-sm text-gray-600">En attente</span>
									</div>
									<div className="flex items-center">
										<span className="text-sm font-semibold text-gray-900 mr-2">
											{projectStats.pendingProjects}
										</span>
										<div className="w-20 bg-gray-200 rounded-full h-2">
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
										<span className="text-sm text-gray-600">En cours</span>
									</div>
									<div className="flex items-center">
										<span className="text-sm font-semibold text-gray-900 mr-2">
											{projectStats.activeProjects}
										</span>
										<div className="w-20 bg-gray-200 rounded-full h-2">
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
										<span className="text-sm text-gray-600">Terminés</span>
									</div>
									<div className="flex items-center">
										<span className="text-sm font-semibold text-gray-900 mr-2">
											{projectStats.completedProjects}
										</span>
										<div className="w-20 bg-gray-200 rounded-full h-2">
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
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{/* Nouveau projet */}
					<div className="bg-white rounded-xl shadow-lg shadow-gray-100/50 p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:scale-105">
						<div className="flex items-center mb-4">
							<div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
								<Zap className="w-6 h-6 text-blue-600" />
							</div>
							<h3 className="text-lg font-semibold text-gray-900">Nouveau projet</h3>
						</div>
						<p className="text-gray-600 text-sm mb-4">Créez un nouveau projet pour organiser vos tâches et collaborer avec votre équipe</p>
						<Link
							to="/projects/new"
							className="block w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors text-center font-medium"
						>
							Commencer un projet
						</Link>
					</div>

					{/* Mes projets */}
					<div className="bg-white rounded-xl shadow-lg shadow-gray-100/50 p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:scale-105">
						<div className="flex items-center mb-4">
							<div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
								<Target className="w-6 h-6 text-green-600" />
							</div>
							<h3 className="text-lg font-semibold text-gray-900">Mes projets</h3>
						</div>
						<p className="text-gray-600 text-sm mb-4">Consultez et gérez tous vos projets en cours et terminés</p>
						<Link
							to="/projects"
							className="block w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-colors text-center font-medium"
						>
							Voir mes projets
						</Link>
					</div>

					{/* Statistiques */}
					<div className="bg-white rounded-xl shadow-lg shadow-gray-100/50 p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:scale-105">
						<div className="flex items-center mb-4">
							<div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
								<TrendingUp className="w-6 h-6 text-purple-600" />
							</div>
							<h3 className="text-lg font-semibold text-gray-900">Productivité</h3>
						</div>
						<div className="space-y-2 mb-4">
							<div className="flex justify-between items-center">
								<span className="text-sm text-gray-600">Taux de completion</span>
								<span className="text-sm font-semibold text-purple-600">{taskStats.completionRate}%</span>
							</div>
							<div className="w-full bg-gray-200 rounded-full h-2">
								<div
									className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-300"
									style={{ width: `${taskStats.completionRate}%` }}
								></div>
							</div>
							<p className="text-xs text-gray-500 mt-2">
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
