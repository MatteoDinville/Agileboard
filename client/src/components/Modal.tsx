import { ReactNode } from 'react';
import { cn } from '../lib/utils';

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	children: ReactNode;
	title?: string;
	showCloseButton?: boolean;
	className?: string;
}

export const Modal = ({
	isOpen,
	onClose,
	children,
	title,
	showCloseButton = false,
	className
}: ModalProps) => {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 overflow-y-auto">
			<div
				className="fixed inset-0 bg-[#00000061] dark:bg-black/60"
				onClick={onClose}
				data-testid="modal-backdrop"
			/>
			<div className="flex min-h-screen items-center justify-center p-4">
				<div
					className={cn(
						"relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg",
						className
					)}
					data-testid="modal-content"
				>
					{(title || showCloseButton) && (
						<div className="flex items-start justify-between px-6 pt-6 pb-4">
							{title && (
								<h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100">
									{title}
								</h3>
							)}
							{showCloseButton && (
								<button
									onClick={onClose}
									className="rounded-md bg-white dark:bg-gray-900 text-gray-400 hover:text-gray-500 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
								>
									<span className="sr-only">Fermer</span>
									<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
									</svg>
								</button>
							)}
						</div>
					)}
					<div className="px-6 pb-6">
						{children}
					</div>
				</div>
			</div>
		</div>
	);
};
