import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import SettingsPage from '../../pages/Settings'
import { useProfile } from '../../utils/hooks/user'
import { AuthContext } from '../../contexts/AuthContext'

vi.mock('@tanstack/react-router', () => ({
	useNavigate: () => vi.fn(),
}))

vi.mock('../../utils/hooks/user')


vi.mock('@tanstack/react-query', async (importOriginal) => {
	const actual = await importOriginal()
	return {
		...actual,
		QueryClient: actual.QueryClient,
		QueryClientProvider: actual.QueryClientProvider,
	}
})


vi.mock('lucide-react', () => ({
	Settings: () => <div data-testid="settings">Settings</div>,
	User: () => <div data-testid="user">User</div>,
	Lock: () => <div data-testid="lock">Lock</div>,
	Home: () => <div data-testid="home">Home</div>,
	Camera: () => <div data-testid="camera">Camera</div>,
	Save: () => <div data-testid="save">Save</div>,
}))

const mockUser = {
	id: 1,
	name: 'John Doe',
	email: 'john@example.com',
}

const mockProfileUser = {
	id: 1,
	name: 'John Doe',
	email: 'john@example.com',
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
			<AuthContext.Provider value={{ user: mockUser, login: vi.fn(), logout: vi.fn() }}>
				{children}
			</AuthContext.Provider>
		</QueryClientProvider>
	)
}

