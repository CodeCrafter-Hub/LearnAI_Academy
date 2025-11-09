'use client';

import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useOffline } from '@/hooks/useOffline';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * OfflineIndicator Component
 * Shows offline status and pending sync queue
 */
export default function OfflineIndicator() {
  const { isOnline, isOffline, queueLength, syncQueue } = useOffline();

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-orange-500 text-white px-4 py-2 text-center"
        >
          <div className="container flex items-center justify-center gap-2">
            <WifiOff className="w-4 h-4" />
            <span className="text-sm font-medium">
              You're offline. {queueLength > 0 && `${queueLength} action${queueLength !== 1 ? 's' : ''} queued for sync.`}
            </span>
          </div>
        </motion.div>
      )}

      {isOnline && queueLength > 0 && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-blue-500 text-white px-4 py-2 text-center"
        >
          <div className="container flex items-center justify-center gap-2">
            <Wifi className="w-4 h-4" />
            <span className="text-sm font-medium">
              Syncing {queueLength} pending action{queueLength !== 1 ? 's' : ''}...
            </span>
            <button
              onClick={syncQueue}
              className="ml-2 p-1 rounded hover:bg-blue-600 transition-colors"
              aria-label="Sync now"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

