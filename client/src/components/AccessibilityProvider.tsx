import React, { ReactNode } from 'react';
import { useAccessibility } from '../hooks/useAccessibility';
import { AccessibilityContext } from '../contexts/AccessibilityContext';

interface AccessibilityProviderProps {
	children: ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
	const { announceToScreenReader, focusFirstInteractiveElement, trapFocus } = useAccessibility();

	return (
		<AccessibilityContext.Provider
			value={{
				announceToScreenReader,
				focusFirstInteractiveElement,
				trapFocus,
			}}
		>
			{children}
		</AccessibilityContext.Provider>
	);
};
