import { Outlet, useRouter } from '@tanstack/react-router';
import { useEffect, useState, ReactNode } from 'react';
import { AuthModal } from '../features/auth/AuthModal';
import { Toaster } from 'react-hot-toast';

interface MainLayoutProps {
	children?: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
	const router = useRouter();
	const [showAuthModal, setShowAuthModal] = useState(false);

	useEffect(() => {
		const checkAuth = async () => {
			try {
				const response = await fetch('http://localhost:4000/api/auth/me', {
					credentials: 'include'
				});
				if (response.ok) {
					if (router.state.location.pathname === '/') {
						router.navigate({ to: '/home' });
					}
				} else if (router.state.location.pathname === '/home') {
					router.navigate({ to: '/' });
				}
			} catch (error) {
				console.error('Erreur lors de la vérification de l\'authentification:', error);
				if (router.state.location.pathname === '/home') {
					router.navigate({ to: '/' });
				}
			}
		};
		if (router.state.location.pathname !== '/login' && router.state.location.pathname !== '/register') {
			checkAuth();
		}
	}, [router]);

	useEffect(() => {
		if (router.state.location.pathname === '/login' || router.state.location.pathname === '/register') {
			setShowAuthModal(true);
		} else {
			setShowAuthModal(false);
		}
	}, [router.state.location.pathname]);

	const handleCloseModal = () => {
		setShowAuthModal(false);
		router.navigate({ to: '/' });
	};

	const defaultTab = router.state.location.pathname === '/register' ? 'register' : 'login';

	return (
		<>
			<div>
				{children}
			</div>
			<Outlet />
			<AuthModal isOpen={showAuthModal} onClose={handleCloseModal} defaultTab={defaultTab} />
			<Toaster position="top-center" />
		</>
	);
}
