import { useState, useEffect } from 'react';
import { Modal } from '../../components/Modal';
import { api } from '../../config/api';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

interface CreateProjectModalProps {
	readonly isOpen: boolean;
	readonly onClose: () => void;
}

export function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [key, setKey] = useState('');
	const queryClient = useQueryClient();

	useEffect(() => {
		if (name.length >= 3) {
			setKey(name.substring(0, 3).toUpperCase());
		} else {
			setKey('');
		}
	}, [name]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (name.length < 3) {
			toast.error('Le nom du projet doit contenir au moins 3 caractères');
			return;
		}
		setIsLoading(true);

		try {
			await api.post('/projects', {
				name,
				description,
				key,
			});
			toast.success('Projet créé avec succès');
			setName('');
			setDescription('');
			setKey('');
			onClose();
			queryClient.invalidateQueries({ queryKey: ['projects'] });
		} catch (error) {
			console.error('Error creating project:', error);
			toast.error('Erreur lors de la création du projet');
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Créer un nouveau projet"
			showCloseButton
		>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
						Nom du projet
					</label>
					<input
						type="text"
						id="name"
						className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm
							focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
							hover:border-gray-400 transition-colors duration-200 ease-in-out
							disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70
							appearance-none cursor-pointer
							text-gray-700 text-sm font-medium"
						required
						minLength={3}
						value={name}
						onChange={(e) => setName(e.target.value)}
					/>
				</div>
				<div>
					<label htmlFor="key" className="block text-sm font-medium text-gray-700 mb-2">
						Clé du projet
					</label>
					<input
						type="text"
						id="key"
						className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm
							text-gray-700 text-sm font-medium"
						readOnly
						value={key}
					/>
					<p className="mt-1 text-sm text-gray-500">
						La clé est automatiquement générée à partir des 3 premières lettres du nom du projet
					</p>
				</div>
				<div>
					<label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
						Description du projet
					</label>
					<textarea
						id="description"
						className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm
							focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
							hover:border-gray-400 transition-colors duration-200 ease-in-out
							disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70
							appearance-none cursor-pointer
							text-gray-700 text-sm font-medium"
						rows={3}
						value={description}
						onChange={(e) => setDescription(e.target.value)}
					/>
				</div>
				<div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
					<button
						type="submit"
						disabled={isLoading}
						className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
					>
						{isLoading ? 'Création...' : 'Créer'}
					</button>
					<button
						type="button"
						onClick={onClose}
						disabled={isLoading}
						className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
					>
						Annuler
					</button>
				</div>
			</form>
		</Modal>
	)
}
