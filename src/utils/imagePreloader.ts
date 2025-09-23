/**
 * Image preloader utility to reduce rendering delays
 * Preloads all static images used in the application
 */

import React from 'react';

// Import all images that need to be preloaded
import game1Image from "@/assets/images/game1.png";
import game2Image from "@/assets/images/game2.png";
import game3Image from "@/assets/images/game3.png";
import checkLineImage from "@/assets/images/check-line.png";
import gameInsightsImage from "@/assets/images/game-insights.png";
import result1Image from "@/assets/images/result1.png";
import wiglooImage from "@/assets/images/wigloo-image.png";

// Import SVG icons
import closeLargeFillIcon from "@/assets/icons/close-large-fill.svg";
import micLineIcon from "@/assets/icons/mic-line.svg";
import pencilLineIcon from "@/assets/icons/pencil-line.svg";

// Define the images to preload
export const IMAGES_TO_PRELOAD = [
  // Game images
  game1Image,
  game2Image,
  game3Image,
  checkLineImage,
  gameInsightsImage,
  result1Image,
  wiglooImage,
  // SVG icons
  closeLargeFillIcon,
  micLineIcon,
  pencilLineIcon,
];

/**
 * Preload a single image
 * @param src - Image source URL
 * @returns Promise that resolves when image is loaded
 */
const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      console.log(`✅ Preloaded: ${src}`);
      resolve();
    };
    
    img.onerror = (error) => {
      console.warn(`❌ Failed to preload: ${src}`, error);
      // Resolve instead of reject to not break the entire preloading process
      resolve();
    };
    
    img.src = src;
  });
};

/**
 * Preload all images in parallel
 * @param images - Array of image URLs to preload
 * @returns Promise that resolves when all images are loaded (or failed)
 */
export const preloadImages = async (images: string[] = IMAGES_TO_PRELOAD): Promise<void> => {
  const startTime = performance.now();
  console.log(`🚀 Starting to preload ${images.length} images...`);
  
  try {
    // Preload all images in parallel
    await Promise.all(images.map(preloadImage));
    
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);
    console.log(`✨ All images preloaded successfully in ${duration}ms`);
  } catch (error) {
    console.error('Error during image preloading:', error);
  }
};

/**
 * Preload images with priority levels
 * High priority images are loaded first, then medium, then low
 */
export const preloadImagesWithPriority = async (): Promise<void> => {
  const highPriorityImages = [
    wiglooImage, // Used in voice chat (main feature)
    game1Image,  // First game image
    game2Image,  // Second game image
    game3Image,  // Third game image
  ];
  
  const mediumPriorityImages = [
    checkLineImage,
    gameInsightsImage,
    result1Image,
  ];
  
  const lowPriorityImages = [
    closeLargeFillIcon,
    micLineIcon,
    pencilLineIcon,
  ];
  
  console.log('🎯 Preloading high priority images...');
  await preloadImages(highPriorityImages);
  
  console.log('🎯 Preloading medium priority images...');
  await preloadImages(mediumPriorityImages);
  
  console.log('🎯 Preloading low priority images...');
  await preloadImages(lowPriorityImages);
  
  console.log('🎉 All priority-based preloading complete!');
};

/**
 * Check if an image is already cached
 * @param src - Image source URL
 * @returns boolean indicating if image is cached
 */
export const isImageCached = (src: string): boolean => {
  const img = new Image();
  img.src = src;
  return img.complete && img.naturalWidth !== 0;
};

/**
 * Get preloading progress
 * @param images - Array of image URLs to check
 * @returns Object with loaded count, total count, and percentage
 */
export const getPreloadingProgress = (images: string[] = IMAGES_TO_PRELOAD) => {
  const loadedCount = images.filter(isImageCached).length;
  const totalCount = images.length;
  const percentage = Math.round((loadedCount / totalCount) * 100);
  
  return {
    loaded: loadedCount,
    total: totalCount,
    percentage,
    isComplete: loadedCount === totalCount,
  };
};

/**
 * Hook for React components to track preloading progress
 */
export const useImagePreloading = () => {
  const [progress, setProgress] = React.useState(getPreloadingProgress());
  const [isLoading, setIsLoading] = React.useState(true);
  
  React.useEffect(() => {
    const startPreloading = async () => {
      setIsLoading(true);
      
      // Update progress periodically while preloading
      const progressInterval = setInterval(() => {
        const currentProgress = getPreloadingProgress();
        setProgress(currentProgress);
        
        if (currentProgress.isComplete) {
          clearInterval(progressInterval);
          setIsLoading(false);
        }
      }, 100);
      
      // Start preloading
      await preloadImagesWithPriority();
      
      // Final progress update
      const finalProgress = getPreloadingProgress();
      setProgress(finalProgress);
      setIsLoading(false);
      clearInterval(progressInterval);
    };
    
    startPreloading();
  }, []);
  
  return {
    progress,
    isLoading,
    isComplete: progress.isComplete,
  };
};
