'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

/**
 * Global Logo Component
 * Used consistently across the entire application
 */
export default function Logo({ 
  size = 'default', // 'small', 'default', 'large'
  showText = false, // Whether to show text (logo image already contains text)
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

  const sizeMap = {
    small: { width: 120, height: 40, maxHeight: '32px' },
    default: { width: 180, height: 60, maxHeight: '50px' },
    large: { width: 240, height: 80, maxHeight: '70px' },
  };

  const dimensions = sizeMap[size] || sizeMap.default;

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
        width={dimensions.width}
        height={dimensions.height}
        className="object-contain"
        style={{
          height: 'auto',
          maxHeight: dimensions.maxHeight,
          width: 'auto',
        }}
        priority
      />
    </button>
  );
}

