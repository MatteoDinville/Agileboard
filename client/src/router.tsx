import React from "react";
import {
	createRootRoute,
	createRoute,
	createRouter,
	Outlet,
	Navigate,
	RouterProvider
} from "@tanstack/react-router";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Welcome from "./pages/Welcome";
import { AuthProvider, AuthContext } from "./contexts/AuthContext";

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

const ProtectedDashboard = () => {
	const { user, isLoading } = React.useContext(AuthContext);

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
					<p className="text-gray-600">Vérification de l'authentification...</p>
				</div>
			</div>
		);
	}

	if (!user) {
		return <Navigate to="/welcome" replace />;
	}

	return <Dashboard />;
};

const dashboardRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/dashboard",
	component: ProtectedDashboard,
});

const routeTree = rootRoute.addChildren([
	indexRoute,
	welcomeRoute,
	loginRoute,
	registerRoute,
	dashboardRoute,
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
