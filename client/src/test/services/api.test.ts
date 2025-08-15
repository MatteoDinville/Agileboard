import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'

vi.mock('axios', () => {
	const create = vi.fn()
	const post = vi.fn()
	return {
		default: Object.assign({ create, post }, { create, post }),
	}
})

describe('API Service', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('should pass through non-401 errors without retry', async () => {
		vi.resetModules()

		let capturedOnRejected: (err: any) => any
		const instanceFn = vi.fn()
			; (instanceFn as any).interceptors = {
				response: {
					use: vi.fn((onFulfilled, onRejected) => {
						capturedOnRejected = onRejected
					}),
				},
			}

		vi.mocked(axios.create).mockReturnValue(instanceFn as any)
		await import('../../services/api')

		const error = { response: { status: 500 }, config: {} }
		await expect(capturedOnRejected!(error)).rejects.toBe(error)
		expect(axios.post).not.toHaveBeenCalled()
	})

	it('should not retry if _retry already set', async () => {
		vi.resetModules()

		let capturedOnRejected: (err: any) => any
		const instanceFn = vi.fn()
			; (instanceFn as any).interceptors = {
				response: {
					use: vi.fn((onFulfilled, onRejected) => {
						capturedOnRejected = onRejected
					}),
				},
			}

		vi.mocked(axios.create).mockReturnValue(instanceFn as any)
		await import('../../services/api')

		const error = { response: { status: 401 }, config: { _retry: true } }
		await expect(capturedOnRejected!(error)).rejects.toBe(error)
		expect(axios.post).not.toHaveBeenCalled()
	})

	it('should create axios instance with correct config', async () => {
		vi.resetModules()
		vi.clearAllMocks()
		const mockAxiosInstance = {
			interceptors: {
				response: {
					use: vi.fn(),
				},
			},
		}

		vi.mocked((axios as any).create).mockReturnValue(mockAxiosInstance as any)

		await import('../../services/api')

		expect(axios.create).toHaveBeenCalledWith({
			baseURL: 'http://localhost:4000/api',
			withCredentials: true,
		})
	})

	it('should retry request on 401 by refreshing token', async () => {
		vi.resetModules()

		let capturedOnRejected: (err: any) => any

		const instanceFn = vi.fn().mockResolvedValue('retried')
			; (instanceFn as any).interceptors = {
				response: {
					use: vi.fn((onFulfilled, onRejected) => {
						capturedOnRejected = onRejected
					}),
				},
			}

		vi.mocked(axios.create).mockReturnValue(instanceFn as any)
		vi.mocked(axios.post).mockResolvedValue({ status: 200 } as any)

		await import('../../services/api')

		const error = {
			response: { status: 401 },
			config: { url: '/x' },
		}

		const result = await capturedOnRejected!(error)

		expect(axios.post).toHaveBeenCalled()
		expect(instanceFn).toHaveBeenCalled()
		expect(result).toBe('retried')
	})

	it('should propagate error when refresh fails', async () => {
		vi.resetModules()

		let capturedOnRejected: (err: any) => any
		const instanceFn = vi.fn()
			; (instanceFn as any).interceptors = {
				response: {
					use: vi.fn((onFulfilled, onRejected) => {
						capturedOnRejected = onRejected
					}),
				},
			}

		vi.mocked(axios.create).mockReturnValue(instanceFn as any)
		vi.mocked(axios.post).mockRejectedValue(new Error('refresh failed'))

		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })
		await import('../../services/api')

		const error = {
			response: { status: 401 },
			config: { url: '/x' },
		}

		await expect(capturedOnRejected!(error)).rejects.toBe(error)
		expect(consoleSpy).toHaveBeenCalled()
		consoleSpy.mockRestore()
	})
})
