import { ToastProvider } from '@/components/ui/Toast';
import ErrorBoundary from '@/components/ErrorBoundary';
import './globals.css';

export const metadata = {
  title: "LearnAI Academy",
  description: "AI-powered K-12 tutoring platform with personalized learning experiences."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary showContactSupport={true}>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
