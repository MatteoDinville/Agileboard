import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ProjectForm from '../../pages/ProjectForm'

vi.mock('@tanstack/react-query', async (importOriginal) => {
	const actual = await importOriginal()
	return {
		...actual,
		useQuery: vi.fn(),
		useMutation: vi.fn(),
	}
})

vi.mock('@tanstack/react-router', () => ({
	useParams: vi.fn(),
	useNavigate: vi.fn(),
	useSearch: vi.fn(),
}))

vi.mock('../../utils/hooks/project', () => ({
	useProject: vi.fn(),
	useCreateProject: vi.fn(),
	useUpdateProject: vi.fn(),
}))

import { useNavigate } from '@tanstack/react-router'
import { useProject, useCreateProject, useUpdateProject } from '../../utils/hooks/project'

const mockProject = {
	id: 1,
	title: 'Test Project',
	description: 'Test project description',
	status: 'En cours' as const,
	priority: 'Haute' as const,
	createdAt: '2024-01-01T00:00:00Z',
	updatedAt: '2024-01-02T00:00:00Z',
}

const createWrapper = () => {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { retry: false },
			mutations: { retry: false },
		},
	})
	return ({ children }: { children: React.ReactNode }) => (
		<QueryClientProvider client={queryClient}>
			{children}
		</QueryClientProvider>
	)
}

