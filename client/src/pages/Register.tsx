import React, { useState, useContext } from "react";
import { User, Mail, Lock, Eye, EyeOff, UserPlus, AlertCircle } from "lucide-react";
import { AuthContext } from "../contexts/AuthContext";
import { Link, useSearch, useNavigate } from "@tanstack/react-router";

const Register: React.FC = () => {
	const { registerMutation } = useContext(AuthContext);
	const navigate = useNavigate();
	const search = useSearch({ strict: false }) as { redirect?: string; message?: string };

	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		registerMutation.mutate(
			{ email, password, name },
			{
				onSuccess: () => {
					// Si on a une redirection (ex: invitation), aller là, sinon dashboard
					if (search.redirect) {
						navigate({ to: search.redirect });
					} else {
						navigate({ to: "/dashboard" });
					}
				}
			}
		);
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				{/* Logo/Brand */}
				<div className="text-center mb-8">
					<div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
						<UserPlus className="w-8 h-8 text-white" />
					</div>
					<h1 className="text-3xl font-bold text-gray-900 mb-2">Créer votre compte</h1>
					<p className="text-gray-600">Rejoignez-nous dès aujourd'hui</p>
				</div>

				{/* Form Card */}
				<div className="bg-white rounded-2xl shadow-xl shadow-emerald-100/50 p-8 border border-gray-100">
					{/* Message d'invitation si présent */}
					{search.message && (
						<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center space-x-3">
							<Mail className="w-5 h-5 text-blue-500 flex-shrink-0" />
							<p className="text-blue-700 text-sm">
								{search.message}
							</p>
						</div>
					)}

					{registerMutation.isError && (
						<div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center space-x-3">
							<AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
							<p className="text-red-700 text-sm">
								{(registerMutation.error)?.message || "Erreur d'inscription"}
							</p>
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Name Field */}
						<div>
							<label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
								Nom complet
							</label>
							<div className="relative">
								<User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
								<input
									id="name"
									type="text"
									value={name}
									onChange={(e) => setName(e.target.value)}
									className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-gray-50 focus:bg-white"
									placeholder="Jean Dupont"
									required
								/>
							</div>
						</div>
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
									className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-gray-50 focus:bg-white"
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
									className="w-full pl-11 pr-12 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-gray-50 focus:bg-white"
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
							disabled={registerMutation.isPending}
							className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 px-4 rounded-lg hover:from-emerald-600 hover:to-teal-700 focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 font-medium flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{registerMutation.isPending ? (
								<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
							) : (
								<>
									<span>Créer mon compte</span>
									<UserPlus className="w-4 h-4" />
								</>
							)}
						</button>
					</form>

					{/* Divider */}
					<div className="mt-8 pt-6 border-t border-gray-200">
						<p className="text-center text-sm text-gray-600">
							Déjà un compte ?{" "}
							<Link
								to="/login"
								search={search.redirect ? { redirect: search.redirect, message: search.message } : undefined}
								className="text-emerald-600 hover:text-emerald-500 font-medium"
							>
								Connectez-vous
							</Link>
						</p>
					</div>
				</div >
			</div >
		</div >
	);
};

export default Register;
