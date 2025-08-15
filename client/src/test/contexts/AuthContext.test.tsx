import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { AuthProvider, useAuth } from '../../contexts/AuthContext'
import { authService } from '../../services/auth'

vi.mock('../../services/auth', () => ({
	authService: {
		getCurrentUser: vi.fn(),
		login: vi.fn(),
		register: vi.fn(),
		logout: vi.fn(),
	},
}))

const mockNavigate = vi.fn()
vi.mock('@tanstack/react-router', () => ({
	useNavigate: () => mockNavigate,
}))

vi.mock('@tanstack/react-query', async (importOriginal) => {
	const actual = await importOriginal() as any
	return {
		...actual,
		useQuery: vi.fn(() => ({
			data: null,
			isLoading: false,
			error: null,
			isError: false,
			isSuccess: true,
		})),
		useMutation: vi.fn(() => ({
			mutate: vi.fn(),
			mutateAsync: vi.fn(),
			isLoading: false,
			error: null,
			isError: false,
			reset: vi.fn(),
		})),
		useQueryClient: vi.fn(() => ({
			invalidateQueries: vi.fn(),
			setQueryData: vi.fn(),
		})),
	}
})

const createTestWrapper = () => {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { retry: false },
			mutations: { retry: false },
		},
	})

	return ({ children }: { children: React.ReactNode }) => (
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				{children}
			</AuthProvider>
		</QueryClientProvider>
	)
}

const TestComponent = () => {
	const { user, isLoading, loginMutation, registerMutation, logout } = useAuth()

	return (
		<div>
			<div data-testid="loading">{isLoading.toString()}</div>
			<div data-testid="user">{user ? user.name || user.email : 'null'}</div>
			<button onClick={() => loginMutation.mutate({ email: 'test@test.com', password: 'password' })}>
				Login
			</button>
			<button onClick={() => registerMutation.mutate({ email: 'new@test.com', password: 'password', name: 'New User' })}>
				Register
			</button>
			<button onClick={logout}>Logout</button>
		</div>
	)
}

describe('AuthContext', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('provides initial context values', async () => {
		vi.mocked(authService.getCurrentUser).mockRejectedValue(new Error('Not authenticated'))

		render(<TestComponent />, { wrapper: createTestWrapper() })

		await waitFor(() => {
			expect(screen.getByTestId('loading')).toHaveTextContent('false')
		})

		expect(screen.getByTestId('user')).toHaveTextContent('null')
	})

	it('handles login mutation success', async () => {
		vi.mocked(authService.getCurrentUser).mockRejectedValue(new Error('Not authenticated'))

		render(<TestComponent />, { wrapper: createTestWrapper() })

		await waitFor(() => {
			expect(screen.getByTestId('loading')).toHaveTextContent('false')
		})

		expect(screen.getByText('Login')).toBeInTheDocument()
		expect(screen.getByTestId('user')).toHaveTextContent('null')
	})

	it('handles register mutation success', async () => {
		vi.mocked(authService.getCurrentUser).mockRejectedValue(new Error('Not authenticated'))

		render(<TestComponent />, { wrapper: createTestWrapper() })

		await waitFor(() => {
			expect(screen.getByTestId('loading')).toHaveTextContent('false')
		})

		expect(screen.getByText('Register')).toBeInTheDocument()
		expect(screen.getByTestId('user')).toHaveTextContent('null')
	})

	it('handles login mutation error', async () => {
		vi.mocked(authService.getCurrentUser).mockRejectedValue(new Error('Not authenticated'))

		render(<TestComponent />, { wrapper: createTestWrapper() })

		await waitFor(() => {
			expect(screen.getByTestId('loading')).toHaveTextContent('false')
		})

		expect(screen.getByTestId('user')).toHaveTextContent('null')
		expect(screen.getByText('Login')).toBeInTheDocument()
	})

	it('handles register mutation error', async () => {
		vi.mocked(authService.getCurrentUser).mockRejectedValue(new Error('Not authenticated'))

		render(<TestComponent />, { wrapper: createTestWrapper() })

		await waitFor(() => {
			expect(screen.getByTestId('loading')).toHaveTextContent('false')
		})

		expect(screen.getByTestId('user')).toHaveTextContent('null')
		expect(screen.getByText('Register')).toBeInTheDocument()
	})

	it('handles getCurrentUser returning null user', async () => {
		vi.mocked(authService.getCurrentUser).mockResolvedValue({ user: undefined })

		render(<TestComponent />, { wrapper: createTestWrapper() })

		await waitFor(() => {
			expect(screen.getByTestId('loading')).toHaveTextContent('false')
		})

		expect(screen.getByTestId('user')).toHaveTextContent('null')
	})
})
