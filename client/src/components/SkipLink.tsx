import React from 'react';

export const SkipLink: React.FC = () => {
	return (
		<a
			href="#main-content"
			className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
			onClick={(e) => {
				e.preventDefault();
				const mainContent = document.getElementById('main-content');
				if (mainContent) {
					mainContent.focus();
					mainContent.scrollIntoView({ behavior: 'smooth' });
				}
			}}
		>
			Passer au contenu principal
		</a>
	);
};
