import { createContext, useState, useContext, type ReactNode, useMemo, useCallback, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { authService } from "../services/auth";
import type { RegisterData, LoginData } from "../services/auth";
import { useNavigate } from "@tanstack/react-router";

interface User {
	id: number;
	email: string;
	name?: string;
}

interface AuthResponse {
	user: User;
	message?: string;
}

interface AuthContextType {
	user: User | null;
	isLoading: boolean;
	setUser: React.Dispatch<React.SetStateAction<User | null>>;
	loginMutation: ReturnType<typeof useMutation<AuthResponse, Error, LoginData>>;
	registerMutation: ReturnType<typeof useMutation<AuthResponse, Error, RegisterData>>;
	logout: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType>({
	user: null,
	isLoading: true,
	setUser: () => { },
	loginMutation: {} as ReturnType<typeof useMutation<AuthResponse, Error, LoginData>>,
	registerMutation: {} as ReturnType<typeof useMutation<AuthResponse, Error, RegisterData>>,
	logout: () => { }
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	const [isInitialized, setIsInitialized] = useState(false);
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const { data: meData, isLoading, error } = useQuery({
		queryKey: ['auth', 'me'],
		queryFn: authService.getCurrentUser,
		retry: false,
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
	});

	useEffect(() => {
		if (!isLoading) {
			setIsInitialized(true);
		}

		if (meData?.user) {
			setUser(meData.user);
		} else if (error || (meData && !meData.user)) {
			setUser(null);
		}
	}, [meData, isLoading, error]);

	const loginMutation = useMutation<AuthResponse, Error, LoginData>({
		mutationFn: async ({ email, password }: LoginData) => {
			const res = await authService.login({ email, password });
			if (!res) throw new Error("No response from login");
			return res;
		},
		onSuccess: (data) => {
			setUser(data.user);
			queryClient.invalidateQueries({ queryKey: ['auth'] });
			navigate({ to: "/dashboard" });
		},
	});

	const registerMutation = useMutation<AuthResponse, Error, RegisterData>({
		mutationFn: async ({ email, password, name }: RegisterData) => {
			const res = await authService.register({ email, password, name });
			if (!res) throw new Error("No response from register");
			return res;
		},
		onSuccess: (data) => {
			setUser(data.user);
			queryClient.invalidateQueries({ queryKey: ['auth'] });
			navigate({ to: "/dashboard" });
		},
	});

	const logout = useCallback(async () => {
		try {
			await authService.logout();
		} catch (error) {
			console.error("Erreur lors de la déconnexion:", error);
		} finally {
			setUser(null);
			queryClient.clear();
			navigate({ to: "/welcome" });
		}
	}, [navigate, queryClient]);

	const contextValue = useMemo(() => ({
		user,
		isLoading: !isInitialized,
		setUser,
		loginMutation,
		registerMutation,
		logout,
	}), [user, isInitialized, loginMutation, registerMutation, logout]);

	return (
		<AuthContext.Provider value={contextValue}>
			{children}
		</AuthContext.Provider>
	);
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};
