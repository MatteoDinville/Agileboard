import { createContext, useState, useContext, type ReactNode, useMemo, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login as apiLogin, register as apiRegister } from "../services/auth";
import type { RegisterData, LoginData } from "../services/auth";
import { useNavigate } from "@tanstack/react-router";

interface User {
	id: number;
	email: string;
	name?: string;
}

interface StoredUserData {
	user: User;
	token: string;
}

interface AuthResponse {
	token: string;
	user: User;
	message?: string;
}

interface AuthContextType {
	user: User | null;
	token: string | null;
	setUser: React.Dispatch<React.SetStateAction<User | null>>;
	loginMutation: ReturnType<typeof useMutation<AuthResponse, Error, LoginData>>;
	registerMutation: ReturnType<typeof useMutation<AuthResponse, Error, RegisterData>>;
	logout: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType>({
	user: null,
	token: null,
	setUser: () => { },
	loginMutation: {} as ReturnType<typeof useMutation<AuthResponse, Error, LoginData>>,
	registerMutation: {} as ReturnType<typeof useMutation<AuthResponse, Error, RegisterData>>,
	logout: () => { },
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	// Initialisation avec les données stockées
	const initializeAuth = (): { user: User | null; token: string | null } => {
		try {
			const storedData = localStorage.getItem("authData");
			if (storedData) {
				const parsedData: StoredUserData = JSON.parse(storedData);
				return {
					user: parsedData.user,
					token: parsedData.token
				};
			}
		} catch (error) {
			console.error("Erreur lors du parsing des données d'authentification:", error);
			localStorage.removeItem("authData");
		}
		return { user: null, token: null };
	};

	const { user: initialUser, token: initialToken } = initializeAuth();

	const [token, setToken] = useState<string | null>(initialToken);
	const [user, setUser] = useState<User | null>(initialUser);
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	// Fonction pour sauvegarder les données d'authentification
	const saveAuthData = (userData: User, userToken: string) => {
		const authData: StoredUserData = {
			user: userData,
			token: userToken
		};
		localStorage.setItem("authData", JSON.stringify(authData));
	};


	const loginMutation = useMutation({
		mutationFn: ({ email, password }: LoginData) => apiLogin({ email, password }),
		onSuccess: (data) => {
			setToken(data.token);
			setUser(data.user);
			saveAuthData(data.user, data.token);
			navigate({ to: "/dashboard" });
		},
	});

	const registerMutation = useMutation({
		mutationFn: ({ email, password, name }: RegisterData) => apiRegister({ email, password, name }),
		onSuccess: (data) => {
			setToken(data.token);
			setUser(data.user);
			saveAuthData(data.user, data.token);
			navigate({ to: "/dashboard" });
		},
	});

	const logout = useCallback(() => {
		navigate({ to: "/welcome" });
		localStorage.removeItem("authData");
		// Nettoyage des anciens items si ils existent
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		queryClient.clear();
		setToken(null);
		setUser(null);
	}, [navigate, queryClient]);

	const contextValue = useMemo(() => ({
		user,
		token,
		setUser,
		loginMutation,
		registerMutation,
		logout
	}), [user, token, loginMutation, registerMutation, logout]);

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
