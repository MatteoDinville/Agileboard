import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios, { type AxiosInstance, type AxiosError } from 'axios'

const createMockAxiosError = (status: number, config?: Record<string, unknown>): AxiosError => ({
	isAxiosError: true,
	toJSON: () => ({}),
	name: 'AxiosError',
	message: 'Request failed',
	response: { status } as AxiosError['response'],
	config: config as AxiosError['config'],
	code: undefined,
	request: undefined,
	stack: undefined,
})

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

		let capturedOnRejected: (err: AxiosError) => Promise<never>
		const mockInterceptors = {
			response: {
				use: vi.fn((_onFulfilled, onRejected) => {
					capturedOnRejected = onRejected as (err: AxiosError) => Promise<never>
					return 1
				}),
			},
		}
		const instanceFn = Object.assign(vi.fn(), { interceptors: mockInterceptors }) as unknown as AxiosInstance

		vi.mocked(axios.create).mockReturnValue(instanceFn)
		await import('../../services/api')

		const error = createMockAxiosError(500, {})
		await expect(capturedOnRejected!(error)).rejects.toBe(error)
		expect(axios.post).not.toHaveBeenCalled()
	})

	it('should not retry if _retry already set', async () => {
		vi.resetModules()

		let capturedOnRejected: (err: unknown) => unknown
		const mockInterceptors = {
			response: {
				use: vi.fn((_onFulfilled, onRejected) => {
					capturedOnRejected = onRejected
					return 1
				}),
			},
		}
		const instanceFn = Object.assign(vi.fn(), { interceptors: mockInterceptors }) as unknown as AxiosInstance

		vi.mocked(axios.create).mockReturnValue(instanceFn)
		await import('../../services/api')

		const error = createMockAxiosError(401, { _retry: true })
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

		vi.mocked(axios.create).mockReturnValue(mockAxiosInstance as unknown as AxiosInstance)

		await import('../../services/api')

		expect(axios.create).toHaveBeenCalledWith({
			baseURL: 'http://localhost:4000/api',
			withCredentials: true,
		})
	})

	it('should retry request on 401 by refreshing token', async () => {
		vi.resetModules()

		let capturedOnRejected: (err: unknown) => unknown

		const mockInterceptors = {
			response: {
				use: vi.fn((_onFulfilled, onRejected) => {
					capturedOnRejected = onRejected
					return 1
				}),
			},
		}
		const instanceFn = Object.assign(vi.fn().mockResolvedValue('retried'), { interceptors: mockInterceptors }) as unknown as AxiosInstance

		vi.mocked(axios.create).mockReturnValue(instanceFn)
		vi.mocked(axios.post).mockResolvedValue({ status: 200 } as unknown)

		await import('../../services/api')

		const error = createMockAxiosError(401, { url: '/x' })

		const result = await capturedOnRejected!(error)

		expect(axios.post).toHaveBeenCalled()
		expect(instanceFn).toHaveBeenCalled()
		expect(result).toBe('retried')
	})

	it('should propagate error when refresh fails', async () => {
		vi.resetModules()

		let capturedOnRejected: (err: unknown) => unknown
		const mockInterceptors = {
			response: {
				use: vi.fn((_onFulfilled, onRejected) => {
					capturedOnRejected = onRejected
					return 1
				}),
			},
		}
		const instanceFn = Object.assign(vi.fn(), { interceptors: mockInterceptors }) as unknown as AxiosInstance

		vi.mocked(axios.create).mockReturnValue(instanceFn)
		vi.mocked(axios.post).mockRejectedValue(new Error('refresh failed'))

		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })
		await import('../../services/api')

		const error = createMockAxiosError(401, { url: '/x' })

		await expect(capturedOnRejected!(error)).rejects.toBe(error)
		expect(consoleSpy).toHaveBeenCalled()
		consoleSpy.mockRestore()
	})
})
