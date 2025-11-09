'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { WifiOff, RefreshCw, Home } from 'lucide-react';
import { useOffline } from '@/hooks/useOffline';
import { useI18n } from '@/hooks/useI18n';

export default function OfflinePage() {
  const router = useRouter();
  const { isOnline, syncQueue } = useOffline();
  const { t } = useI18n();

  useEffect(() => {
    if (isOnline) {
      // Redirect to dashboard when back online
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    }
  }, [isOnline, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <WifiOff className="w-24 h-24 mx-auto text-gray-400" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          {t('errors.network') || 'You\'re Offline'}
        </h1>
        
        <p className="text-lg text-gray-600 mb-8">
          {t('errors.network') || 'It looks like you\'re not connected to the internet. Please check your connection and try again.'}
        </p>

        <div className="space-y-4">
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary btn-lg w-full flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            {t('common.retry') || 'Try Again'}
          </button>

          <button
            onClick={() => router.push('/dashboard')}
            className="btn btn-secondary w-full flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            {t('common.back') || 'Go Home'}
          </button>
        </div>

        {isOnline && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">
              Connection restored! Redirecting...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

