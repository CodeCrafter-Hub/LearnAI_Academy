'use client';

import { useRouter } from 'next/navigation';

/**
 * Global Logo Component
 * 
 * Displays logo at its natural size without modifications.
 * 
 * @param {function} onClick - Optional click handler (defaults to navigating to dashboard)
 * @param {string} className - Additional CSS classes
 */
export default function Logo({ 
  onClick,
  className = '',
}) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <button
      onClick={handleClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        transition: 'opacity var(--transition-fast)',
        padding: 0,
        lineHeight: 0,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = '0.8';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = '1';
      }}
      aria-label="Go to dashboard"
      className={className}
    >
      <img 
        src="/logo.svg" 
        alt="Aigents Academy - Ignited Minds, Powered by AI" 
        style={{
          height: 'clamp(3.5rem, 3vw + 2.5rem, 5rem)', // 56-80px - proper header logo size
          width: 'auto', // Maintain aspect ratio
          maxWidth: '100%', // Prevent overflow
          display: 'block',
        }}
      />
    </button>
  );
}

