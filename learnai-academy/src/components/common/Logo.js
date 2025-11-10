'use client';

import { useRouter } from 'next/navigation';

/**
 * Global Logo Component
 * 
 * A proper logo implementation that scales fluidly with the design system.
 * Uses height-based sizing to maintain brand presence while respecting
 * responsive design principles.
 * 
 * @param {string} size - Logo size: 'small' (mobile/compact), 'default' (header), 'large' (hero)
 * @param {function} onClick - Optional click handler (defaults to navigating to dashboard)
 * @param {string} className - Additional CSS classes
 */
export default function Logo({ 
  size = 'default',
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

  // Fluid logo sizing aligned with design system
  // Height-based scaling ensures proper logo presence (not icon-like)
  // Width follows naturally from aspect ratio
  const sizeMap = {
    small: {
      // Mobile menu, footer, compact contexts
      // 40-48px height range - still substantial
      height: 'clamp(2.5rem, 2vw + 2rem, 3rem)',
    },
    default: {
      // Standard header (most common use case)
      // 56-80px height range - proper logo size for enterprise apps
      // Increased from 40-56px to ensure it doesn't look icon-like
      height: 'clamp(3.5rem, 3vw + 2.5rem, 5rem)',
    },
    large: {
      // Hero sections, landing pages, prominent displays
      // 64-96px height range - maximum brand presence
      height: 'clamp(4rem, 4vw + 3rem, 6rem)',
    },
  };

  const logoStyle = sizeMap[size] || sizeMap.default;

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
        lineHeight: 0, // Remove extra spacing from inline elements
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
        src="/logo.png" 
        alt="Aigents Academy - Ignited Minds, Powered by AI" 
        style={{
          height: logoStyle.height,
          width: 'auto', // Let width follow natural aspect ratio
          maxWidth: '100%', // Prevent overflow on small screens
          objectFit: 'contain', // Preserve aspect ratio, show full image
          display: 'block', // Remove inline spacing
        }}
      />
    </button>
  );
}