describe('SettingsPage', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		global.alert = vi.fn()
	})

	it('should render settings page', () => {
		vi.mocked(useProfile).mockReturnValue({
			user: mockProfileUser,
			updateProfile: {
				mutateAsync: vi.fn(),
				isPending: false,
			},
			changePassword: {
				mutateAsync: vi.fn(),
				isPending: false,
			},
		} as any)

		render(<SettingsPage />, { wrapper: createWrapper() })

		expect(screen.getByText('Paramètres')).toBeInTheDocument()
		expect(screen.getByText('Personnalisez votre expérience utilisateur')).toBeInTheDocument()
		expect(screen.getByText('Informations du profil')).toBeInTheDocument()
		expect(screen.getByText('Changement de mot de passe')).toBeInTheDocument()
	})

	it('should display user information in form fields', () => {
		vi.mocked(useProfile).mockReturnValue({
			user: mockProfileUser,
			updateProfile: {
				mutateAsync: vi.fn(),
				isPending: false,
			},
			changePassword: {
				mutateAsync: vi.fn(),
				isPending: false,
			},
		} as any)

		render(<SettingsPage />, { wrapper: createWrapper() })

		expect(screen.getByDisplayValue('John')).toBeInTheDocument()
		expect(screen.getByDisplayValue('Doe')).toBeInTheDocument()
		expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument()
	})

	it('should handle profile form submission', async () => {
		const mockUpdateProfile = vi.fn().mockResolvedValue(undefined)
		vi.mocked(useProfile).mockReturnValue({
			user: mockProfileUser,
			updateProfile: {
				mutateAsync: mockUpdateProfile,
				isPending: false,
			},
			changePassword: {
				mutateAsync: vi.fn(),
				isPending: false,
			},
		} as any)

		render(<SettingsPage />, { wrapper: createWrapper() })

		const firstNameInput = screen.getByDisplayValue('John')
		const lastNameInput = screen.getByDisplayValue('Doe')
		const emailInput = screen.getByDisplayValue('john@example.com')
		const saveButton = screen.getByText('Sauvegarder les modifications')

		fireEvent.change(firstNameInput, { target: { value: 'Jane' } })
		fireEvent.change(lastNameInput, { target: { value: 'Smith' } })
		fireEvent.change(emailInput, { target: { value: 'jane@example.com' } })

		fireEvent.click(saveButton)

		await waitFor(() => {
			expect(mockUpdateProfile).toHaveBeenCalledWith({
				name: 'Jane Smith',
				email: 'jane@example.com',
			})
		})
	})

	it('should handle password change form submission', async () => {
		const mockChangePassword = vi.fn().mockResolvedValue(undefined)
		vi.mocked(useProfile).mockReturnValue({
			user: mockProfileUser,
			updateProfile: {
				mutateAsync: vi.fn(),
				isPending: false,
			},
			changePassword: {
				mutateAsync: mockChangePassword,
				isPending: false,
			},
		} as any)

		render(<SettingsPage />, { wrapper: createWrapper() })

		const currentPasswordInput = screen.getByPlaceholderText('Entrez votre mot de passe actuel')
		const newPasswordInput = screen.getByPlaceholderText('Entrez votre nouveau mot de passe')
		const confirmPasswordInput = screen.getByPlaceholderText('Confirmez votre nouveau mot de passe')
		const changePasswordButton = screen.getByText('Changer le mot de passe')

		fireEvent.change(currentPasswordInput, { target: { value: 'oldpassword' } })
		fireEvent.change(newPasswordInput, { target: { value: 'newpassword123' } })
		fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword123' } })

		fireEvent.click(changePasswordButton)

		await waitFor(() => {
			expect(mockChangePassword).toHaveBeenCalledWith({
				currentPassword: 'oldpassword',
				newPassword: 'newpassword123',
			})
		})
	})

	it('should show error when passwords do not match', async () => {
		vi.mocked(useProfile).mockReturnValue({
			user: mockProfileUser,
			updateProfile: {
				mutateAsync: vi.fn(),
				isPending: false,
			},
			changePassword: {
				mutateAsync: vi.fn(),
				isPending: false,
			},
		} as any)

		render(<SettingsPage />, { wrapper: createWrapper() })

		const currentPasswordInput = screen.getByPlaceholderText('Entrez votre mot de passe actuel')
		const newPasswordInput = screen.getByPlaceholderText('Entrez votre nouveau mot de passe')
		const confirmPasswordInput = screen.getByPlaceholderText('Confirmez votre nouveau mot de passe')

		fireEvent.change(currentPasswordInput, { target: { value: 'oldpassword' } })
		fireEvent.change(newPasswordInput, { target: { value: 'newpassword123' } })
		fireEvent.change(confirmPasswordInput, { target: { value: 'differentpassword' } })

		expect(screen.getByText('Les mots de passe ne correspondent pas')).toBeInTheDocument()
	})

	it('should show error when new password is too short', async () => {
		vi.mocked(useProfile).mockReturnValue({
			user: mockProfileUser,
			updateProfile: {
				mutateAsync: vi.fn(),
				isPending: false,
			},
			changePassword: {
				mutateAsync: vi.fn(),
				isPending: false,
			},
		} as any)

		render(<SettingsPage />, { wrapper: createWrapper() })

		const newPasswordInput = screen.getByPlaceholderText('Entrez votre nouveau mot de passe')
		fireEvent.change(newPasswordInput, { target: { value: '123' } })

		expect(screen.getByText('Le mot de passe doit contenir au moins 6 caractères')).toBeInTheDocument()
	})

	it('should disable password change button when form is invalid', () => {
		vi.mocked(useProfile).mockReturnValue({
			user: mockProfileUser,
			updateProfile: {
				mutateAsync: vi.fn(),
				isPending: false,
			},
			changePassword: {
				mutateAsync: vi.fn(),
				isPending: false,
			},
		} as any)

		render(<SettingsPage />, { wrapper: createWrapper() })

		const changePasswordButton = screen.getByText('Changer le mot de passe')
		expect(changePasswordButton).toBeDisabled()
	})

	it('should show loading state during profile update', () => {
		vi.mocked(useProfile).mockReturnValue({
			user: mockProfileUser,
			updateProfile: {
				mutateAsync: vi.fn(),
				isPending: true,
			},
			changePassword: {
				mutateAsync: vi.fn(),
				isPending: false,
			},
		} as any)

		render(<SettingsPage />, { wrapper: createWrapper() })

		expect(screen.getByText('Mise à jour...')).toBeInTheDocument()
		expect(screen.getByRole('button', { name: /Mise à jour.../ })).toBeDisabled()
	})

	it('should show loading state during password change', () => {
		vi.mocked(useProfile).mockReturnValue({
			user: mockProfileUser,
			updateProfile: {
				mutateAsync: vi.fn(),
				isPending: false,
			},
			changePassword: {
				mutateAsync: vi.fn(),
				isPending: true,
			},
		} as any)

		render(<SettingsPage />, { wrapper: createWrapper() })

		expect(screen.getByText('Modification...')).toBeInTheDocument()
		expect(screen.getByRole('button', { name: /Modification.../ })).toBeDisabled()
	})

	it('should display password strength indicators', () => {
		vi.mocked(useProfile).mockReturnValue({
			user: mockProfileUser,
			updateProfile: {
				mutateAsync: vi.fn(),
				isPending: false,
			},
			changePassword: {
				mutateAsync: vi.fn(),
				isPending: false,
			},
		} as any)

		render(<SettingsPage />, { wrapper: createWrapper() })

		const newPasswordInput = screen.getByPlaceholderText('Entrez votre nouveau mot de passe')
		fireEvent.change(newPasswordInput, { target: { value: 'Test123!' } })

		expect(screen.getByText('Critères de sécurité :')).toBeInTheDocument()
		expect(screen.getByText('Au moins 6 caractères')).toBeInTheDocument()
		expect(screen.getByText('Une majuscule (recommandé)')).toBeInTheDocument()
		expect(screen.getByText('Un chiffre (recommandé)')).toBeInTheDocument()
		expect(screen.getByText('Un caractère spécial (recommandé)')).toBeInTheDocument()
	})

	it('should display user avatar with initials', () => {
		vi.mocked(useProfile).mockReturnValue({
			user: mockProfileUser,
			updateProfile: {
				mutateAsync: vi.fn(),
				isPending: false,
			},
			changePassword: {
				mutateAsync: vi.fn(),
				isPending: false,
			},
		} as any)

		render(<SettingsPage />, { wrapper: createWrapper() })

		expect(screen.getByText('JD')).toBeInTheDocument()
	})

	it('should show profile photo section as disabled', () => {
		vi.mocked(useProfile).mockReturnValue({
			user: mockProfileUser,
			updateProfile: {
				mutateAsync: vi.fn(),
				isPending: false,
			},
			changePassword: {
				mutateAsync: vi.fn(),
				isPending: false,
			},
		} as any)

		render(<SettingsPage />, { wrapper: createWrapper() })

		expect(screen.getByText('Bientôt disponible')).toBeInTheDocument()
		expect(screen.getByText('Bientôt disponible')).toBeDisabled()
	})

	it('should handle profile update error', async () => {
		const mockUpdateProfile = vi.fn().mockRejectedValue(new Error('Update failed'))
		vi.mocked(useProfile).mockReturnValue({
			user: mockProfileUser,
			updateProfile: {
				mutateAsync: mockUpdateProfile,
				isPending: false,
			},
			changePassword: {
				mutateAsync: vi.fn(),
				isPending: false,
			},
		} as any)

		render(<SettingsPage />, { wrapper: createWrapper() })

		const saveButton = screen.getByText('Sauvegarder les modifications')
		fireEvent.click(saveButton)

		await waitFor(() => {
			expect(mockUpdateProfile).toHaveBeenCalled()
		})
	})

	it('should handle password change error', async () => {
		const mockChangePassword = vi.fn().mockRejectedValue(new Error('Password change failed'))
		vi.mocked(useProfile).mockReturnValue({
			user: mockProfileUser,
			updateProfile: {
				mutateAsync: vi.fn(),
				isPending: false,
			},
			changePassword: {
				mutateAsync: mockChangePassword,
				isPending: false,
			},
		} as any)

		render(<SettingsPage />, { wrapper: createWrapper() })

		const currentPasswordInput = screen.getByPlaceholderText('Entrez votre mot de passe actuel')
		const newPasswordInput = screen.getByPlaceholderText('Entrez votre nouveau mot de passe')
		const confirmPasswordInput = screen.getByPlaceholderText('Confirmez votre nouveau mot de passe')
		const changePasswordButton = screen.getByText('Changer le mot de passe')

		fireEvent.change(currentPasswordInput, { target: { value: 'oldpassword' } })
		fireEvent.change(newPasswordInput, { target: { value: 'newpassword123' } })
		fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword123' } })

		fireEvent.click(changePasswordButton)

		await waitFor(() => {
			expect(mockChangePassword).toHaveBeenCalled()
		})
	})
})
