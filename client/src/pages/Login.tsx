import React, { useState, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";
import { Link, useSearch, useNavigate } from "@tanstack/react-router";

const Login: React.FC = () => {
	const { loginMutation } = useContext(AuthContext);
	const navigate = useNavigate();
	const search = useSearch({ strict: false }) as { redirect?: string; message?: string };

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		loginMutation.mutate(
			{ email, password },
			{
				onSuccess: () => {
					if (search.redirect) {
						navigate({ to: search.redirect as any });
					} else {
						navigate({ to: "/dashboard" });
					}
				}
			}
		);
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				{/* Logo/Brand */}
				<div className="text-center mb-8">
					<div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
						<Lock className="w-8 h-8 text-white" />
					</div>
					<h1 className="text-3xl font-bold text-gray-900 mb-2">Bon retour !</h1>
					<p className="text-gray-600">Connectez-vous à votre compte</p>
				</div>

				{/* Form Card */}
				<div className="bg-white rounded-2xl shadow-xl shadow-indigo-100/50 p-8 border border-gray-100">
					{/* Message d'invitation si présent */}
					{search.message && (
						<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center space-x-3">
							<Mail className="w-5 h-5 text-blue-500 flex-shrink-0" />
							<p className="text-blue-700 text-sm">
								{search.message}
							</p>
						</div>
					)}

					{loginMutation.isError && (
						<div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center space-x-3">
							<AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
							<p className="text-red-700 text-sm">
								{(loginMutation.error)?.message || "Erreur de connexion"}
							</p>
						</div>
					)}

					<form className="space-y-6" onSubmit={handleSubmit}>
						{/* Email Field */}
						<div>
							<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
								Adresse email
							</label>
							<div className="relative">
								<Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
								<input
									id="email"
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-gray-50 focus:bg-white"
									placeholder="nom@exemple.com"
									required
								/>
							</div>
						</div>
						{/* Password Field */}
						<div>
							<label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
								Mot de passe
							</label>
							<div className="relative">
								<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
								<input
									id="password"
									type={showPassword ? "text" : "password"}
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className="w-full pl-11 pr-12 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-gray-50 focus:bg-white"
									placeholder="••••••••"
									required
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
								>
									{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
								</button>
							</div>
						</div>

						{/* Submit Button */}
						<button
							type="submit"
							disabled={loginMutation.isPending}
							className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-cyan-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 font-medium flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
						>
							{loginMutation.isPending ? (
								<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
							) : (
								<>
									<span>Se connecter</span>
									<ArrowRight className="w-4 h-4" />
								</>
							)}
						</button>
					</form>

					{/* Divider */}
					<div className="mt-8 pt-6 border-t border-gray-200">
						<p className="text-center text-sm text-gray-600">
							Pas encore de compte ?{" "}
							<Link
								to="/register"
								search={search.redirect ? { redirect: search.redirect, message: search.message } : undefined}
								className="text-blue-600 hover:text-blue-500 font-medium"
							>
								Inscrivez-vous
							</Link>
						</p>
						<p className="text-center text-sm text-gray-600 mt-2">
							<Link
								to="/welcome"
								className="text-gray-500 hover:text-gray-700 font-medium"
							>
								← Retour à l'accueil
							</Link>
						</p>
					</div>
				</div>

				{/* Footer */}
				<div className="text-center mt-8">
					<p className="text-xs text-gray-500">
						En vous connectant, vous acceptez nos{" "}
						<button className="text-blue-600 hover:text-blue-500 underline bg-transparent border-none cursor-pointer">
							Conditions d'utilisation
						</button>{" "}
						et notre{" "}
						<button className="text-blue-600 hover:text-blue-500 underline bg-transparent border-none cursor-pointer">
							Politique de confidentialité
						</button>
					</p>
				</div>
			</div>
		</div>
	);
};

export default Login;
