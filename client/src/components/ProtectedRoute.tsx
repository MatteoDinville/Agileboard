import { useEffect, useState } from 'react';
import { useRouter } from '@tanstack/react-router';

interface ProtectedRouteProps {
	children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
	const router = useRouter();
	const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

	useEffect(() => {
		const checkAuth = async () => {
			try {
				const response = await fetch('http://localhost:4000/api/auth/me', {
					credentials: 'include'
				});
				if (!response.ok) {
					router.navigate({ to: '/' });
				} else {
					setIsAuthenticated(true);
				}
			} catch (error) {
				console.error('Erreur lors de la vérification de l\'authentification:', error);
				router.navigate({ to: '/' });
			}
		};
		checkAuth();
	}, [router]);

	if (isAuthenticated === null) {
		return <div>Chargement...</div>;
	}

	return isAuthenticated ? <>{children}</> : null;
};
