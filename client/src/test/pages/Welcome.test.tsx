import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Welcome from '../../pages/Welcome'

vi.mock('@tanstack/react-router', () => ({
	Link: ({ children, to, ...props }: any) => (
		<a href={to} {...props}>{children}</a>
	),
}))

vi.mock('../../assets/logo_icon_blue.png', () => ({
	default: 'mocked-logo-path',
}))


vi.mock('lucide-react', () => ({
	ArrowRight: () => <div data-testid="arrow-right">ArrowRight</div>,
	CheckCircle: () => <div data-testid="check-circle">CheckCircle</div>,
	Users: () => <div data-testid="users">Users</div>,
	Zap: () => <div data-testid="zap">Zap</div>,
	Shield: () => <div data-testid="shield">Shield</div>,
	Star: () => <div data-testid="star">Star</div>,
	PlayCircle: () => <div data-testid="play-circle">PlayCircle</div>,
}))

describe('Welcome', () => {
	it('should render welcome page with header', () => {
		render(<Welcome />)

		expect(screen.getAllByText('Agileboard')).toHaveLength(2)
		expect(screen.getByText('Connexion')).toBeInTheDocument()
		expect(screen.getByText('S\'inscrire')).toBeInTheDocument()
		expect(screen.getAllByAltText('Agileboard Logo')).toHaveLength(2)
	})

	it('should render hero section with main heading', () => {
		render(<Welcome />)

		expect(screen.getByText('Gérez vos projets')).toBeInTheDocument()
		expect(screen.getByText('avec simplicité')).toBeInTheDocument()
		expect(screen.getByText(/Une plateforme moderne et intuitive/)).toBeInTheDocument()
	})

	it('should render call-to-action buttons in hero section', () => {
		render(<Welcome />)

		expect(screen.getByText('Commencer gratuitement')).toBeInTheDocument()
		expect(screen.getByText('Voir la démo')).toBeInTheDocument()
	})

	it('should render statistics section', () => {
		render(<Welcome />)

		expect(screen.getByText('500+')).toBeInTheDocument()
		expect(screen.getByText('Projets créés')).toBeInTheDocument()
		expect(screen.getByText('150+')).toBeInTheDocument()
		expect(screen.getByText('Utilisateurs actifs')).toBeInTheDocument()
		expect(screen.getByText('99%')).toBeInTheDocument()
		expect(screen.getByText('Satisfaction client')).toBeInTheDocument()
	})

	it('should render features section with heading', () => {
		render(<Welcome />)

		expect(screen.getByText('Tout ce dont vous avez besoin')).toBeInTheDocument()
		expect(screen.getByText(/Des fonctionnalités puissantes conçues/)).toBeInTheDocument()
	})

	it('should render all feature cards', () => {
		render(<Welcome />)

		expect(screen.getByText('Suivi de statut')).toBeInTheDocument()
		expect(screen.getByText(/Suivez l'avancement de vos projets/)).toBeInTheDocument()

		expect(screen.getByText('Gestion des priorités')).toBeInTheDocument()
		expect(screen.getByText(/Organisez vos tâches par priorité/)).toBeInTheDocument()

		expect(screen.getByText('Collaboration')).toBeInTheDocument()
		expect(screen.getByText(/Travaillez en équipe sur vos projets/)).toBeInTheDocument()

		expect(screen.getByText('Interface moderne')).toBeInTheDocument()
		expect(screen.getByText(/Une interface utilisateur moderne/)).toBeInTheDocument()

		expect(screen.getByText('Sécurisé')).toBeInTheDocument()
		expect(screen.getByText(/Vos données sont protégées/)).toBeInTheDocument()

		expect(screen.getByText('Démarrage rapide')).toBeInTheDocument()
		expect(screen.getByText(/Créez votre premier projet/)).toBeInTheDocument()
	})

	it('should render CTA section', () => {
		render(<Welcome />)

		expect(screen.getByText('Prêt à transformer votre gestion de projets ?')).toBeInTheDocument()
		expect(screen.getByText(/Rejoignez des centaines d'utilisateurs/)).toBeInTheDocument()
		expect(screen.getByText('Commencer maintenant')).toBeInTheDocument()
	})

	it('should render footer', () => {
		render(<Welcome />)

		expect(screen.getByText('© 2025 Agileboard. Tous droits réservés.')).toBeInTheDocument()
	})

	it('should have navigation links to login and register', () => {
		render(<Welcome />)

		const loginLink = screen.getByText('Connexion').closest('a')
		const registerLink = screen.getByText('S\'inscrire').closest('a')

		expect(loginLink).toHaveAttribute('href', '/login')
		expect(registerLink).toHaveAttribute('href', '/register')
	})

	it('should have CTA links to register', () => {
		render(<Welcome />)

		const ctaLinks = screen.getAllByText(/Commencer/)
		expect(ctaLinks).toHaveLength(2)

		ctaLinks.forEach(link => {
			const linkElement = link.closest('a')
			expect(linkElement).toHaveAttribute('href', '/register')
		})
	})

	it('should display all feature icons', () => {
		render(<Welcome />)

		expect(screen.getAllByTestId('check-circle')).toHaveLength(1)
		expect(screen.getAllByTestId('star')).toHaveLength(1)
		expect(screen.getAllByTestId('users')).toHaveLength(1)
		expect(screen.getAllByTestId('zap')).toHaveLength(1)
		expect(screen.getAllByTestId('shield')).toHaveLength(1)
		expect(screen.getAllByTestId('play-circle')).toHaveLength(2)
		expect(screen.getAllByTestId('arrow-right')).toHaveLength(2)
	})

	it('should have proper logo display in header and footer', () => {
		render(<Welcome />)

		const logos = screen.getAllByAltText('Agileboard Logo')
		expect(logos).toHaveLength(2)

		logos.forEach(logo => {
			expect(logo).toHaveAttribute('src', 'mocked-logo-path')
		})
	})

	it('should have demo button that is not a link', () => {
		render(<Welcome />)

		const demoButton = screen.getByText('Voir la démo').closest('button')
		expect(demoButton).toBeInTheDocument()
		expect(demoButton).not.toHaveAttribute('href')
	})
})
