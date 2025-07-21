import React from "react";
import {
	createRootRoute,
	createRoute,
	createRouter,
	Outlet,
	Navigate,
	RouterProvider,
	useParams,
} from "@tanstack/react-router";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Welcome from "./pages/Welcome";
import { AuthProvider, AuthContext } from "./contexts/AuthContext";

// Root route with AuthProvider
const rootRoute = createRootRoute({
	component: () => (
		<AuthProvider>
			<Outlet />
		</AuthProvider>
	),
});

// Index route - redirects to welcome page
const indexRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/",
	component: () => <Navigate to="/welcome" replace />,
});

// Welcome route (landing page)
const welcomeRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/welcome",
	component: Welcome,
});

// Create route tree
const routeTree = rootRoute.addChildren([
	indexRoute,
	welcomeRoute,
]);

// Create router
const router = createRouter({ routeTree });

// Declare router type for TypeScript
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

export function AppRouter() {
	return <RouterProvider router={router} />;
}
