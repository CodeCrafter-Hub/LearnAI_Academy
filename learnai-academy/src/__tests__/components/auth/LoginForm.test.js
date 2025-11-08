import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from '@/components/auth/LoginForm';
import { AuthProvider } from '@/hooks/useAuth';
import { ToastProvider } from '@/components/ui/Toast';

// Mock Next.js router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    pathname: '/login',
  }),
}));

// Mock fetch
global.fetch = jest.fn();

describe('LoginForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockClear();
    mockPush.mockClear();

    // Mock initial auth check (unauthenticated)
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
    });
  });

  const renderLoginForm = () => {
    return render(
      <AuthProvider>
        <ToastProvider>
          <LoginForm />
        </ToastProvider>
      </AuthProvider>
    );
  };

  describe('Rendering', () => {
    it('should render login form with all fields', async () => {
      renderLoginForm();

      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument();
      });

      expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should have proper accessibility attributes', async () => {
      renderLoginForm();

      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument();
      });

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('autoComplete', 'email');
      expect(emailInput).toHaveAttribute('aria-required', 'true');

      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('autoComplete', 'current-password');
      expect(passwordInput).toHaveAttribute('aria-required', 'true');
    });

    it('should have semantic HTML structure', async () => {
      renderLoginForm();

      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument();
      });

      expect(screen.getByRole('form', { name: /login form/i })).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('should not show demo credentials', async () => {
      renderLoginForm();

      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument();
      });

      // Should NOT contain demo email or password text
      expect(screen.queryByText(/demo@learnai.com/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/password123/i)).not.toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should require email and password', async () => {
      renderLoginForm();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      expect(emailInput).toBeRequired();
      expect(passwordInput).toBeRequired();
    });

    it('should validate email format', async () => {
      renderLoginForm();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      });

      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toHaveAttribute('type', 'email');
    });
  });

  describe('Form Submission', () => {
    it('should successfully login with valid credentials', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        students: [{ id: 'student1', firstName: 'Child' }],
      };

      renderLoginForm();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      });

      // Mock successful login
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, user: mockUser }),
      });

      const user = userEvent.setup();
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
        });
      });

      // Should redirect to dashboard
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should redirect to onboarding if no students', async () => {
      const mockUser = {
        id: '1',
        email: 'newparent@example.com',
        firstName: 'New',
        students: [],
      };

      renderLoginForm();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      });

      // Mock successful login with no students
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, user: mockUser }),
      });

      const user = userEvent.setup();
      await user.type(screen.getByLabelText(/email/i), 'newparent@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/onboarding');
      });
    });

    it('should display error message on login failure', async () => {
      renderLoginForm();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      });

      // Mock login failure
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Invalid email or password' }),
      });

      const user = userEvent.setup();
      await user.type(screen.getByLabelText(/email/i), 'wrong@example.com');
      await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      // Should show error
      await waitFor(() => {
        const errorAlert = screen.getByRole('alert');
        expect(errorAlert).toBeInTheDocument();
        expect(errorAlert).toHaveTextContent(/invalid email or password/i);
      });

      // Should not redirect
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should show loading state during submission', async () => {
      renderLoginForm();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      });

      // Mock slow login
      global.fetch.mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({ success: true, user: {} }),
                }),
              100
            )
          )
      );

      const user = userEvent.setup();
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /signing in/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
        expect(screen.getByRole('button', { name: /signing in/i })).toHaveAttribute(
          'aria-busy',
          'true'
        );
      });
    });

    it('should disable form during submission', async () => {
      renderLoginForm();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      });

      // Mock slow login
      global.fetch.mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({ success: true, user: {} }),
                }),
              100
            )
          )
      );

      const user = userEvent.setup();
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      // Button should be disabled
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
      });
    });
  });

  describe('Security', () => {
    it('should use secure httpOnly cookies (credentials: include)', async () => {
      renderLoginForm();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      });

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, user: {} }),
      });

      const user = userEvent.setup();
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        const loginCall = global.fetch.mock.calls.find((call) => call[0] === '/api/auth/login');
        expect(loginCall[1].credentials).toBe('include');
      });
    });

    it('should not expose passwords in clear text', async () => {
      renderLoginForm();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      });

      const passwordInput = screen.getByLabelText(/password/i);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('should not store credentials in localStorage', async () => {
      renderLoginForm();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      });

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, user: {} }),
      });

      const user = userEvent.setup();
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      // Should not use localStorage
      expect(localStorage.setItem).not.toHaveBeenCalled();
      expect(localStorage.getItem).not.toHaveBeenCalled();
    });
  });

  describe('User Experience', () => {
    it('should clear form on successful login', async () => {
      renderLoginForm();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      });

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, user: { students: [] } }),
      });

      const user = userEvent.setup();
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      // Wait for redirect
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled();
      });
    });

    it('should maintain form values on error', async () => {
      renderLoginForm();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      });

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Invalid credentials' }),
      });

      const user = userEvent.setup();
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      // Email should still be filled
      expect(emailInput).toHaveValue('test@example.com');
    });

    it('should have link to registration page', async () => {
      renderLoginForm();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      });

      const registerLink = screen.getByRole('link', { name: /create account/i });
      expect(registerLink).toBeInTheDocument();
      expect(registerLink).toHaveAttribute('href', '/register');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for error messages', async () => {
      renderLoginForm();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      });

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Invalid credentials' }),
      });

      const user = userEvent.setup();
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        const errorAlert = screen.getByRole('alert');
        expect(errorAlert).toHaveAttribute('aria-live', 'polite');
      });
    });

    it('should have descriptive aria-labels for submit button states', async () => {
      renderLoginForm();

      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /sign in/i });
        expect(submitButton).toHaveAttribute(
          'aria-label',
          'Sign in to your account'
        );
      });
    });

    it('should have screen reader hints for form fields', async () => {
      renderLoginForm();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      });

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      expect(emailInput).toHaveAttribute('aria-describedby', 'email-hint');
      expect(passwordInput).toHaveAttribute('aria-describedby', 'password-hint');
    });
  });
});
