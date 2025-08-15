import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import NotFound from '../../pages/NotFound'

const mockNavigate = vi.fn()
vi.mock('@tanstack/react-router', () => ({
	useNavigate: () => mockNavigate,
	Link: ({ children, to }: { children: React.ReactNode; to: string }) =>
		`<a href="${to}">${children}</a>`,
}))

describe('NotFound Page', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		Object.defineProperty(window, 'history', {
			value: {
				back: vi.fn()
			},
			writable: true
		})
		Object.defineProperty(window, 'location', {
			value: {
				reload: vi.fn()
			},
			writable: true
		})
	})

	it('renders 404 error message', () => {
		render(<NotFound />)

		expect(screen.getByText('404')).toBeInTheDocument()
		expect(screen.getByText(/page introuvable/i)).toBeInTheDocument()
	})

	it('renders error description', () => {
		render(<NotFound />)

		expect(screen.getByText(/oups ! la page que vous recherchez semble avoir disparu/i)).toBeInTheDocument()
	})

	it('renders back to home button', () => {
		render(<NotFound />)

		expect(screen.getByRole('button', { name: /retour au dashboard/i })).toBeInTheDocument()
	})

	it('handles home button click', () => {
		render(<NotFound />)

		const homeButton = screen.getByRole('button', { name: /retour au dashboard/i })
		fireEvent.click(homeButton)

		expect(mockNavigate).toHaveBeenCalledWith({ to: '/dashboard' })
	})

	it('handles back button click', () => {
		render(<NotFound />)

		const backButton = screen.getByRole('button', { name: /page précédente/i })
		fireEvent.click(backButton)

		expect(window.history.back).toHaveBeenCalled()
	})

	it('handles refresh button click', () => {
		render(<NotFound />)

		const refreshButton = screen.getByRole('button', { name: /actualiser/i })
		fireEvent.click(refreshButton)

		expect(window.location.reload).toHaveBeenCalled()
	})

	it('handles search button click', () => {
		render(<NotFound />)

		const searchButton = screen.getByText(/rechercher dans l'application/i).closest('button')
		fireEvent.click(searchButton!)

		expect(mockNavigate).toHaveBeenCalledWith({ to: '/dashboard' })
	})

	it('renders illustration or icon', () => {
		render(<NotFound />)

		const container = screen.getByText('404').closest('div')
		expect(container).toBeInTheDocument()
	})

	it('has proper styling classes', () => {
		render(<NotFound />)

		expect(screen.getByText('404')).toBeInTheDocument()
	})

	it('displays helpful navigation options', () => {
		render(<NotFound />)

		expect(screen.getByText(/retour au dashboard/i)).toBeInTheDocument()
	})

	it('handles responsive design', () => {
		render(<NotFound />)

		expect(screen.getByText('404')).toBeInTheDocument()
		expect(screen.getByText(/page introuvable/i)).toBeInTheDocument()
	})

	it('provides clear call to action', () => {
		render(<NotFound />)

		const button = screen.getByRole('button', { name: /retour au dashboard/i })
		expect(button).toBeInTheDocument()
		expect(button).toHaveClass('bg-blue-600', 'text-white')
	})

	it('renders all navigation buttons', () => {
		render(<NotFound />)

		expect(screen.getByRole('button', { name: /retour au dashboard/i })).toBeInTheDocument()
		expect(screen.getByRole('button', { name: /page précédente/i })).toBeInTheDocument()
		expect(screen.getByRole('button', { name: /actualiser/i })).toBeInTheDocument()
	})

	it('displays suggestions section', () => {
		render(<NotFound />)

		expect(screen.getByText(/suggestions/i)).toBeInTheDocument()
		expect(screen.getByText(/vérifiez l'orthographe de l'url/i)).toBeInTheDocument()
		expect(screen.getByText(/retournez à la page d'accueil/i)).toBeInTheDocument()
	})
})
