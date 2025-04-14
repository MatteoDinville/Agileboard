import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import { Home } from '../features/home/Home';
import { MainLayout } from '../layouts/MainLayout';
import { LandingPage } from '../pages/LandingPage';
import { Settings } from '../features/settings/Settings';
import { EditProfile } from '../features/settings/EditProfile';

// Create a root route
const rootRoute = createRootRoute();

// Create an index route
const indexRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/',
	component: LandingPage,
});

// Create a home route
const homeRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/home',
	component: Home,
});

// Create a login route
const loginRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/login',
	component: MainLayout,
});

// Create a register route
const registerRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/register',
	component: MainLayout,
});

const settingsRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/settings',
	component: Settings,
});

const editProfileRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/settings/edit-profile',
	component: EditProfile,
});

// Create the route tree
const routeTree = rootRoute.addChildren([
	indexRoute,
	homeRoute,
	loginRoute,
	registerRoute,
	settingsRoute,
	editProfileRoute,
]);

// Create the router
export const router = createRouter({ routeTree });

// Register the router for type safety
declare module '@tanstack/react-router' {
	interface Register {
		router: typeof router;
	}
}