import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider, type UseMutationResult } from '@tanstack/react-query'
import SettingsPage from '../../pages/Settings'
import { useProfile } from '../../utils/hooks/user'
import { AuthContext, type AuthContextType } from '../../contexts/AuthContext'
import type { IUser, UpdateProfileData, ChangePasswordData } from '../../services/user'

vi.mock('@tanstack/react-router', () => ({
	useNavigate: () => vi.fn(),
}))

vi.mock('../../utils/hooks/user')


vi.mock('@tanstack/react-query', async () => {
	const actual = await vi.importActual('@tanstack/react-query')
	return {
		...actual as Record<string, unknown>,
		QueryClient: (actual as { QueryClient: unknown }).QueryClient,
		QueryClientProvider: (actual as { QueryClientProvider: unknown }).QueryClientProvider,
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

vi.mock('../../components/ThemeToggle', () => ({
	default: () => <div data-testid="theme-toggle">Theme Toggle</div>,
}))

const mockUser = {
	id: 1,
	name: 'John Doe',
	email: 'john@example.com',
}

// Mock helpers for mutations
const createMockUpdateProfileMutation = (overrides = {}): UseMutationResult<{ user: IUser }, Error, UpdateProfileData, unknown> => ({
	mutateAsync: vi.fn(),
	mutate: vi.fn(),
	isPending: false,
	isError: false,
	isSuccess: false,
	isIdle: true,
	data: undefined,
	error: null,
	variables: undefined,
	context: undefined,
	status: 'idle',
	reset: vi.fn(),
	...overrides,
} as unknown as UseMutationResult<{ user: IUser }, Error, UpdateProfileData, unknown>)

const createMockChangePasswordMutation = (overrides = {}): UseMutationResult<unknown, Error, ChangePasswordData, unknown> => ({
	mutateAsync: vi.fn(),
	mutate: vi.fn(),
	isPending: false,
	isError: false,
	isSuccess: false,
	isIdle: true,
	data: undefined,
	error: null,
	variables: undefined,
	context: undefined,
	status: 'idle',
	reset: vi.fn(),
	...overrides,
} as unknown as UseMutationResult<unknown, Error, ChangePasswordData, unknown>)

const mockProfileUser: IUser = {
	id: 1,
	name: 'John Doe',
	email: 'john@example.com',
	createdAt: '2024-01-01T00:00:00Z',
	updatedAt: '2024-01-01T00:00:00Z'
}

const createWrapper = () => {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { retry: false },
			mutations: { retry: false },
		},
	})

	const mockAuthContext: AuthContextType = {
		user: mockUser,
		isLoading: false,
		isAuthenticated: true,
		setUser: vi.fn(),
		loginMutation: {} as AuthContextType['loginMutation'],
		registerMutation: {} as AuthContextType['registerMutation'],
		logout: vi.fn()
	}

	return ({ children }: { children: React.ReactNode }) => (
		<QueryClientProvider client={queryClient}>
			<AuthContext.Provider value={mockAuthContext}>
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
			isLoading: false,
			error: null,
			refetch: vi.fn(),
			updateProfile: createMockUpdateProfileMutation(),
			changePassword: createMockChangePasswordMutation(),
		} as unknown as ReturnType<typeof useProfile>)

		render(<SettingsPage />, { wrapper: createWrapper() })

		expect(screen.getByText('Paramètres')).toBeInTheDocument()
		expect(screen.getByText('Personnalisez votre expérience utilisateur')).toBeInTheDocument()
		expect(screen.getByText('Informations du profil')).toBeInTheDocument()
		expect(screen.getByText('Changement de mot de passe')).toBeInTheDocument()
	})

	it('should display user information in form fields', () => {
		vi.mocked(useProfile).mockReturnValue({
			user: mockProfileUser,
			isLoading: false,
			error: null,
			refetch: vi.fn(),
			updateProfile: createMockUpdateProfileMutation(),
			changePassword: createMockChangePasswordMutation(),
		} as unknown as ReturnType<typeof useProfile>)

		render(<SettingsPage />, { wrapper: createWrapper() })

		expect(screen.getByDisplayValue('John')).toBeInTheDocument()
		expect(screen.getByDisplayValue('Doe')).toBeInTheDocument()
		expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument()
	})

	it('should handle profile form submission', async () => {
		const mockUpdateProfile = vi.fn().mockResolvedValue(undefined)
		vi.mocked(useProfile).mockReturnValue({
			user: mockProfileUser,
			isLoading: false,
			error: null,
			refetch: vi.fn(),
			updateProfile: createMockUpdateProfileMutation({
				mutateAsync: mockUpdateProfile,
			}),
			changePassword: createMockChangePasswordMutation(),
		} as unknown as ReturnType<typeof useProfile>)

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
			isLoading: false,
			error: null,
			refetch: vi.fn(),
			updateProfile: createMockUpdateProfileMutation(),
			changePassword: createMockChangePasswordMutation({
				mutateAsync: mockChangePassword,
			}),
		} as unknown as ReturnType<typeof useProfile>)

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
			isLoading: false,
			error: null,
			refetch: vi.fn(),
			updateProfile: createMockUpdateProfileMutation(),
			changePassword: createMockChangePasswordMutation(),
		} as unknown as ReturnType<typeof useProfile>)

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
			isLoading: false,
			error: null,
			refetch: vi.fn(),
			updateProfile: createMockUpdateProfileMutation(),
			changePassword: createMockChangePasswordMutation(),
		} as unknown as ReturnType<typeof useProfile>)

		render(<SettingsPage />, { wrapper: createWrapper() })

		const newPasswordInput = screen.getByPlaceholderText('Entrez votre nouveau mot de passe')
		fireEvent.change(newPasswordInput, { target: { value: '123' } })

		expect(screen.getByText('Le mot de passe doit contenir au moins 6 caractères')).toBeInTheDocument()
	})

	it('should disable password change button when form is invalid', () => {
		vi.mocked(useProfile).mockReturnValue({
			user: mockProfileUser,
			updateProfile: {
				mutate: vi.fn(),
				isPending: false,
				isSuccess: false,
				error: null
			},
			changePassword: {
				mutate: vi.fn(),
				isPending: false,
				isSuccess: false,
				error: null
			}
		} as unknown as ReturnType<typeof useProfile>)

		render(<SettingsPage />, { wrapper: createWrapper() })

		const changePasswordButton = screen.getByRole('button', { name: /changer le mot de passe/i })
		expect(changePasswordButton).toBeDisabled()
	})

	it('should show loading state during profile update', () => {
		vi.mocked(useProfile).mockReturnValue({
			user: mockProfileUser,
			isLoading: false,
			error: null,
			refetch: vi.fn(),
			updateProfile: createMockUpdateProfileMutation({
				isPending: true,
			}),
			changePassword: createMockChangePasswordMutation(),
		} as unknown as ReturnType<typeof useProfile>)

		render(<SettingsPage />, { wrapper: createWrapper() })

		expect(screen.getByText('Mise à jour...')).toBeInTheDocument()
		expect(screen.getByRole('button', { name: /Mise à jour.../ })).toBeDisabled()
	})

	it('should show loading state during password change', () => {
		vi.mocked(useProfile).mockReturnValue({
			user: mockProfileUser,
			isLoading: false,
			error: null,
			refetch: vi.fn(),
			updateProfile: createMockUpdateProfileMutation(),
			changePassword: createMockChangePasswordMutation({
				isPending: true,
			}),
		} as unknown as ReturnType<typeof useProfile>)

		render(<SettingsPage />, { wrapper: createWrapper() })

		expect(screen.getByText('Modification...')).toBeInTheDocument()
		expect(screen.getByRole('button', { name: /Modification.../ })).toBeDisabled()
	})

	it('should display password strength indicators', () => {
		vi.mocked(useProfile).mockReturnValue({
			user: mockProfileUser,
			isLoading: false,
			error: null,
			refetch: vi.fn(),
			updateProfile: createMockUpdateProfileMutation(),
			changePassword: createMockChangePasswordMutation(),
		} as unknown as ReturnType<typeof useProfile>)

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
			isLoading: false,
			error: null,
			refetch: vi.fn(),
			updateProfile: createMockUpdateProfileMutation(),
			changePassword: createMockChangePasswordMutation(),
		} as unknown as ReturnType<typeof useProfile>)

		render(<SettingsPage />, { wrapper: createWrapper() })

		expect(screen.getByText('JD')).toBeInTheDocument()
	})

	it('should show profile photo section as disabled', () => {
		vi.mocked(useProfile).mockReturnValue({
			user: mockProfileUser,
			isLoading: false,
			error: null,
			refetch: vi.fn(),
			updateProfile: createMockUpdateProfileMutation(),
			changePassword: createMockChangePasswordMutation(),
		} as unknown as ReturnType<typeof useProfile>)

		render(<SettingsPage />, { wrapper: createWrapper() })

		expect(screen.getByText('Bientôt disponible')).toBeInTheDocument()
		expect(screen.getByText('Bientôt disponible')).toBeDisabled()
	})

	it('should handle profile update error', async () => {
		const mockUpdateProfile = vi.fn().mockRejectedValue(new Error('Update failed'))
		vi.mocked(useProfile).mockReturnValue({
			user: mockProfileUser,
			isLoading: false,
			error: null,
			refetch: vi.fn(),
			updateProfile: createMockUpdateProfileMutation({
				mutateAsync: mockUpdateProfile,
			}),
			changePassword: createMockChangePasswordMutation(),
		} as unknown as ReturnType<typeof useProfile>)

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
			isLoading: false,
			error: null,
			refetch: vi.fn(),
			updateProfile: createMockUpdateProfileMutation(),
			changePassword: createMockChangePasswordMutation({
				mutateAsync: mockChangePassword,
			}),
		} as unknown as ReturnType<typeof useProfile>)

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
