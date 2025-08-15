import React from "react";
import {
	createRootRoute,
	createRoute,
	createRouter,
	Outlet,
	Navigate,
	RouterProvider,
	useParams
} from "@tanstack/react-router";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Welcome from "./pages/Welcome";
import ProjectsList from "./pages/ProjectsList";
import ProjectForm from "./pages/ProjectForm";
import ProjectDetail from "./pages/ProjectDetail";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import InvitationAcceptPage from "./pages/InvitationAcceptPage";
import { AuthProvider, AuthContext } from "./contexts/AuthContext";

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
	const { user, isLoading } = React.useContext(AuthContext);

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
				</div>
			</div>
		);
	}

	if (!user) {
		return <Navigate to="/login" replace />;
	}

	return <>{children}</>;
};

const rootRoute = createRootRoute({
	component: () => (
		<AuthProvider>
			<Outlet />
		</AuthProvider>
	),
});

const indexRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/",
	component: () => <Navigate to="/welcome" replace />,
});

const welcomeRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/welcome",
	component: Welcome,
});

const loginRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/login",
	component: Login,
});

const registerRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/register",
	component: Register,
});

const ProtectedDashboard = () => (
	<RequireAuth>
		<Dashboard />
	</RequireAuth>
);

const dashboardRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/dashboard",
	component: ProtectedDashboard,
});

const ProtectedProjectsList = () => (
	<RequireAuth>
		<ProjectsList />
	</RequireAuth>
);

const ProtectedCreateProject = () => (
	<RequireAuth>
		<ProjectForm />
	</RequireAuth>
);

const ProtectedEditProject = () => (
	<RequireAuth>
		<ProjectForm projectId={Number(useParams({ from: "/projects/$projectId/edit" }).projectId)} />
	</RequireAuth>
);

const ProtectedProjectDetail = () => (
	<RequireAuth>
		<ProjectDetail />
	</RequireAuth>
);

const ProtectedNotFound = () => (
	<RequireAuth>
		<NotFound />
	</RequireAuth>
);

const ProtectedSettingsRoute = () => (
	<RequireAuth>
		<Settings />
	</RequireAuth>
);

const ProjectsListRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/projects",
	component: ProtectedProjectsList,
});

const CreateProjectRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/projects/new",
	component: ProtectedCreateProject,
});

const EditProjectRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/projects/$projectId/edit",
	component: ProtectedEditProject,
});

const ProjectDetailRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/projects/$projectId",
	component: ProtectedProjectDetail,
});

const SettingsRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/settings",
	component: ProtectedSettingsRoute,
});

const InviteRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/invite/$token",
	component: InvitationAcceptPage,
});

const NotFoundRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '*',
	component: ProtectedNotFound,
});

const routeTree = rootRoute.addChildren([
	indexRoute,
	welcomeRoute,
	loginRoute,
	registerRoute,
	dashboardRoute,
	ProjectsListRoute,
	CreateProjectRoute,
	EditProjectRoute,
	ProjectDetailRoute,
	SettingsRoute,
	InviteRoute,
	NotFoundRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

export function AppRouter() {
	return <RouterProvider router={router} />;
}
