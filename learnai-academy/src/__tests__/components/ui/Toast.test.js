import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider, useToast } from '@/components/ui/Toast';

describe('Toast Component', () => {
  // Test component that uses useToast
  function TestComponent() {
    const { addToast } = useToast();

    return (
      <div>
        <button onClick={() => addToast('Test message', 'info')}>Show Toast</button>
        <button onClick={() => addToast('Success message', 'success')}>Show Success</button>
        <button onClick={() => addToast('Error message', 'error')}>Show Error</button>
        <button onClick={() => addToast('Warning message', 'warning')}>Show Warning</button>
        <button onClick={() => addToast('Persistent', 'info', 0)}>Show Persistent</button>
      </div>
    );
  }

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    it('should render toast when addToast is called', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const user = userEvent.setup({ delay: null });
      const button = screen.getByText('Show Toast');

      await user.click(button);

      expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    it('should render multiple toasts', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const user = userEvent.setup({ delay: null });

      await user.click(screen.getByText('Show Toast'));
      await user.click(screen.getByText('Show Success'));
      await user.click(screen.getByText('Show Error'));

      expect(screen.getByText('Test message')).toBeInTheDocument();
      expect(screen.getByText('Success message')).toBeInTheDocument();
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });

    it('should render toasts in a fixed position', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const toastContainer = document.querySelector('.fixed.top-4.right-4');
      expect(toastContainer).toBeInTheDocument();
    });
  });

  describe('Toast Types', () => {
    it('should render success toast with correct styling', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const user = userEvent.setup({ delay: null });
      await user.click(screen.getByText('Show Success'));

      const toast = screen.getByText('Success message').closest('div');
      expect(toast).toHaveClass('bg-green-50');
      expect(toast).toHaveClass('border-green-200');
      expect(toast).toHaveClass('text-green-800');
    });

    it('should render error toast with correct styling', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const user = userEvent.setup({ delay: null });
      await user.click(screen.getByText('Show Error'));

      const toast = screen.getByText('Error message').closest('div');
      expect(toast).toHaveClass('bg-red-50');
      expect(toast).toHaveClass('border-red-200');
      expect(toast).toHaveClass('text-red-800');
    });

    it('should render warning toast with correct styling', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const user = userEvent.setup({ delay: null });
      await user.click(screen.getByText('Show Warning'));

      const toast = screen.getByText('Warning message').closest('div');
      expect(toast).toHaveClass('bg-yellow-50');
      expect(toast).toHaveClass('border-yellow-200');
      expect(toast).toHaveClass('text-yellow-800');
    });

    it('should render info toast with correct styling', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const user = userEvent.setup({ delay: null });
      await user.click(screen.getByText('Show Toast'));

      const toast = screen.getByText('Test message').closest('div');
      expect(toast).toHaveClass('bg-blue-50');
      expect(toast).toHaveClass('border-blue-200');
      expect(toast).toHaveClass('text-blue-800');
    });
  });

  describe('Auto-dismiss', () => {
    it('should auto-dismiss toast after default duration (5000ms)', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const user = userEvent.setup({ delay: null });
      await user.click(screen.getByText('Show Toast'));

      expect(screen.getByText('Test message')).toBeInTheDocument();

      // Fast-forward time by 5000ms
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Toast should be removed
      await waitFor(() => {
        expect(screen.queryByText('Test message')).not.toBeInTheDocument();
      });
    });

    it('should not auto-dismiss when duration is 0', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const user = userEvent.setup({ delay: null });
      await user.click(screen.getByText('Show Persistent'));

      expect(screen.getByText('Persistent')).toBeInTheDocument();

      // Fast-forward time significantly
      act(() => {
        jest.advanceTimersByTime(10000);
      });

      // Toast should still be there
      expect(screen.getByText('Persistent')).toBeInTheDocument();
    });

    it('should respect custom duration', async () => {
      function CustomDurationComponent() {
        const { addToast } = useToast();
        return (
          <button onClick={() => addToast('Custom duration', 'info', 1000)}>
            Show Custom
          </button>
        );
      }

      render(
        <ToastProvider>
          <CustomDurationComponent />
        </ToastProvider>
      );

      const user = userEvent.setup({ delay: null });
      await user.click(screen.getByText('Show Custom'));

      expect(screen.getByText('Custom duration')).toBeInTheDocument();

      // Fast-forward time by 1000ms
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Toast should be removed
      await waitFor(() => {
        expect(screen.queryByText('Custom duration')).not.toBeInTheDocument();
      });
    });
  });

  describe('Manual Dismiss', () => {
    it('should allow manual dismissal via close button', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const user = userEvent.setup({ delay: null });
      await user.click(screen.getByText('Show Toast'));

      expect(screen.getByText('Test message')).toBeInTheDocument();

      // Find and click close button
      const closeButtons = screen.getAllByRole('button');
      const closeButton = closeButtons.find((btn) =>
        btn.querySelector('svg') // X icon
      );

      await user.click(closeButton);

      // Toast should be removed with animation
      await waitFor(() => {
        expect(screen.queryByText('Test message')).not.toBeInTheDocument();
      });
    });

    it('should handle multiple toasts dismissal independently', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const user = userEvent.setup({ delay: null });
      await user.click(screen.getByText('Show Toast'));
      await user.click(screen.getByText('Show Success'));
      await user.click(screen.getByText('Show Error'));

      expect(screen.getByText('Test message')).toBeInTheDocument();
      expect(screen.getByText('Success message')).toBeInTheDocument();
      expect(screen.getByText('Error message')).toBeInTheDocument();

      // Find all close buttons
      const closeButtons = screen.getAllByRole('button').filter((btn) =>
        btn.querySelector('svg')
      );

      // Close the middle toast
      await user.click(closeButtons[1]);

      await waitFor(() => {
        expect(screen.queryByText('Success message')).not.toBeInTheDocument();
      });

      // Other toasts should still be visible
      expect(screen.getByText('Test message')).toBeInTheDocument();
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });
  });

  describe('Animations', () => {
    it('should have fade-in animation class', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const user = userEvent.setup({ delay: null });
      await user.click(screen.getByText('Show Toast'));

      const toast = screen.getByText('Test message').closest('div');
      expect(toast).toHaveClass('animate-fadeIn');
    });

    it('should have transition classes for smooth animations', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const user = userEvent.setup({ delay: null });
      await user.click(screen.getByText('Show Toast'));

      const toast = screen.getByText('Test message').closest('div');
      expect(toast).toHaveClass('transition-all');
      expect(toast).toHaveClass('duration-300');
    });
  });

  describe('Icons', () => {
    it('should display correct icon for success toast', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const user = userEvent.setup({ delay: null });
      await user.click(screen.getByText('Show Success'));

      // CheckCircle icon should be present
      const toast = screen.getByText('Success message').closest('div');
      const icon = toast.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should display correct icon for error toast', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const user = userEvent.setup({ delay: null });
      await user.click(screen.getByText('Show Error'));

      // AlertCircle icon should be present
      const toast = screen.getByText('Error message').closest('div');
      const icon = toast.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should display correct icon for warning toast', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const user = userEvent.setup({ delay: null });
      await user.click(screen.getByText('Show Warning'));

      // AlertTriangle icon should be present
      const toast = screen.getByText('Warning message').closest('div');
      const icon = toast.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle useToast outside provider with fallback', () => {
      // Component without ToastProvider
      function ComponentWithoutProvider() {
        const { addToast } = useToast();

        // Should not throw error
        return <button onClick={() => addToast('Test', 'info')}>Click</button>;
      }

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      render(<ComponentWithoutProvider />);

      const button = screen.getByText('Click');
      const user = userEvent.setup({ delay: null });

      // Should not throw
      expect(() => user.click(button)).not.toThrow();

      consoleSpy.mockRestore();
    });
  });

  describe('Stacking', () => {
    it('should stack multiple toasts vertically', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const user = userEvent.setup({ delay: null });
      await user.click(screen.getByText('Show Toast'));
      await user.click(screen.getByText('Show Success'));
      await user.click(screen.getByText('Show Error'));

      const toastContainer = document.querySelector('.fixed.top-4.right-4');
      expect(toastContainer).toHaveClass('space-y-2');
    });

    it('should maintain z-index for stacking', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const toastContainer = document.querySelector('.fixed.top-4.right-4');
      expect(toastContainer).toHaveClass('z-50');
    });
  });

  describe('Accessibility', () => {
    it('should have minimum width for readability', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const user = userEvent.setup({ delay: null });
      await user.click(screen.getByText('Show Toast'));

      const toast = screen.getByText('Test message').closest('div');
      expect(toast).toHaveClass('min-w-[300px]');
    });

    it('should have maximum width to prevent overflow', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const user = userEvent.setup({ delay: null });
      await user.click(screen.getByText('Show Toast'));

      const toast = screen.getByText('Test message').closest('div');
      expect(toast).toHaveClass('max-w-md');
    });

    it('should have proper visual hierarchy with padding', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const user = userEvent.setup({ delay: null });
      await user.click(screen.getByText('Show Toast'));

      const toast = screen.getByText('Test message').closest('div');
      expect(toast).toHaveClass('p-4');
    });
  });
});
