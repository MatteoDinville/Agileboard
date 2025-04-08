import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
	children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
	const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

	useEffect(() => {
		const verifyAuth = async () => {
			try {
				const response = await fetch('http://localhost:4000/api/home', {
					credentials: 'include'
				});
				setIsAuthenticated(response.ok);
			} catch (error) {
				console.error('Erreur lors de la vérification de l\'authentification:', error);
				setIsAuthenticated(false);
			}
		};

		verifyAuth();
	}, []);

	if (isAuthenticated === null) {
		return <div>Chargement...</div>;
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" replace />;
	}

	return <>{children}</>;
};
