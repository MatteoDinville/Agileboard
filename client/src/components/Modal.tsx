import { ReactNode } from 'react';

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	children: ReactNode;
}

export const Modal = ({ isOpen, onClose, children }: ModalProps) => {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 overflow-y-auto">
			{/* Backdrop with blur */}
			<div
				className="fixed inset-0 bg-opacity-30 transition-opacity"
				onClick={onClose}
			/>

			{/* Modal content */}
			<div className="flex min-h-screen items-center justify-center p-4">
				<div className="relative transform overflow-hidden rounded-lg shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
					{/* Close button */}
					{/*<button
						onClick={onClose}
						className="absolute right-4 top-4 text-gray-400 hover:text-gray-500 focus:outline-none z-50 cursor-pointer"
					>
						<span className="sr-only">Fermer</span>
						<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>*/}
					{/* Content */}
					<div className="">
						{children}
					</div>
				</div>
			</div>
		</div>
	);
};
