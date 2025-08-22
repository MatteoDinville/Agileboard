import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { AppRouter } from "./router";
import { ThemeProvider } from "./contexts/ThemeContext";

const queryClient = new QueryClient();

const App: React.FC = () => (
	<QueryClientProvider client={queryClient}>
		<ThemeProvider>
			<AppRouter />
		</ThemeProvider>
		<Toaster
			position="top-right"
			toastOptions={{
				duration: 4000,
				style: {
					borderRadius: '12px',
					padding: '16px',
					fontSize: '14px',
					fontWeight: '500',
					boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
				},
				success: {
					iconTheme: {
						primary: '#10b981',
						secondary: '#fff',
					},
				},
				error: {
					iconTheme: {
						primary: '#ef4444',
						secondary: '#fff',
					},
				},
			}}
		/>
	</QueryClientProvider>
);

export default App;
