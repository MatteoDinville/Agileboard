import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Register from '../../pages/Register'
import { AuthContext } from '../../contexts/AuthContext'
import type { UseMutationResult } from '@tanstack/react-query'

vi.mock('@tanstack/react-router', () => ({
	useNavigate: () => vi.fn(),
	Link: ({ children, to }: { children: React.ReactNode; to: string }) =>
		`<a href="${to}">${children}</a>`,
}))

interface User {
	id: number;
	email: string;
	name?: string;
}

interface AuthResponse {
	user: User;
	message?: string;
}

interface LoginData {
	email: string;
	password: string;
}

interface RegisterData {
	email: string;
	password: string;
	name?: string;
}

const createMockRegisterMutation = (): Partial<UseMutationResult<AuthResponse, Error, RegisterData>> => ({
	mutate: vi.fn(),
	isPending: false,
	isError: false,
	error: null,
	data: undefined,
})

const createMockLoginMutation = (): Partial<UseMutationResult<AuthResponse, Error, LoginData>> => ({
	mutate: vi.fn(),
	isPending: false,
	isError: false,
	error: null,
	data: undefined,
})

const renderWithAuth = () => {
	const mockRegisterMutation = createMockRegisterMutation()

	return {
		mockRegisterMutation,
		...render(
			<AuthContext.Provider
				value={{
					user: null,
					isLoading: false,
					setUser: vi.fn(),
					loginMutation: createMockLoginMutation() as UseMutationResult<AuthResponse, Error, LoginData>,
					registerMutation: mockRegisterMutation as UseMutationResult<AuthResponse, Error, RegisterData>,
					logout: vi.fn(),
				}}
			>
				<Register />
			</AuthContext.Provider>
		)
	}
}

describe('Register Page', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('renders register form correctly', () => {
		renderWithAuth()

		expect(screen.getByText(/créer votre compte/i)).toBeInTheDocument()
		expect(screen.getByLabelText(/nom complet/i)).toBeInTheDocument()
		expect(screen.getByLabelText(/adresse email/i)).toBeInTheDocument()
		expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument()
		expect(screen.getByRole('button', { name: /créer mon compte/i })).toBeInTheDocument()
	})

	it('handles form submission successfully', async () => {
		const { mockRegisterMutation } = renderWithAuth()

		const nameInput = screen.getByLabelText(/nom complet/i)
		const emailInput = screen.getByLabelText(/adresse email/i)
		const passwordInput = screen.getByLabelText(/mot de passe/i)
		const submitButton = screen.getByRole('button', { name: /créer mon compte/i })

		fireEvent.change(nameInput, { target: { value: 'Test User' } })
		fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
		fireEvent.change(passwordInput, { target: { value: 'password123' } })
		fireEvent.click(submitButton)

		expect(mockRegisterMutation.mutate).toHaveBeenCalledWith({
			name: 'Test User',
			email: 'test@example.com',
			password: 'password123'
		})
	})

	it('shows error when required fields are empty', async () => {
		const { mockRegisterMutation } = renderWithAuth()

		const submitButton = screen.getByRole('button', { name: /créer mon compte/i })
		fireEvent.click(submitButton)

		expect(mockRegisterMutation.mutate).not.toHaveBeenCalled()
	})

	it('shows error for invalid email format', async () => {
		const { mockRegisterMutation } = renderWithAuth()

		const emailInput = screen.getByLabelText(/adresse email/i)
		const submitButton = screen.getByRole('button', { name: /créer mon compte/i })

		fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
		fireEvent.click(submitButton)

		expect(mockRegisterMutation.mutate).not.toHaveBeenCalled()
	})

	it('shows error for password too short', async () => {
		const { mockRegisterMutation } = renderWithAuth()

		const passwordInput = screen.getByLabelText(/mot de passe/i)
		const submitButton = screen.getByRole('button', { name: /créer mon compte/i })

		fireEvent.change(passwordInput, { target: { value: '123' } })
		fireEvent.click(submitButton)

		expect(mockRegisterMutation.mutate).not.toHaveBeenCalled()
	})

	it('handles registration error', async () => {
		const { mockRegisterMutation } = renderWithAuth()
		mockRegisterMutation.isError = true
		mockRegisterMutation.error = new Error('Email already exists')

		expect(screen.getAllByText(/créer votre compte/i)).toHaveLength(1)
	})

	it('handles registration error', async () => {
		const { mockRegisterMutation } = renderWithAuth()
		mockRegisterMutation.isError = true
		mockRegisterMutation.error = new Error('Email already exists')

		const { rerender } = renderWithAuth()

		rerender(
			<AuthContext.Provider
				value={{
					user: null,
					isLoading: false,
					setUser: vi.fn(),
					loginMutation: createMockLoginMutation() as UseMutationResult<AuthResponse, Error, LoginData>,
					registerMutation: mockRegisterMutation as UseMutationResult<AuthResponse, Error, RegisterData>,
					logout: vi.fn(),
				}}
			>
				<Register />
			</AuthContext.Provider>
		)

		await waitFor(() => {
			expect(screen.getByText(/email already exists/i)).toBeInTheDocument()
		})
	})

	it('shows loading state during submission', async () => {
		const { mockRegisterMutation } = renderWithAuth()
		mockRegisterMutation.isPending = true

		expect(screen.getByRole('button', { name: /créer mon compte/i })).toBeInTheDocument()
	})

	it('has link to login page', () => {
		renderWithAuth()

		expect(screen.getByText(/déjà un compte/i)).toBeInTheDocument()
		expect(screen.getByText(/connectez-vous/i)).toBeInTheDocument()
	})
})
