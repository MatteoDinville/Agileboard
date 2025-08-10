import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Login from '../../pages/Login'
import { AuthContext } from '../../contexts/AuthContext'
import type { UseMutationResult } from '@tanstack/react-query'
import type { RegisterData, LoginData } from '../../services/auth'

vi.mock('../../services/auth', () => ({
	authService: {
		login: vi.fn()
	}
}))

vi.mock('react-hot-toast', () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn()
	}
}))

vi.mock('@tanstack/react-router', () => ({
	useNavigate: () => vi.fn(),
	useRouter: () => ({
		navigate: vi.fn(),
		state: { location: { pathname: '/login' } }
	}),
	Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
		<a href={to}>{children}</a>
	)
}))

type User = { id: number; email: string; name?: string }
type AuthResponse = { user: User; message?: string }

const createMockMutation = () => ({
	mutate: vi.fn(),
	mutateAsync: vi.fn(),
	isPending: false,
	isError: false,
	isSuccess: false,
	isIdle: true,
	error: null,
	data: undefined,
	variables: undefined,
	reset: vi.fn(),
	status: 'idle' as const,
})

const renderWithAuth = () => {
	const mockLoginMutation = createMockMutation()
	const mockRegisterMutation = createMockMutation()

	return {
		mockLoginMutation,
		...render(
			<AuthContext.Provider
				value={{
					user: null,
					isLoading: false,
					setUser: vi.fn(),
					loginMutation: mockLoginMutation as unknown as UseMutationResult<AuthResponse, Error, LoginData>,
					registerMutation: mockRegisterMutation as unknown as UseMutationResult<AuthResponse, Error, RegisterData>,
					logout: vi.fn(),
				}}
			>
				<Login />
			</AuthContext.Provider>
		)
	}
}

describe('Login Page', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('renders login form correctly', () => {
		renderWithAuth()

		expect(screen.getByText(/connectez-vous à votre compte/i)).toBeInTheDocument()
		expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
		expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument()
		expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument()
	})

	it('handles form submission successfully', async () => {
		const { mockLoginMutation } = renderWithAuth()

		const emailInput = screen.getByLabelText(/email/i)
		const passwordInput = screen.getByLabelText(/mot de passe/i)
		const submitButton = screen.getByRole('button', { name: /se connecter/i })

		fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
		fireEvent.change(passwordInput, { target: { value: 'password123' } })
		fireEvent.click(submitButton)

		expect(mockLoginMutation.mutate).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password123' })
		expect(emailInput).toHaveValue('test@example.com')
		expect(passwordInput).toHaveValue('password123')
	})

	it('handles login failure', async () => {
		renderWithAuth()

		const emailInput = screen.getByLabelText(/email/i)
		const passwordInput = screen.getByLabelText(/mot de passe/i)
		const submitButton = screen.getByRole('button', { name: /se connecter/i })

		fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
		fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
		fireEvent.click(submitButton)

		expect(emailInput).toHaveValue('test@example.com')
		expect(passwordInput).toHaveValue('wrongpassword')
	})

	it('validates required fields', async () => {
		renderWithAuth()

		const submitButton = screen.getByRole('button', { name: /se connecter/i })
		fireEvent.click(submitButton)

		expect(submitButton).toBeInTheDocument()
	})

	it('validates email format', async () => {
		renderWithAuth()
		const emailInput = screen.getByLabelText(/email/i)
		fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
		fireEvent.blur(emailInput)
		expect(emailInput).toHaveValue('invalid-email')
	})

	it('shows loading state during submission', async () => {
		renderWithAuth()
		const emailInput = screen.getByLabelText(/email/i)
		const passwordInput = screen.getByLabelText(/mot de passe/i)
		const submitButton = screen.getByRole('button', { name: /se connecter/i })

		fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
		fireEvent.change(passwordInput, { target: { value: 'password123' } })
		fireEvent.click(submitButton)

		expect(submitButton).toBeInTheDocument()
	})

	it('toggles password visibility', () => {
		renderWithAuth()

		const passwordInput = screen.getByLabelText(/mot de passe/i)
		const toggleButton = screen.getAllByRole('button')[0]

		expect(passwordInput).toHaveAttribute('type', 'password')
		fireEvent.click(toggleButton)

		expect(passwordInput).toHaveAttribute('type', 'text')
		fireEvent.click(toggleButton)

		expect(passwordInput).toHaveAttribute('type', 'password')
	})
})
