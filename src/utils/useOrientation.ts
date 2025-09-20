import { useState, useEffect } from 'react';

export type Orientation = 'portrait' | 'landscape';

export const useOrientation = (): Orientation => {
  const [orientation, setOrientation] = useState<Orientation>(() => {
    // Initial orientation check
    if (typeof window !== 'undefined') {
      return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
    }
    return 'landscape'; // Default for SSR
  });

  useEffect(() => {
    const handleResize = () => {
      const newOrientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
      setOrientation(newOrientation);
    };

    // Listen for resize events
    window.addEventListener('resize', handleResize);
    
    // Listen for orientation change events (mobile)
    window.addEventListener('orientationchange', () => {
      // Small delay to ensure dimensions are updated
      setTimeout(handleResize, 100);
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return orientation;
};