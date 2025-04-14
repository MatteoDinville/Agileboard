// src/pages/__root.tsx
import { Outlet } from '@tanstack/react-router'
import { MainLayout } from '../layouts/MainLayout'

export default function RootRoute() {
	return (
		<MainLayout>
			<Outlet />
		</MainLayout>
	)
}
