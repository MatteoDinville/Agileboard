import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../../contexts/AuthContext';
import Login from '../../pages/Login';
import { authService } from '../../services/auth';

vi.mock('../../services/auth', () => ({
	authService: {
		login: vi.fn(),
		getCurrentUser: vi.fn(),
		logout: vi.fn(),
		register: vi.fn(),
	},
}));

vi.mock('@tanstack/react-router', async () => {
	const actual = await vi.importActual('@tanstack/react-router');
	return {
		...actual,
		Link: ({ children, to, ...props }: { children: React.ReactNode; to: string;[key: string]: unknown }) => (
			<a href={to} {...props}>{children}</a>
		),
		useNavigate: () => vi.fn(),
	};
});

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
				staleTime: 0,
				gcTime: 0,
			},
			mutations: {
				retry: false,
			},
		},
	});

	return (
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				{children}
			</AuthProvider>
		</QueryClientProvider>
	);
};

describe('Login (success)', () => {
	const mockUser = {
		id: 1,
		email: 'test@exemple.com',
		name: 'John Doe',
	};

	const validCredentials = {
		email: mockUser.email,
		password: 'password123',
	};

	beforeEach(() => {
		vi.mocked(authService.login).mockResolvedValue({
			user: mockUser,
		});

		vi.mocked(authService.getCurrentUser).mockResolvedValue({
			user: undefined,
		});
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it('should allow a user to login with valid credentials', async () => {
		const user = userEvent.setup();

		render(
			<TestWrapper>
				<Login />
			</TestWrapper>
		);

		expect(screen.getByText('Bon retour !')).toBeInTheDocument();
		expect(screen.getByText('Connectez-vous à votre compte')).toBeInTheDocument();

		const emailInput = screen.getByLabelText(/adresse email/i);
		const passwordInput = screen.getByLabelText(/mot de passe/i);

		await user.type(emailInput, validCredentials.email);
		expect(emailInput).toHaveValue(validCredentials.email);

		await user.type(passwordInput, validCredentials.password);
		expect(passwordInput).toHaveValue(validCredentials.password);

		const submitButton = screen.getByRole('button', { name: /se connecter/i });
		expect(submitButton).toBeInTheDocument();
		expect(submitButton).not.toBeDisabled();

		await user.click(submitButton);

		await waitFor(() => {
			expect(authService.login).toHaveBeenCalledWith(validCredentials);
			expect(authService.login).toHaveBeenCalledTimes(1);
		});
	});

	it('should display loading state during login', async () => {
		const user = userEvent.setup();

		vi.mocked(authService.login).mockImplementation(
			() => new Promise(resolve =>
				setTimeout(() => resolve({ user: mockUser }), 100)
			)
		);

		render(
			<TestWrapper>
				<Login />
			</TestWrapper>
		);

		const emailInput = screen.getByLabelText(/adresse email/i);
		const passwordInput = screen.getByLabelText(/mot de passe/i);
		const submitButton = screen.getByRole('button', { name: /se connecter/i });

		await user.type(emailInput, validCredentials.email);
		await user.type(passwordInput, validCredentials.password);
		await user.click(submitButton);

		expect(submitButton).toBeDisabled();

		const loadingSpinner = submitButton.querySelector('.animate-spin');
		expect(loadingSpinner).toBeInTheDocument();
	});

	it('should validate required fields before submission', async () => {
		const user = userEvent.setup();

		render(
			<TestWrapper>
				<Login />
			</TestWrapper>
		);

		const submitButton = screen.getByRole('button', { name: /se connecter/i });

		await user.click(submitButton);

		expect(authService.login).not.toHaveBeenCalled();

		const emailInput = screen.getByLabelText(/adresse email/i);
		const passwordInput = screen.getByLabelText(/mot de passe/i);

		expect(emailInput).toBeRequired();
		expect(passwordInput).toBeRequired();
	});

	it('should allow showing/hiding password', async () => {
		const user = userEvent.setup();

		render(
			<TestWrapper>
				<Login />
			</TestWrapper>
		);

		const passwordInput = screen.getByLabelText(/mot de passe/i);
		const toggleButtons = screen.getAllByRole('button');
		const toggleButton = toggleButtons.find(btn =>
			btn.querySelector('svg') && btn !== screen.getByRole('button', { name: /se connecter/i })
		);

		expect(toggleButton).toBeInTheDocument();

		expect(passwordInput).toHaveAttribute('type', 'password');

		if (toggleButton) {
			await user.click(toggleButton);
			expect(passwordInput).toHaveAttribute('type', 'text');

			await user.click(toggleButton);
			expect(passwordInput).toHaveAttribute('type', 'password');
		}
	});
});

describe('Login (failure)', () => {
	const invalidCredentials = {
		email: 'test@exemple.com',
		password: 'motdepasseincorrect',
	};

	beforeEach(() => {
		vi.mocked(authService.getCurrentUser).mockResolvedValue({
			user: undefined,
		});
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it('devrait afficher un message d\'erreur lors d\'un échec de connexion (mot de passe incorrect)', async () => {
		const user = userEvent.setup();

		const errorMessage = 'Mot de passe incorrect';
		vi.mocked(authService.login).mockRejectedValue(new Error(errorMessage));

		render(
			<TestWrapper>
				<Login />
			</TestWrapper>
		);

		const emailInput = screen.getByLabelText(/adresse email/i);
		const passwordInput = screen.getByLabelText(/mot de passe/i);

		await user.type(emailInput, invalidCredentials.email);
		await user.type(passwordInput, invalidCredentials.password);

		const submitButton = screen.getByRole('button', { name: /se connecter/i });
		await user.click(submitButton);

		await waitFor(() => {
			expect(authService.login).toHaveBeenCalledWith(invalidCredentials);
		});

		await waitFor(() => {
			expect(screen.getByText(errorMessage)).toBeInTheDocument();
		});

		const errorContainer = screen.getByText(errorMessage).closest('div');
		expect(errorContainer).toHaveClass('bg-red-50');
		expect(errorContainer).toHaveClass('border-red-200');

		expect(screen.getByText('Bon retour !')).toBeInTheDocument();
		expect(submitButton).toBeInTheDocument();
		expect(submitButton).not.toBeDisabled();
	});

	it('devrait afficher un message d\'erreur générique si aucun message spécifique n\'est fourni', async () => {
		const user = userEvent.setup();

		vi.mocked(authService.login).mockRejectedValue(new Error());

		render(
			<TestWrapper>
				<Login />
			</TestWrapper>
		);

		const emailInput = screen.getByLabelText(/adresse email/i);
		const passwordInput = screen.getByLabelText(/mot de passe/i);
		const submitButton = screen.getByRole('button', { name: /se connecter/i });

		await user.type(emailInput, invalidCredentials.email);
		await user.type(passwordInput, invalidCredentials.password);
		await user.click(submitButton);

		await waitFor(() => {
			expect(screen.getByText('Erreur de connexion')).toBeInTheDocument();
		});
	});
});
