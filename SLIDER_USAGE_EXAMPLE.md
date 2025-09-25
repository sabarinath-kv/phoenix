# Slider Usage Examples

This document shows how to use the updated slider components with data-driven slides.

## FocusSpanSlider with Slide Data

The FocusSpanSlider component in `ReportPage.tsx` now uses a data-driven approach:

```typescript
// Define slide data structure
interface SlideData {
  id: number;
  title: string;
  currentTime: string;
  maxTime: string;
  progress: number;
  recommendation: string;
  imageSrc: string;
  imageAlt: string;
}

// Create slide data array
const slideData: SlideData[] = [
  {
    id: 1,
    title: "Focus Span",
    currentTime: "20sec",
    maxTime: "1 min",
    progress: 33,
    recommendation: "Break into 5-min bursts.",
    imageSrc: report1Image,
    imageAlt: "Focus Span Character"
  },
  // ... more slides
];

// State management
const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
const [currentProgress, setCurrentProgress] = useState(slideData[0].progress);

// Navigation handlers
const handleNext = () => {
  if (currentSlideIndex < totalSlides - 1) {
    const nextIndex = currentSlideIndex + 1;
    setCurrentSlideIndex(nextIndex);
    setCurrentProgress(slideData[nextIndex].progress);
  }
};

const handleBack = () => {
  if (currentSlideIndex > 0) {
    const prevIndex = currentSlideIndex - 1;
    setCurrentSlideIndex(prevIndex);
    setCurrentProgress(slideData[prevIndex].progress);
  } else {
    navigate(-1);
  }
};
```

## ReportSlider with Slide Data (Optional)

The ReportSlider component now supports both traditional usage and data-driven slides:

### Traditional Usage (existing)
```typescript
<ReportSlider
  imageSrc={imageUrl}
  imageAlt="Progress image"
  progressMessages={["Starting...", "In progress...", "Almost done...", "Complete!"]}
  progress={50}
  interactive={true}
  onProgressChange={(progress, messageIndex) => {
    console.log(`Progress: ${progress}%, Message: ${messageIndex}`);
  }}
/>
```

### Data-Driven Usage (new)
```typescript
const slideData = [
  {
    id: 1,
    imageSrc: "/image1.png",
    imageAlt: "First slide",
    message: "Starting the process...",
    progress: 25
  },
  {
    id: 2,
    imageSrc: "/image2.png",
    imageAlt: "Second slide", 
    message: "Making progress...",
    progress: 50
  },
  {
    id: 3,
    imageSrc: "/image3.png",
    imageAlt: "Third slide",
    message: "Almost finished...",
    progress: 75
  },
  {
    id: 4,
    imageSrc: "/image4.png",
    imageAlt: "Final slide",
    message: "Process complete!",
    progress: 100
  }
];

const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

<ReportSlider
  imageSrc="" // Not used when slideData is provided
  imageAlt=""
  progressMessages={[]} // Not used when slideData is provided
  progress={0} // Not used when slideData is provided
  slideData={slideData}
  currentSlideIndex={currentSlideIndex}
  interactive={true}
  onSlideChange={(slideIndex) => {
    setCurrentSlideIndex(slideIndex);
  }}
  onProgressChange={(progress, messageIndex) => {
    console.log(`Progress: ${progress}%, Slide: ${messageIndex}`);
  }}
/>
```

## Key Features

### State Management
- Both components now use proper state management for current slide/progress
- State updates trigger re-renders with new content
- Progress values are maintained per slide

### Navigation
- **FocusSpanSlider**: Uses Next/Back buttons for slide navigation
- **ReportSlider**: Can use slider interaction to change slides (when data-driven)

### Data Structure
- Flexible slide data structure
- Each slide can have different images, text, and progress values
- Easy to extend with additional properties

### Backward Compatibility
- ReportSlider maintains backward compatibility with existing usage
- New features are opt-in via optional props

## Benefits

1. **Maintainable**: Slide content is centralized in data structures
2. **Flexible**: Easy to add, remove, or modify slides
3. **Reusable**: Components can be used with different data sets
4. **Interactive**: Proper state management enables smooth transitions
5. **Consistent**: Both components follow similar patterns
