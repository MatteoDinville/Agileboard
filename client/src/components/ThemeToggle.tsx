import React from "react";
import { Sun, Moon } from "lucide-react";
import clsx from "clsx";
import { useTheme } from "../contexts/useTheme";

interface ThemeToggleProps {
	className?: string;
	iconSize?: "sm" | "md" | "lg";
}

const sizeMap = {
	sm: "w-4 h-4",
	md: "w-5 h-5",
	lg: "w-6 h-6",
} as const;

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className, iconSize = "md" }) => {
	const { theme, toggleTheme } = useTheme();

	const title = theme === "dark" ? "Basculer en mode clair" : "Basculer en mode sombre";
	const iconClass = sizeMap[iconSize];

	return (
		<button
			type="button"
			onClick={toggleTheme}
			title={title}
			aria-label="Basculer le thème"
			aria-pressed={theme === "dark"}
			className={clsx(
				"p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100",
				"dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800",
				"rounded-lg transition-colors cursor-pointer",
				className,
			)}
		>
			{theme === "dark" ? <Sun className={iconClass} /> : <Moon className={iconClass} />}
		</button>
	);
};

export default ThemeToggle;
