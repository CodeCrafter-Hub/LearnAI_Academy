'use client';

import { useEffect, useState } from 'react';

/**
 * PageTransition Component
 * Provides smooth fade and slide transitions between selection steps
 */
export default function PageTransition({ children, step, direction = 'forward' }) {
  const [isVisible, setIsVisible] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);

  useEffect(() => {
    // Fade out
    setIsVisible(false);
    
    // After fade out, update content
    const timer = setTimeout(() => {
      setDisplayChildren(children);
      setIsVisible(true);
    }, 150);

    return () => clearTimeout(timer);
  }, [step, children]);

  useEffect(() => {
    // Fade in on mount
    setIsVisible(true);
  }, []);

  return (
    <div
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible 
          ? 'translateY(0)' 
          : direction === 'forward' 
            ? 'translateY(20px)' 
            : 'translateY(-20px)',
        transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out',
        width: '100%',
      }}
    >
      {displayChildren}
    </div>
  );
}

