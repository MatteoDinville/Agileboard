import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import { Home } from './features/home/Home';
import { MainLayout } from './layouts/MainLayout';
import { LandingPage } from './features/LandingPage';
import { Settings } from './features/settings/Settings';
import { EditProfile } from './features/settings/EditProfile';
const rootRoute = createRootRoute();

const indexRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/',
	component: LandingPage,
});

const homeRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/home',
	component: Home,
});

const loginRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/login',
	component: MainLayout,
});

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
	path: '/settings/update-profile',
	component: EditProfile,
});

const routeTree = rootRoute.addChildren([
	indexRoute,
	homeRoute,
	loginRoute,
	registerRoute,
	settingsRoute,
	editProfileRoute,
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
	interface Register {
		router: typeof router;
	}
}
