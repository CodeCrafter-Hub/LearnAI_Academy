'use client';

/**
 * LoadingSpinner Component
 *
 * A reusable loading spinner with optional message.
 * Displays a rotating circle animation with centered text below it.
 */
export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="text-center mt-8">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-gray-600">{message}</p>
    </div>
  );
}
