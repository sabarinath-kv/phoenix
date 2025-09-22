# Image Preloading System

This document describes the image preloading system implemented to reduce rendering delays in the Face Mimic Magic application.

## Overview

The image preloading system ensures that all critical images are loaded in the background when the application starts, providing a smoother user experience with reduced loading delays.

## Components

### 1. Image Preloader Utility (`src/utils/imagePreloader.ts`)

The core preloading utility that handles:
- **Automatic image discovery**: Imports all static images used in the app
- **Priority-based loading**: High priority images (like Wigloo character) load first
- **Progress tracking**: Monitor preloading progress and completion status
- **Error handling**: Gracefully handles failed image loads without breaking the app

#### Key Functions:
- `preloadImagesWithPriority()`: Loads images in priority order
- `preloadImages()`: Loads all images in parallel
- `getPreloadingProgress()`: Returns current loading progress
- `useImagePreloading()`: React hook for components to track progress

### 2. LazyImage Component (`src/components/LazyImage.tsx`)

Provides optimized image loading with:
- **Intersection Observer**: Only loads images when they come into view
- **Preload option**: Can force immediate loading for critical images
- **Placeholder support**: Shows loading states while images load
- **Error handling**: Fallback images for failed loads

### 3. PreloadedImage Component

A simplified wrapper around LazyImage that:
- Forces immediate preloading (bypasses lazy loading)
- Perfect for critical images that should load immediately
- Used in game cards, character illustrations, etc.

### 4. ImagePreloadingScreen Component (`src/components/ImagePreloadingScreen.tsx`)

Optional loading screen that:
- Shows preloading progress to users
- Ensures minimum loading time for better UX
- Can be used to wrap entire app or specific routes

## Implementation Details

### App-Level Preloading

In `src/App.tsx`, images start preloading immediately when the app loads:

```typescript
useEffect(() => {
  preloadImagesWithPriority().catch((error) => {
    console.error('Error preloading images:', error);
  });
}, []);
```

### Priority System

Images are loaded in three priority levels:

1. **High Priority** (loads first):
   - Wigloo character image (main feature)
   - Game card images (game1.png, game2.png, game3.png)

2. **Medium Priority** (loads second):
   - Game insights images
   - Result screens
   - Check/status icons

3. **Low Priority** (loads last):
   - UI icons (close, mic, pencil)
   - Decorative elements

### Component Usage

Replace standard `<img>` tags with `<PreloadedImage>` for critical images:

```typescript
// Before
<img src={gameImage} alt="Game" className="w-full h-full" />

// After
<PreloadedImage src={gameImage} alt="Game" className="w-full h-full" />
```

## Benefits

1. **Faster Rendering**: Critical images are already cached when components render
2. **Better UX**: Eliminates image "pop-in" effects during navigation
3. **Priority Loading**: Most important images load first
4. **Error Resilience**: Failed image loads don't break the app
5. **Progress Tracking**: Can show loading progress to users
6. **Lazy Loading**: Non-critical images still use intersection observer

## Performance Considerations

- **Parallel Loading**: All images in each priority level load simultaneously
- **Memory Efficient**: Only preloads images that are actually used
- **Network Aware**: Gracefully handles slow connections
- **Cache Friendly**: Leverages browser image caching

## Monitoring

Check browser console for preloading progress:
- `🚀 Starting to preload X images...`
- `✅ Preloaded: [image-url]`
- `✨ All images preloaded successfully in Xms`
- `❌ Failed to preload: [image-url]` (for debugging)

## Future Enhancements

- **Service Worker**: Cache images across sessions
- **WebP Support**: Modern image formats for better compression
- **Responsive Images**: Load different sizes based on device
- **Critical Resource Hints**: Use `<link rel="preload">` for above-the-fold images
