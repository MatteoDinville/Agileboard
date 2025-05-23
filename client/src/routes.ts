// src/routes.ts
import {
	createRootRoute,
	createRoute,
	createRouter,
} from '@tanstack/react-router'

import { LandingPage } from './features/LandingPage'
import { AuthModalWrapper } from './layouts/AuthModalWrapper'
import { AppLayout } from './layouts/AppLayout'
import { Home } from './features/home/Home'
import { ProjetsPage } from './features/project/ProjectsPage'
import { ProjectDetailsPage } from './features/project/ProjectDetailsPage'
import { Settings } from './features/settings/Settings'
import { EditProfile } from './features/settings/EditProfile'

// 1️⃣ Seul createRootRoute, SANS component
const rootRoute = createRootRoute()

// 2️⃣ Public routes directement sous rootRoute
const landingRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/',              // GET '/'
	component: LandingPage,
})

const loginRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: 'login',          // GET '/login'
	component: AuthModalWrapper,
})

const registerRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: 'register',       // GET '/register'
	component: AuthModalWrapper,
})

// 3️⃣ Private “/home/*” routes avec AppLayout
const appLayoutRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: 'home',           // GET '/home/*'
	component: AppLayout,
})

const homeIndexRoute = createRoute({
	getParentRoute: () => appLayoutRoute,
	path: '/',              // GET '/home'
	component: Home,
})

const projectsRoute = createRoute({
	getParentRoute: () => appLayoutRoute,
	path: 'projects',       // GET '/home/projects'
	component: ProjetsPage,
})

const projectDetailsRoute = createRoute({
	getParentRoute: () => projectsRoute,
	path: '$projectId',     // GET '/home/projects/:projectId'
	parseParams: (p: { projectId: string }) => p,
	component: ProjectDetailsPage,
})

const settingsRoute = createRoute({
	getParentRoute: () => appLayoutRoute,
	path: 'settings',       // GET '/home/settings'
	component: Settings,
})

const editProfileRoute = createRoute({
	getParentRoute: () => settingsRoute,
	path: 'update-profile', // GET '/home/settings/update-profile'
	component: EditProfile,
})

// 4️⃣ Assemble
const routeTree = rootRoute.addChildren([
	landingRoute,
	loginRoute,
	registerRoute,
	appLayoutRoute.addChildren([
		homeIndexRoute,
		projectsRoute.addChildren([projectDetailsRoute]),
		settingsRoute.addChildren([editProfileRoute]),
	]),
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
	interface Register {
		router: typeof router
	}
}