describe('ProjectForm', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('Create Mode', () => {
		beforeEach(() => {
			vi.mocked(useProject).mockReturnValue({
				data: undefined,
				isLoading: false,
				isError: false,
				error: null,
			} as any)
			vi.mocked(useCreateProject).mockReturnValue({
				mutate: vi.fn(),
				isPending: false,
				isError: false,
				error: null,
			} as any)
			vi.mocked(useUpdateProject).mockReturnValue({
				mutate: vi.fn(),
				isPending: false,
				isError: false,
				error: null,
			} as any)
		})

		it('should render create form', () => {
			render(<ProjectForm />, { wrapper: createWrapper() })

			expect(screen.getByText('Créer un nouveau projet')).toBeInTheDocument()
			expect(screen.getByText('Donnez vie à votre nouvelle idée')).toBeInTheDocument()
			expect(screen.getByLabelText('Titre du projet')).toBeInTheDocument()
			expect(screen.getByLabelText(/Description/)).toBeInTheDocument()
			expect(screen.getByLabelText('Statut')).toBeInTheDocument()
			expect(screen.getByLabelText('Priorité')).toBeInTheDocument()
			expect(screen.getByText('Créer le projet')).toBeInTheDocument()
			expect(screen.getByText('Annuler')).toBeInTheDocument()
		})

		it('should handle form submission for create', async () => {
			const mockMutate = vi.fn()
			vi.mocked(useCreateProject).mockReturnValue({
				mutate: mockMutate,
				isPending: false,
				isError: false,
				error: null,
			} as any)

			render(<ProjectForm />, { wrapper: createWrapper() })

			const titleInput = screen.getByLabelText('Titre du projet')
			const descriptionInput = screen.getByLabelText(/Description/)
			const statusSelect = screen.getByLabelText('Statut')
			const prioritySelect = screen.getByLabelText('Priorité')
			const submitButton = screen.getByText('Créer le projet')

			fireEvent.change(titleInput, { target: { value: 'New Project' } })
			fireEvent.change(descriptionInput, { target: { value: 'New project description' } })
			fireEvent.change(statusSelect, { target: { value: 'En cours' } })
			fireEvent.change(prioritySelect, { target: { value: 'Haute' } })

			fireEvent.click(submitButton)

			expect(mockMutate).toHaveBeenCalledWith(
				{
					title: 'New Project',
					description: 'New project description',
					status: 'En cours',
					priority: 'Haute',
				},
				expect.any(Object)
			)
		})

		it('should show loading state during creation', () => {
			vi.mocked(useCreateProject).mockReturnValue({
				mutate: vi.fn(),
				isPending: true,
				isError: false,
				error: null,
			} as any)

			render(<ProjectForm />, { wrapper: createWrapper() })

			expect(screen.getByText('Création en cours...')).toBeInTheDocument()
			expect(screen.getByRole('button', { name: /Création en cours.../ })).toBeInTheDocument()
		})

		it('should show error state for create', () => {
			vi.mocked(useCreateProject).mockReturnValue({
				mutate: vi.fn(),
				isPending: false,
				isError: true,
				error: { message: 'Creation failed' },
			} as any)

			render(<ProjectForm />, { wrapper: createWrapper() })

			expect(screen.getByText('Creation failed')).toBeInTheDocument()
		})
	})

	describe('Edit Mode', () => {
		beforeEach(() => {
			vi.mocked(useCreateProject).mockReturnValue({
				mutate: vi.fn(),
				isPending: false,
				isError: false,
				error: null,
			} as any)
			vi.mocked(useUpdateProject).mockReturnValue({
				mutate: vi.fn(),
				isPending: false,
				isError: false,
				error: null,
			} as any)
		})

		it('should render edit form with project data', () => {
			vi.mocked(useProject).mockReturnValue({
				data: mockProject,
				isLoading: false,
				isError: false,
				error: null,
			} as any)

			render(<ProjectForm projectId={1} />, { wrapper: createWrapper() })

			expect(screen.getByText('Modifier le projet')).toBeInTheDocument()
			expect(screen.getByText('Apportez les modifications nécessaires à votre projet')).toBeInTheDocument()
			expect(screen.getByDisplayValue('Test Project')).toBeInTheDocument()
			expect(screen.getByDisplayValue('Test project description')).toBeInTheDocument()
			expect(screen.getByDisplayValue('En cours')).toBeInTheDocument()
			expect(screen.getByDisplayValue('Haute')).toBeInTheDocument()
			expect(screen.getByText('Mettre à jour')).toBeInTheDocument()
		})

		it('should show loading state while fetching project', () => {
			vi.mocked(useProject).mockReturnValue({
				data: undefined,
				isLoading: true,
				isError: false,
				error: null,
			} as any)

			render(<ProjectForm projectId={1} />, { wrapper: createWrapper() })

			expect(screen.getByText('Chargement du projet…')).toBeInTheDocument()
		})

		it('should show error state when project fetch fails', () => {
			vi.mocked(useProject).mockReturnValue({
				data: undefined,
				isLoading: false,
				isError: true,
				error: { message: 'Project not found' },
			} as any)

			render(<ProjectForm projectId={1} />, { wrapper: createWrapper() })

			expect(screen.getByText('Erreur de chargement')).toBeInTheDocument()
			expect(screen.getByText('Project not found')).toBeInTheDocument()
			expect(screen.getByText('Retour aux projets')).toBeInTheDocument()
		})

		it('should handle form submission for update', async () => {
			const mockMutate = vi.fn()
			vi.mocked(useProject).mockReturnValue({
				data: mockProject,
				isLoading: false,
				isError: false,
				error: null,
			} as any)
			vi.mocked(useUpdateProject).mockReturnValue({
				mutate: mockMutate,
				isPending: false,
				isError: false,
				error: null,
			} as any)

			render(<ProjectForm projectId={1} />, { wrapper: createWrapper() })

			const titleInput = screen.getByLabelText('Titre du projet')
			const submitButton = screen.getByText('Mettre à jour')

			fireEvent.change(titleInput, { target: { value: 'Updated Project' } })
			fireEvent.click(submitButton)

			expect(mockMutate).toHaveBeenCalledWith(
				{
					id: 1,
					data: {
						title: 'Updated Project',
						description: 'Test project description',
						status: 'En cours',
						priority: 'Haute',
					},
				},
				expect.any(Object)
			)
		})

		it('should show loading state during update', () => {
			vi.mocked(useProject).mockReturnValue({
				data: mockProject,
				isLoading: false,
				isError: false,
				error: null,
			} as any)
			vi.mocked(useUpdateProject).mockReturnValue({
				mutate: vi.fn(),
				isPending: true,
				isError: false,
				error: null,
			} as any)

			render(<ProjectForm projectId={1} />, { wrapper: createWrapper() })

			expect(screen.getByText('Mise à jour en cours...')).toBeInTheDocument()
			expect(screen.getByRole('button', { name: /Mise à jour en cours.../ })).toBeDisabled()
		})

		it('should show error state for update', () => {
			vi.mocked(useProject).mockReturnValue({
				data: mockProject,
				isLoading: false,
				isError: false,
				error: null,
			} as any)
			vi.mocked(useUpdateProject).mockReturnValue({
				mutate: vi.fn(),
				isPending: false,
				isError: true,
				error: { message: 'Update failed' },
			} as any)

			render(<ProjectForm projectId={1} />, { wrapper: createWrapper() })

			expect(screen.getByText('Update failed')).toBeInTheDocument()
		})
	})

	describe('Form Validation', () => {
		beforeEach(() => {
			vi.mocked(useProject).mockReturnValue({
				data: undefined,
				isLoading: false,
				isError: false,
				error: null,
			} as any)
			vi.mocked(useCreateProject).mockReturnValue({
				mutate: vi.fn(),
				isPending: false,
				isError: false,
				error: null,
			} as any)
			vi.mocked(useUpdateProject).mockReturnValue({
				mutate: vi.fn(),
				isPending: false,
				isError: false,
				error: null,
			} as any)
		})

		it('should require title field', () => {
			render(<ProjectForm />, { wrapper: createWrapper() })

			const titleInput = screen.getByLabelText('Titre du projet')
			expect(titleInput).toBeRequired()
		})

		it('should have correct default values', () => {
			render(<ProjectForm />, { wrapper: createWrapper() })

			const statusSelect = screen.getByLabelText('Statut')
			const prioritySelect = screen.getByLabelText('Priorité')

			expect(statusSelect).toHaveValue('En attente')
			expect(prioritySelect).toHaveValue('Basse')
		})

		it('should have all status options', () => {
			render(<ProjectForm />, { wrapper: createWrapper() })

			const statusSelect = screen.getByLabelText('Statut')
			const options = Array.from(statusSelect.querySelectorAll('option'))

			expect(options).toHaveLength(3)
			expect(options[0]).toHaveValue('En attente')
			expect(options[1]).toHaveValue('En cours')
			expect(options[2]).toHaveValue('Terminé')
		})

		it('should have all priority options', () => {
			render(<ProjectForm />, { wrapper: createWrapper() })

			const prioritySelect = screen.getByLabelText('Priorité')
			const options = Array.from(prioritySelect.querySelectorAll('option'))

			expect(options).toHaveLength(3)
			expect(options[0]).toHaveValue('Basse')
			expect(options[1]).toHaveValue('Moyenne')
			expect(options[2]).toHaveValue('Haute')
		})

		it('should navigate to projects after successful creation', () => {
			const mockNavigate = vi.fn()

			let onSuccessCallback: (() => void) | undefined

			const mockMutateWithCallback = vi.fn((_data, options) => {
				onSuccessCallback = options?.onSuccess
			})

			vi.mocked(useNavigate).mockReturnValue(mockNavigate)
			vi.mocked(useCreateProject).mockReturnValue({
				mutate: mockMutateWithCallback,
				isPending: false,
				isError: false,
				error: null,
			})

			render(<ProjectForm />, { wrapper: createWrapper() })

			const titleInput = screen.getByLabelText('Titre du projet')
			const submitButton = screen.getByText('Créer le projet')

			fireEvent.change(titleInput, { target: { value: 'New Project' } })
			fireEvent.click(submitButton)

			expect(mockMutateWithCallback).toHaveBeenCalled()

			if (onSuccessCallback) {
				onSuccessCallback()
			}

			expect(mockNavigate).toHaveBeenCalledWith({ to: '/projects' })
		})

		it('should disable submit button when updating is pending', () => {
			vi.mocked(useProject).mockReturnValue({
				data: mockProject,
				isLoading: false,
				isError: false,
				error: null,
			})
			vi.mocked(useUpdateProject).mockReturnValue({
				mutate: vi.fn(),
				isPending: true,
				isError: false,
				error: null,
			})

			render(<ProjectForm projectId={1} />, { wrapper: createWrapper() })

			const submitButton = screen.getByRole('button', { name: /Mise à jour en cours.../ })
			expect(submitButton).toBeDisabled()
		})

		it('should navigate to projects after successful update', () => {
			const mockNavigate = vi.fn()

			let onSuccessCallback: (() => void) | undefined

			const mockMutateWithCallback = vi.fn((_data, options) => {
				onSuccessCallback = options?.onSuccess
			})

			vi.mocked(useNavigate).mockReturnValue(mockNavigate)
			vi.mocked(useProject).mockReturnValue({
				data: mockProject,
				isLoading: false,
				isError: false,
				error: null,
			})
			vi.mocked(useUpdateProject).mockReturnValue({
				mutate: mockMutateWithCallback,
				isPending: false,
				isError: false,
				error: null,
			})

			render(<ProjectForm projectId={1} />, { wrapper: createWrapper() })

			const titleInput = screen.getByLabelText('Titre du projet')
			const submitButton = screen.getByText('Mettre à jour')

			fireEvent.change(titleInput, { target: { value: 'Updated Project' } })
			fireEvent.click(submitButton)

			expect(mockMutateWithCallback).toHaveBeenCalled()

			if (onSuccessCallback) {
				onSuccessCallback()
			}

			expect(mockNavigate).toHaveBeenCalledWith({ to: '/projects' })
		})
	})
})
