import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Dashboard from '../../pages/Dashboard'
import { AuthContext } from '../../contexts/AuthContext'

const mockNavigate = vi.fn()
vi.mock('@tanstack/react-router', () => ({
	useNavigate: () => mockNavigate,
	Link: ({ children, to }: { children: React.ReactNode; to: string }) =>
		`<a href="${to}">${children}</a>`,
}))

vi.mock('../../utils/hooks/project', () => ({
	useProjects: vi.fn(() => ({
		data: [
			{ id: 1, title: 'Project 1', description: 'Description 1' },
			{ id: 2, title: 'Project 2', description: 'Description 2' }
		],
		isLoading: false,
		error: null
	}))
}))

const mockUser = {
	id: 1,
	email: 'test@example.com',
	name: 'Test User'
}

const mockAuthContext = {
	user: mockUser,
	isLoading: false,
	setUser: vi.fn(),
	loginMutation: {} as any,
	registerMutation: {} as any,
	logout: vi.fn(),
}

describe('Dashboard', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('renders welcome message with user name', () => {
		render(
			<AuthContext.Provider value={mockAuthContext}>
				<Dashboard />
			</AuthContext.Provider>
		)

		expect(screen.getByText('Bienvenue, Test User !')).toBeInTheDocument()
	})

	it('renders welcome message with "utilisateur" when no name', () => {
		const contextWithoutName = {
			...mockAuthContext,
			user: { ...mockUser, name: null }
		}

		render(
			<AuthContext.Provider value={contextWithoutName}>
				<Dashboard />
			</AuthContext.Provider>
		)

		expect(screen.getByText('Bienvenue, utilisateur !')).toBeInTheDocument()
	})

	it('displays project count correctly', () => {
		render(
			<AuthContext.Provider value={mockAuthContext}>
				<Dashboard />
			</AuthContext.Provider>
		)

		expect(screen.getByText('2')).toBeInTheDocument() // 2 projects
	})

	it('renders dashboard header with navigation elements', () => {
		render(
			<AuthContext.Provider value={mockAuthContext}>
				<Dashboard />
			</AuthContext.Provider>
		)

		expect(screen.getByText('Dashboard')).toBeInTheDocument()
		expect(screen.getByText('Déconnexion')).toBeInTheDocument()
	})

	it('calls logout when logout button is clicked', () => {
		render(
			<AuthContext.Provider value={mockAuthContext}>
				<Dashboard />
			</AuthContext.Provider>
		)

		const logoutButton = screen.getByText('Déconnexion')
		fireEvent.click(logoutButton)

		expect(mockAuthContext.logout).toHaveBeenCalledTimes(1)
	})

	it('navigates to settings when settings button is clicked', () => {
		render(
			<AuthContext.Provider value={mockAuthContext}>
				<Dashboard />
			</AuthContext.Provider>
		)

		const settingsButton = screen.getByTitle('Paramètres')
		fireEvent.click(settingsButton)

		expect(mockNavigate).toHaveBeenCalledWith({ to: '/settings' })
	})

	it('renders notification badge', () => {
		render(
			<AuthContext.Provider value={mockAuthContext}>
				<Dashboard />
			</AuthContext.Provider>
		)

		expect(screen.getAllByText('3')).toHaveLength(2) // Notification count appears twice
	})

	it('renders stats cards', () => {
		render(
			<AuthContext.Provider value={mockAuthContext}>
				<Dashboard />
			</AuthContext.Provider>
		)

		expect(screen.getByText('Projets actifs')).toBeInTheDocument()
		expect(screen.getByText('Tâches complétées')).toBeInTheDocument()
	})

	it('renders all statistics cards', () => {
		render(
			<AuthContext.Provider value={mockAuthContext}>
				<Dashboard />
			</AuthContext.Provider>
		)

		expect(screen.getByText('Projets en attente')).toBeInTheDocument()
		expect(screen.getByText('Projets en cours')).toBeInTheDocument()
		expect(screen.getByText('Projets terminés')).toBeInTheDocument()
		expect(screen.getByText('48')).toBeInTheDocument() // Completed tasks
		expect(screen.getByText('5')).toBeInTheDocument() // Projects pending
		expect(screen.getByText('7')).toBeInTheDocument() // Projects in progress
		expect(screen.getByText('12')).toBeInTheDocument() // Completed projects
	})

	it('renders navigation cards', () => {
		render(
			<AuthContext.Provider value={mockAuthContext}>
				<Dashboard />
			</AuthContext.Provider>
		)

		expect(screen.getByText('Nouveau projet')).toBeInTheDocument()
		expect(screen.getByText('Mes projets')).toBeInTheDocument()
	})

	it('handles loading state', () => {
		const loadingContext = {
			...mockAuthContext,
			isLoading: true
		}

		render(
			<AuthContext.Provider value={loadingContext}>
				<Dashboard />
			</AuthContext.Provider>
		)

		expect(screen.getByText('Dashboard')).toBeInTheDocument()
	})

	it('handles user not authenticated', () => {
		const unauthenticatedContext = {
			...mockAuthContext,
			user: null
		}

		render(
			<AuthContext.Provider value={unauthenticatedContext}>
				<Dashboard />
			</AuthContext.Provider>
		)

		expect(screen.getByText('Bienvenue, utilisateur !')).toBeInTheDocument()
	})
})
