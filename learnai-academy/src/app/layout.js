import { ToastProvider } from '@/components/ui/Toast';
import { AuthProvider } from '@/hooks/useAuth';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { NotificationProvider } from '@/components/providers/NotificationProvider';
import { GradeLevelUIProvider } from '@/components/learning/GradeLevelUIProvider';
import { I18nProvider } from '@/components/providers/I18nProvider';
import OfflineIndicator from '@/components/offline/OfflineIndicator';
import ServiceWorkerRegister from '@/components/offline/ServiceWorkerRegister';
import ErrorBoundary from '@/components/ErrorBoundary.js';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';

export const metadata = {
  title: "Aigents Academy",
  description: "AI-powered K-12 tutoring platform with personalized learning experiences.",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light">
      <body>
        <ThemeProvider>
          <ErrorBoundary showContactSupport={true}>
            <I18nProvider>
              <AuthProvider>
                <GradeLevelUIProvider>
                  <NotificationProvider>
                    <ToastProvider>
                      <ServiceWorkerRegister />
                      <OfflineIndicator />
                      {children}
                    </ToastProvider>
                  </NotificationProvider>
                </GradeLevelUIProvider>
              </AuthProvider>
            </I18nProvider>
          </ErrorBoundary>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
