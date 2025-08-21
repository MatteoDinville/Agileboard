import { describe, it, expect, vi, beforeEach } from 'vitest'
import { userService, type IUser, type UpdateProfileData, type ChangePasswordData } from '../../services/user'

global.fetch = vi.fn()

describe('User Service', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('getProfile', () => {
		it('should fetch user profile successfully', async () => {
			const mockUser: IUser = {
				id: 1,
				email: 'john@example.com',
				name: 'John Doe',
				createdAt: '2024-01-01T00:00:00Z',
				updatedAt: '2024-01-01T00:00:00Z'
			}

			vi.mocked(fetch).mockResolvedValue({
				ok: true,
				json: vi.fn().mockResolvedValue(mockUser)
			} as unknown as Response)

			const result = await userService.getProfile()

			expect(fetch).toHaveBeenCalledWith('http://localhost:4000/api/user/profile',
				{
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
					},
					credentials: 'include'
				})
			expect(result).toEqual(mockUser)
		})

		it('should handle error when fetching profile fails', async () => {
			vi.mocked(fetch).mockResolvedValue({
				ok: false,
				json: vi.fn().mockResolvedValue({ error: 'Failed to fetch profile' })
			} as unknown as Response)

			await expect(userService.getProfile()).rejects.toThrow('Failed to fetch profile')
		})

		it('should handle error without error message', async () => {
			vi.mocked(fetch).mockResolvedValue({
				ok: false,
				json: vi.fn().mockResolvedValue({})
			} as unknown as Response)

			await expect(userService.getProfile()).rejects.toThrow('Erreur lors de la récupération du profil')
		})
	})

	describe('updateProfile', () => {
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

			vi.mocked(fetch).mockResolvedValue({
				ok: true,
				json: vi.fn().mockResolvedValue(mockUser)
			} as unknown as Response)

			const result = await userService.updateProfile(updateData)

			expect(fetch).toHaveBeenCalledWith('http://localhost:4000/api/user/profile',
				{
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
					},
					credentials: 'include',
					body: JSON.stringify(updateData),
				})
			expect(result).toEqual(mockUser)
		})

		it('should update profile with partial data', async () => {
			const mockUser: IUser = {
				id: 1,
				email: 'john@example.com',
				name: 'John Updated',
				createdAt: '2024-01-01T00:00:00Z',
				updatedAt: '2024-01-01T00:00:00Z'
			}

			const updateData: UpdateProfileData = {
				name: 'John Updated'
			}

			vi.mocked(fetch).mockResolvedValue({
				ok: true,
				json: vi.fn().mockResolvedValue(mockUser)
			} as unknown as Response)

			const result = await userService.updateProfile(updateData)

			expect(fetch).toHaveBeenCalledWith('http://localhost:4000/api/user/profile',
				{
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
					},
					credentials: 'include',
					body: JSON.stringify(updateData),
				})
			expect(result).toEqual(mockUser)
		})

		it('should handle error when updating profile fails', async () => {
			const updateData: UpdateProfileData = {
				name: 'John Updated'
			}

			vi.mocked(fetch).mockResolvedValue({
				ok: false,
				json: vi.fn().mockResolvedValue({ error: 'Failed to update profile' })
			} as unknown as Response)

			await expect(userService.updateProfile(updateData)).rejects.toThrow('Failed to update profile')
		})
	})

	describe('changePassword', () => {
		it('should change password successfully', async () => {
			const mockResponse = { message: 'Password changed successfully' }

			const passwordData: ChangePasswordData = {
				currentPassword: 'oldPassword123',
				newPassword: 'newPassword123'
			}

			vi.mocked(fetch).mockResolvedValue({
				ok: true,
				json: vi.fn().mockResolvedValue(mockResponse)
			} as unknown as Response)

			const result = await userService.changePassword(passwordData)

			expect(fetch).toHaveBeenCalledWith('http://localhost:4000/api/user/password',
				{
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
					},
					credentials: 'include',
					body: JSON.stringify(passwordData),
				})
			expect(result).toEqual(mockResponse)
		})

		it('should handle error when changing password fails', async () => {
			const passwordData: ChangePasswordData = {
				currentPassword: 'oldPassword123',
				newPassword: 'newPassword123'
			}

			vi.mocked(fetch).mockResolvedValue({
				ok: false,
				json: vi.fn().mockResolvedValue({ error: 'Failed to change password' })
			} as unknown as Response)

			await expect(userService.changePassword(passwordData)).rejects.toThrow('Failed to change password')
		})
	})

	describe('getAllUsers', () => {
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

			vi.mocked(fetch).mockResolvedValue({
				ok: true,
				json: vi.fn().mockResolvedValue(mockUsers)
			} as unknown as Response)

			const result = await userService.getAllUsers()

			expect(fetch).toHaveBeenCalledWith('http://localhost:4000/api/user/all',
				{
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
					},
					credentials: 'include',
				})
			expect(result).toEqual(mockUsers)
		})

		it('should handle error when fetching all users fails', async () => {
			vi.mocked(fetch).mockResolvedValue({
				ok: false,
				json: vi.fn().mockResolvedValue({ error: 'Failed to fetch users' })
			} as unknown as Response)

			await expect(userService.getAllUsers()).rejects.toThrow('Failed to fetch users')
		})

		it('should handle error without error message for getAllUsers', async () => {
			vi.mocked(fetch).mockResolvedValue({
				ok: false,
				json: vi.fn().mockResolvedValue({})
			} as unknown as Response)

			await expect(userService.getAllUsers()).rejects.toThrow('Erreur lors de la récupération des utilisateurs')
		})
	})
})
