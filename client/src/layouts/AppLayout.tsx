import { SideBar } from '../components/SideBar'
import { Outlet } from '@tanstack/react-router'


export function AppLayout() {
	return (
		<div className="flex h-screen bg-gray-50">
			<SideBar />
			<main className="flex-1 overflow-auto">
				<Outlet />
			</main>
		</div>
	)
}
