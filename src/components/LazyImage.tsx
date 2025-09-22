import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'onLoad' | 'onError'> {
  src: string;
  alt: string;
  fallback?: string;
  placeholder?: React.ReactNode;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
  preload?: boolean;
}

export function LazyImage({
  src,
  alt,
  fallback,
  placeholder,
  className,
  onLoad,
  onError,
  preload = false,
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(preload); // If preload is true, start loading immediately
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (preload) return; // Skip observer if preloading

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px', // Start loading 50px before the image comes into view
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    observerRef.current = observer;

    return () => {
      observer.disconnect();
    };
  }, [preload]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const shouldShowPlaceholder = !isLoaded && !hasError;
  const shouldShowFallback = hasError && fallback;
  const shouldShowImage = (isLoaded || isInView) && !hasError;

  return (
    <div ref={imgRef} className={cn('relative overflow-hidden', className)}>
      {/* Placeholder */}
      {shouldShowPlaceholder && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
          {placeholder || (
            <div className="w-8 h-8 bg-gray-300 rounded animate-pulse" />
          )}
        </div>
      )}

      {/* Fallback image */}
      {shouldShowFallback && (
        <img
          src={fallback}
          alt={alt}
          className={cn('w-full h-full object-cover', className)}
          {...props}
        />
      )}

      {/* Main image */}
      {(isInView || preload) && (
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            shouldShowImage ? 'opacity-100' : 'opacity-0',
            className
          )}
          {...props}
        />
      )}
    </div>
  );
}

/**
 * A simpler image component with built-in preloading
 */
export function PreloadedImage({
  src,
  alt,
  className,
  onLoad,
  onError,
  ...props
}: Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'onLoad' | 'onError'> & {
  src: string;
  alt: string;
  onLoad?: () => void;
  onError?: () => void;
}) {
  return (
    <LazyImage
      src={src}
      alt={alt}
      preload={true}
      className={className}
      onLoad={onLoad}
      onError={onError}
      {...props}
    />
  );
}
