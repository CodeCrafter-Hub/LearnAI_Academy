'use client';

import Image from 'next/image';
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
      // 32-40px height range (still substantial, not icon-like)
      height: 'clamp(2rem, 2vw + 1.5rem, 2.5rem)',
    },
    default: {
      // Standard header (most common use case)
      // 40-56px height range - proper logo size for enterprise apps
      height: 'clamp(2.5rem, 2.5vw + 2rem, 3.5rem)',
    },
    large: {
      // Hero sections, landing pages, prominent displays
      // 48-72px height range - maximum brand presence
      height: 'clamp(3rem, 3vw + 2.5rem, 4.5rem)',
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
      <Image 
        src="/logo.png" 
        alt="Aigents Academy - Ignited Minds, Powered by AI" 
        width={300}  // High-resolution source width (Next.js optimization)
        height={100} // High-resolution source height (maintains aspect ratio)
        className="object-contain"
        style={{
          height: logoStyle.height,
          width: 'auto', // Width follows from aspect ratio
          maxWidth: '100%', // Prevent overflow on small screens
        }}
        priority
      />
    </button>
  );
}

