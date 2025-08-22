import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAccessibilityContext } from '../hooks/useAccessibilityContext';

interface AccessibleModalProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	children: React.ReactNode;
	description?: string;
}

export const AccessibleModal: React.FC<AccessibleModalProps> = ({
	isOpen,
	onClose,
	title,
	children,
	description
}) => {
	const modalRef = useRef<HTMLDivElement>(null);
	const { trapFocus, announceToScreenReader } = useAccessibilityContext();

	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
			announceToScreenReader(`Modal ouverte: ${title}`);

			if (modalRef.current) {
				const cleanup = trapFocus(modalRef.current);
				return cleanup;
			}
		} else {
			document.body.style.overflow = 'unset';
		}
	}, [isOpen, title, trapFocus, announceToScreenReader]);

	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isOpen) {
				onClose();
			}
		};

		document.addEventListener('keydown', handleEscape);
		return () => document.removeEventListener('keydown', handleEscape);
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return createPortal(
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
			role="dialog"
			aria-modal="true"
			aria-labelledby="modal-title"
			aria-describedby={description ? "modal-description" : undefined}
			onClick={(e) => {
				if (e.target === e.currentTarget) {
					onClose();
				}
			}}
		>
			<div
				ref={modalRef}
				className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
				role="document"
			>
				<div className="flex items-center justify-between p-6 border-b">
					<h2 id="modal-title" className="text-lg font-semibold text-gray-900">
						{title}
					</h2>
					<button
						type="button"
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md p-1"
						aria-label="Fermer la modal"
					>
						<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				{description && (
					<div id="modal-description" className="px-6 py-2 text-sm text-gray-600">
						{description}
					</div>
				)}

				<div className="p-6">
					{children}
				</div>
			</div>
		</div>,
		document.body
	);
};
