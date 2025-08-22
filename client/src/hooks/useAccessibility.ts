import { useEffect, useRef, useCallback } from 'react';

export const useAccessibility = () => {
	const skipLinkRef = useRef<HTMLAnchorElement>(null);

	const announceToScreenReader = useCallback((message: string) => {
		const announcement = document.createElement('div');
		announcement.setAttribute('aria-live', 'polite');
		announcement.setAttribute('aria-atomic', 'true');
		announcement.className = 'sr-only';
		announcement.textContent = message;

		document.body.appendChild(announcement);

		setTimeout(() => {
			document.body.removeChild(announcement);
		}, 1000);
	}, []);

	const handleSkipLink = useCallback(() => {
		skipLinkRef.current?.focus();
	}, []);

	const focusFirstInteractiveElement = useCallback((container: HTMLElement) => {
		const focusableElements = container.querySelectorAll(
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
		);

		if (focusableElements.length > 0) {
			(focusableElements[0] as HTMLElement).focus();
		}
	}, []);

	const trapFocus = useCallback((container: HTMLElement) => {
		const focusableElements = container.querySelectorAll(
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
		);

		const firstElement = focusableElements[0] as HTMLElement;
		const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Tab') {
				if (e.shiftKey) {
					if (document.activeElement === firstElement) {
						e.preventDefault();
						lastElement.focus();
					}
				} else {
					if (document.activeElement === lastElement) {
						e.preventDefault();
						firstElement.focus();
					}
				}
			}
		};

		container.addEventListener('keydown', handleKeyDown);

		return () => {
			container.removeEventListener('keydown', handleKeyDown);
		};
	}, []);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Tab' && !e.shiftKey) {
				handleSkipLink();
			}
		};

		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [handleSkipLink]);

	return {
		skipLinkRef,
		announceToScreenReader,
		focusFirstInteractiveElement,
		trapFocus,
	};
};
