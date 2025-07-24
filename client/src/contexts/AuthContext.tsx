import { createContext, useState, useContext, type ReactNode, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login as apiLogin, register as apiRegister, logout as apiLogout } from "../services/auth";
import type { RegisterData, LoginData } from "../services/auth";
import { useNavigate } from "@tanstack/react-router";

const getCookie = (name: string): string | null => {
	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);
	if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
	return null;
};

interface User {
	id: number;
	email: string;
	name?: string;
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
	const [token, setToken] = useState<string | null>(null);
	const [user, setUser] = useState<User | null>(null);
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	useEffect(() => {
		const cookieToken = getCookie('authToken');
		if (cookieToken) {
			setToken(cookieToken);
			const storedUserJson = localStorage.getItem("user");
			if (storedUserJson) {
				setUser(JSON.parse(storedUserJson));
			}
		}
	}, []);


	const loginMutation = useMutation({
		mutationFn: ({ email, password }: LoginData) => apiLogin({ email, password }),
		onSuccess: (data) => {
			setToken(data.token);
			setUser(data.user);
			localStorage.setItem("user", JSON.stringify(data.user));
			navigate({ to: "/dashboard" });
		},
	});

	const registerMutation = useMutation({
		mutationFn: ({ email, password, name }: RegisterData) => apiRegister({ email, password, name }),
		onSuccess: (data) => {
			setToken(data.token);
			setUser(data.user);
			localStorage.setItem("user", JSON.stringify(data.user));
			navigate({ to: "/dashboard" });
		},
	});

	const logout = () => {
		apiLogout().catch(console.error);
		navigate({ to: "/welcome" });
		localStorage.removeItem("user");
		queryClient.clear();
		setToken(null);
		setUser(null);
	};

	return (
		<AuthContext.Provider value={{ user, token, setUser, loginMutation, registerMutation, logout }}>
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