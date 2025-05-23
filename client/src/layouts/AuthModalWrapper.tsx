// src/layouts/AuthModalWrapper.tsx
import { Outlet, useRouter } from '@tanstack/react-router'
import { AuthModal } from '../features/auth/AuthModal'
import { Toaster } from 'react-hot-toast'

export function AuthModalWrapper() {
	const router = useRouter()
	const isLogin = router.state.location.pathname === '/login'
	const isRegister = router.state.location.pathname === '/register'

	return (
		<>
			<Outlet />
			<AuthModal
				isOpen={isLogin || isRegister}
				onClose={() => router.navigate({ to: '/' })}
				defaultTab={isRegister ? 'register' : 'login'}
			/>
			<Toaster position="top-center" />
		</>
	)
}
