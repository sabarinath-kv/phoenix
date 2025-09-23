import React from 'react';
import { useImagePreloading } from '@/utils/imagePreloader';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';

interface ImagePreloadingScreenProps {
  children: React.ReactNode;
  showProgress?: boolean;
  minLoadingTime?: number; // Minimum time to show loading screen in ms
}

export function ImagePreloadingScreen({ 
  children, 
  showProgress = false,
  minLoadingTime = 1000 
}: ImagePreloadingScreenProps) {
  const { progress, isLoading, isComplete } = useImagePreloading();
  const [showContent, setShowContent] = React.useState(false);
  const [minTimeElapsed, setMinTimeElapsed] = React.useState(false);

  // Ensure minimum loading time for better UX
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, minLoadingTime);

    return () => clearTimeout(timer);
  }, [minLoadingTime]);

  // Show content when both conditions are met
  React.useEffect(() => {
    if (isComplete && minTimeElapsed) {
      setShowContent(true);
    }
  }, [isComplete, minTimeElapsed]);

  if (showContent) {
    return <>{children}</>;
  }

  if (!showProgress) {
    // Simple loading without progress
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading amazing games...</p>
        </div>
      </div>
    );
  }

  // Loading with progress
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <Card className="w-full max-w-md p-8 text-center space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-800">
            Preparing Your Games
          </h2>
          <p className="text-gray-600">
            Loading images for the best experience...
          </p>
        </div>
        
        <div className="space-y-3">
          <Progress 
            value={progress.percentage} 
            className="w-full h-3"
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>{progress.loaded} of {progress.total} images loaded</span>
            <span>{progress.percentage}%</span>
          </div>
        </div>
        
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-bounce w-2 h-2 bg-blue-600 rounded-full"></div>
          <div className="animate-bounce w-2 h-2 bg-blue-600 rounded-full" style={{ animationDelay: '0.1s' }}></div>
          <div className="animate-bounce w-2 h-2 bg-blue-600 rounded-full" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </Card>
    </div>
  );
}

/**
 * Higher-order component to wrap any component with image preloading
 */
export function withImagePreloading<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    showProgress?: boolean;
    minLoadingTime?: number;
  }
) {
  return function WrappedComponent(props: P) {
    return (
      <ImagePreloadingScreen {...options}>
        <Component {...props} />
      </ImagePreloadingScreen>
    );
  };
}
