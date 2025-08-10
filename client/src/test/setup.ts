import '@testing-library/jest-dom'
import { vi } from 'vitest'

vi.mock('axios', () => ({
	default: {
		create: vi.fn(() => ({
			get: vi.fn(),
			post: vi.fn(),
			put: vi.fn(),
			delete: vi.fn(),
			interceptors: {
				request: { use: vi.fn() },
				response: { use: vi.fn() }
			}
		}))
	}
}))

vi.mock('react-router-dom', () => ({
	useNavigate: () => vi.fn(),
	useParams: () => ({}),
	useLocation: () => ({ pathname: '/' }),
	Link: ({ children, to }: { children: React.ReactNode; to: string }) =>
		`<a href="${to}">${children}</a>`,
	Outlet: () => null
}))

vi.mock('react-hot-toast', () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
		loading: vi.fn(),
		dismiss: vi.fn()
	}
}))

vi.mock('@tanstack/react-query', () => ({
	useQuery: vi.fn(),
	useMutation: vi.fn(),
	useQueryClient: vi.fn(() => ({
		invalidateQueries: vi.fn(),
		setQueryData: vi.fn(),
		getQueryData: vi.fn()
	}))
}))

Object.defineProperty(window, 'matchMedia', {
	writable: true,
	value: vi.fn().mockImplementation(query => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: vi.fn(),
		removeListener: vi.fn(),
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn(),
	})),
})

const localStorageMock = {
	getItem: vi.fn(),
	setItem: vi.fn(),
	removeItem: vi.fn(),
	clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
	value: localStorageMock
})

const sessionStorageMock = {
	getItem: vi.fn(),
	setItem: vi.fn(),
	removeItem: vi.fn(),
	clear: vi.fn(),
}
Object.defineProperty(window, 'sessionStorage', {
	value: sessionStorageMock
})
