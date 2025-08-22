import React from "react";

interface SpinnerProps {
	className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ className = "w-6 h-6" }) => (
	<svg
		className={`animate-spin ${className}`}
		viewBox="0 0 24 24"
		xmlns="http://www.w3.org/2000/svg"
		role="status"
		aria-label="Chargement"
	>
		<circle
			className="opacity-25 stroke-current text-gray-300 dark:text-gray-700"
			cx="12"
			cy="12"
			r="10"
			strokeWidth="4"
			fill="none"
		/>
		<path
			className="opacity-75 fill-current text-blue-600 dark:text-indigo-400"
			d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
		/>
	</svg>
);

interface LoaderBaseProps {
	label?: string;
	delayMs?: number;
	minHeight?: number | string;
}

/**
 * PageLoader: fullscreen centered loader with subtle fade to avoid flicker.
 */
export const PageLoader: React.FC<LoaderBaseProps> = ({ label = "Chargement...", delayMs = 150 }) => {
	const [visible, setVisible] = React.useState(delayMs === 0);

	React.useEffect(() => {
		if (delayMs === 0) return;
		const t = setTimeout(() => setVisible(true), delayMs);
		return () => clearTimeout(t);
	}, [delayMs]);

	if (!visible) return null;

	return (
		<div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 transition-colors">
			<div className="flex flex-col items-center gap-3">
				<Spinner className="w-8 h-8" />
				<p className="text-sm text-gray-600 dark:text-gray-300">{label}</p>
			</div>
		</div>
	);
};

/**
 * SectionLoader: use inside cards/sections. Preserves space to minimize layout shift.
 */
export const SectionLoader: React.FC<LoaderBaseProps> = ({ label = "Chargement...", delayMs = 150, minHeight = 180 }) => {
	const [visible, setVisible] = React.useState(delayMs === 0);

	React.useEffect(() => {
		if (delayMs === 0) return;
		const t = setTimeout(() => setVisible(true), delayMs);
		return () => clearTimeout(t);
	}, [delayMs]);

	if (!visible) return null;

	return (
		<div
			className="w-full flex items-center justify-center bg-gray-50 dark:bg-gray-800/40 rounded-lg border border-gray-100 dark:border-gray-700"
			style={{ minHeight }}
		>
			<div className="flex items-center gap-3">
				<Spinner />
				<span className="text-sm text-gray-600 dark:text-gray-300">{label}</span>
			</div>
		</div>
	);
};

export default Spinner;
