import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'

vi.mock('@tanstack/react-query', async (importOriginal) => {
	const actual = await importOriginal()
	return {
		...actual,
	}
})
import { useProfile, useAllUsers } from '../../../utils/hooks/user'
import { userService } from '../../../services/user'
import { AuthContext } from '../../../contexts/AuthContext'
import type { IUser, UpdateProfileData, ChangePasswordData } from '../../../services/user'

vi.mock('../../../services/user', () => ({
	userService: {
		getProfile: vi.fn(),
		updateProfile: vi.fn(),
		changePassword: vi.fn(),
		getAllUsers: vi.fn(),
	}
}))

const localStorageMock = {
	getItem: vi.fn(),
	setItem: vi.fn(),
	removeItem: vi.fn(),
	clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
	value: localStorageMock
})

const createWrapper = (authContextValue: any) => {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
			},
			mutations: {
				retry: false,
			},
		},
	})

	return ({ children }: { children: React.ReactNode }) => (
		<AuthContext.Provider value={authContextValue} >
			<QueryClientProvider client={queryClient}>
				{children}
			</QueryClientProvider>
		</AuthContext.Provider>
	)
}

describe('User Hooks', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('useProfile', () => {
		it('should fetch profile successfully', async () => {
			const mockUser: IUser = {
				id: 1,
				email: 'john@example.com',
				name: 'John Doe',
				createdAt: '2024-01-01T00:00:00Z',
				updatedAt: '2024-01-01T00:00:00Z'
			}

			const mockSetUser = vi.fn()

			vi.mocked(userService.getProfile).mockResolvedValue(mockUser)

			const { result } = renderHook(() => useProfile(), {
				wrapper: createWrapper({ setUser: mockSetUser })
			})

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false)
			})

			expect(result.current.user).toEqual(mockUser)
			expect(userService.getProfile).toHaveBeenCalled()
		})

		it('should not fetch when setUser is not available', () => {
			const { result } = renderHook(() => useProfile(), {
				wrapper: createWrapper({ setUser: null })
			})

			expect(result.current.isLoading).toBe(false)
			expect(userService.getProfile).not.toHaveBeenCalled()
		})

		it('should handle error when fetching profile fails', async () => {
			const error = new Error('Failed to fetch profile')
			const mockSetUser = vi.fn()

			vi.mocked(userService.getProfile).mockRejectedValue(error)

			const { result } = renderHook(() => useProfile(), {
				wrapper: createWrapper({ setUser: mockSetUser })
			})

			await waitFor(() => {
				expect(result.current.error).toBeTruthy()
			})
		})

		it('should update profile successfully', async () => {
			const mockUser: IUser = {
				id: 1,
				email: 'john.updated@example.com',
				name: 'John Updated',
				createdAt: '2024-01-01T00:00:00Z',
				updatedAt: '2024-01-01T00:00:00Z'
			}

			const updateData: UpdateProfileData = {
				name: 'John Updated',
				email: 'john.updated@example.com'
			}

			const mockSetUser = vi.fn()

			vi.mocked(userService.updateProfile).mockResolvedValue({ user: mockUser })

			const { result } = renderHook(() => useProfile(), {
				wrapper: createWrapper({ setUser: mockSetUser })
			})

			result.current.updateProfile.mutate(updateData)

			await waitFor(() => {
				expect(result.current.updateProfile.isSuccess).toBe(true)
			})

			expect(userService.updateProfile).toHaveBeenCalledWith(updateData)
			expect(mockSetUser).toHaveBeenCalledWith(mockUser)
			expect(localStorageMock.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser))
		})

		it('should update profile when setUser is not available', async () => {
			const mockUser: IUser = {
				id: 1,
				email: 'john.updated@example.com',
				name: 'John Updated',
				createdAt: '2024-01-01T00:00:00Z',
				updatedAt: '2024-01-01T00:00:00Z'
			}

			const updateData: UpdateProfileData = {
				name: 'John Updated'
			}

			vi.mocked(userService.updateProfile).mockResolvedValue({ user: mockUser })

			const { result } = renderHook(() => useProfile(), {
				wrapper: createWrapper({ setUser: null })
			})

			result.current.updateProfile.mutate(updateData)

			await waitFor(() => {
				expect(result.current.updateProfile.isSuccess).toBe(true)
			})

			expect(userService.updateProfile).toHaveBeenCalledWith(updateData)
			expect(localStorageMock.setItem).not.toHaveBeenCalled()
		})

		it('should change password successfully', async () => {
			const passwordData: ChangePasswordData = {
				currentPassword: 'oldPassword123',
				newPassword: 'newPassword123'
			}

			const mockResponse = { message: 'Password changed successfully' }
			const mockSetUser = vi.fn()

			vi.mocked(userService.changePassword).mockResolvedValue(mockResponse)

			const { result } = renderHook(() => useProfile(), {
				wrapper: createWrapper({ setUser: mockSetUser })
			})

			result.current.changePassword.mutate(passwordData)

			await waitFor(() => {
				expect(result.current.changePassword.isSuccess).toBe(true)
			})

			expect(userService.changePassword).toHaveBeenCalledWith(passwordData)
		})

		it('should handle error when changing password fails', async () => {
			const passwordData: ChangePasswordData = {
				currentPassword: 'oldPassword123',
				newPassword: 'newPassword123'
			}

			const error = new Error('Failed to change password')
			const mockSetUser = vi.fn()

			vi.mocked(userService.changePassword).mockRejectedValue(error)

			const { result } = renderHook(() => useProfile(), {
				wrapper: createWrapper({ setUser: mockSetUser })
			})

			result.current.changePassword.mutate(passwordData)

			await waitFor(() => {
				expect(result.current.changePassword.isError).toBe(true)
			})

			expect(result.current.changePassword.error).toEqual(error)
		})

		it('should provide refetch function', () => {
			const mockSetUser = vi.fn()

			const { result } = renderHook(() => useProfile(), {
				wrapper: createWrapper({ setUser: mockSetUser })
			})

			expect(typeof result.current.refetch).toBe('function')
		})
	})

	describe('useAllUsers', () => {
		it('should fetch all users successfully', async () => {
			const mockUsers: IUser[] = [
				{
					id: 1,
					email: 'john@example.com',
					name: 'John Doe',
					createdAt: '2024-01-01T00:00:00Z',
					updatedAt: '2024-01-01T00:00:00Z'
				},
				{
					id: 2,
					email: 'jane@example.com',
					name: 'Jane Smith',
					createdAt: '2024-01-01T00:00:00Z',
					updatedAt: '2024-01-01T00:00:00Z'
				}
			]

			vi.mocked(userService.getAllUsers).mockResolvedValue(mockUsers)

			const { result } = renderHook(() => useAllUsers(), {
				wrapper: createWrapper({ user: { id: 1 } })
			})

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true)
			})

			expect(result.current.data).toEqual(mockUsers)
			expect(userService.getAllUsers).toHaveBeenCalled()
		})

		it('should not fetch when user is not available', () => {
			const { result } = renderHook(() => useAllUsers(), {
				wrapper: createWrapper({ user: null })
			})

			expect(result.current.isFetching).toBe(false)
			expect(userService.getAllUsers).not.toHaveBeenCalled()
		})

		it('should handle error when fetching all users fails', async () => {
			const error = new Error('Failed to fetch users')

			vi.mocked(userService.getAllUsers).mockRejectedValue(error)

			const { result } = renderHook(() => useAllUsers(), {
				wrapper: createWrapper({ user: { id: 1 } })
			})

			await waitFor(() => {
				expect(result.current.isError).toBe(true)
			})

			expect(result.current.error).toEqual(error)
		})
	})
})
