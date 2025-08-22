import { createContext } from 'react';

interface AccessibilityContextType {
	announceToScreenReader: (message: string) => void;
	focusFirstInteractiveElement: (container: HTMLElement) => void;
	trapFocus: (container: HTMLElement) => () => void;
}

export const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);
