import { useContext } from 'react';
import { AccessibilityContext } from '../contexts/AccessibilityContext';

export const useAccessibilityContext = () => {
	const context = useContext(AccessibilityContext);
	if (!context) {
		throw new Error('useAccessibilityContext must be used within an AccessibilityProvider');
	}
	return context;
};
