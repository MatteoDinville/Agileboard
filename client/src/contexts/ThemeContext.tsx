import React, { createContext, useEffect, useMemo, useState } from "react";

type Theme = "light" | "dark";

type ThemeContextValue = {
	theme: Theme;
	setTheme: (t: Theme) => void;
	toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [theme, setThemeState] = useState<Theme>(() => {
		try {
			const saved = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
			const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
			if (saved === 'dark' || saved === 'light') return saved as Theme;
			return prefersDark ? 'dark' : 'light';
		} catch {
			return 'light';
		}
	});

	useEffect(() => {
		const root = document.documentElement;
		root.classList.toggle("dark", theme === "dark");
		root.classList.toggle("light", theme === "light");
		localStorage.setItem("theme", theme);
		const meta = document.querySelector('meta[name="theme-color"]');
		if (meta) meta.setAttribute('content', theme === 'dark' ? '#0b0f19' : '#ffffff');
	}, [theme]);

	useEffect(() => {
		const media = window.matchMedia("(prefers-color-scheme: dark)");
		const saved = localStorage.getItem("theme");
		if (saved === "dark" || saved === "light") return;
		const handler = (e: MediaQueryListEvent) => setThemeState(e.matches ? "dark" : "light");
		media.addEventListener("change", handler);
		return () => media.removeEventListener("change", handler);
	}, []);

	const setTheme = (t: Theme) => setThemeState(t);
	const toggleTheme = () => setThemeState((prev) => (prev === "light" ? "dark" : "light"));

	const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme]);
	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export default ThemeContext;
