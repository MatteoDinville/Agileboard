import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authService } from '../../services/auth'

vi.mock('../../services/api', () => ({
	api: {
		post: vi.fn(),
		get: vi.fn(),
		delete: vi.fn()
	}
}))

describe('Auth Service', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('register', () => {
		it('should register successfully with valid data', async () => {
			const mockResponse = {
				data: {
					user: { id: 1, email: 'new@example.com', name: 'New User' }
				}
			}

			const { api } = await import('../../services/api')
			vi.mocked(api.post).mockResolvedValue(mockResponse)

			const userData = {
				name: 'New User',
				email: 'new@example.com',
				password: 'password123'
			}

			const result = await authService.register(userData)

			expect(api.post).toHaveBeenCalledWith('/auth/register', userData)
			expect(result).toEqual(mockResponse.data)
		})

		it('should throw error on registration failure', async () => {
			const errorMessage = 'Email already exists'
			const { api } = await import('../../services/api')
			vi.mocked(api.post).mockRejectedValue({
				response: {
					data: { error: errorMessage }
				}
			})

			const userData = {
				name: 'New User',
				email: 'existing@example.com',
				password: 'password123'
			}

			await expect(authService.register(userData)).rejects.toThrow(errorMessage)
		})
	})

	describe('login', () => {
		it('should login successfully with valid credentials', async () => {
			const mockResponse = {
				data: {
					user: { id: 1, email: 'test@example.com', name: 'Test User' }
				}
			}

			const { api } = await import('../../services/api')
			vi.mocked(api.post).mockResolvedValue(mockResponse)

			const credentials = {
				email: 'test@example.com',
				password: 'password123'
			}

			const result = await authService.login(credentials)

			expect(api.post).toHaveBeenCalledWith('/auth/login', credentials)
			expect(result).toEqual(mockResponse.data)
		})

		it('should throw error on login failure', async () => {
			const errorMessage = 'Invalid credentials'
			const { api } = await import('../../services/api')
			vi.mocked(api.post).mockRejectedValue({
				response: {
					data: { error: errorMessage }
				}
			})

			const credentials = {
				email: 'test@example.com',
				password: 'wrongpassword'
			}

			await expect(authService.login(credentials)).rejects.toThrow(errorMessage)
		})
	})

	describe('logout', () => {
		it('should logout successfully', async () => {
			const mockResponse = { data: { message: 'Logged out successfully' } }
			const { api } = await import('../../services/api')
			vi.mocked(api.post).mockResolvedValue(mockResponse)

			const result = await authService.logout()

			expect(api.post).toHaveBeenCalledWith('/auth/logout', {})
			expect(result).toEqual(mockResponse.data)
		})
	})

	describe('getCurrentUser', () => {
		it('should get current user successfully', async () => {
			const mockResponse = {
				data: {
					user: { id: 1, email: 'test@example.com', name: 'Test User' }
				}
			}

			const { api } = await import('../../services/api')
			vi.mocked(api.get).mockResolvedValue(mockResponse)

			const result = await authService.getCurrentUser()

			expect(api.get).toHaveBeenCalledWith('/auth/me')
			expect(result).toEqual(mockResponse.data)
		})
	})
})
