interface AuthTabsProps {
	activeTab: 'login' | 'register';
	onTabChange: (tab: 'login' | 'register') => void;
}

export const AuthTabs = ({ activeTab, onTabChange }: AuthTabsProps) => {
	return (
		<div className="border-b border-gray-200">
			<nav className="flex" aria-label="Tabs">
				<button
					onClick={() => onTabChange('login')}
					className={`
                        flex-1 py-4 px-1 border-b-2 font-medium text-sm text-center
                        ${activeTab === 'login'
							? 'border-blue-500 text-blue-600 bg-blue-50 '
							: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50 cursor-pointer focus:outline-none'
						}
                    `}
				>
					Connexion
				</button>
				<button
					onClick={() => onTabChange('register')}
					className={`
                        flex-1 py-4 px-1 border-b-2 font-medium text-sm text-center
                        ${activeTab === 'register'
							? 'border-blue-500 text-blue-600 bg-blue-50'
							: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50 cursor-pointer focus:outline-none'
						}
                    `}
				>
					Inscription
				</button>
			</nav>
		</div>
	);
};
