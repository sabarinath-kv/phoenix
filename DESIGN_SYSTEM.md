# Face Mimic Magic Design System

A comprehensive design system implementation focused on creating a **Warm • Reassuring • Practical • Evidence-based • Playful-but-mature** experience.

## Typography

### Fonts
- **Headings**: Poppins (semibold for H1/H2)
- **Body**: Inter Regular
- **UI Elements**: Inter Medium (numbers, chips, metrics)

### Sizes & Usage
```tsx
// Headings
<h1>24-28px</h1>  // text-h1 / text-h1-lg
<h2>20-22px</h2>  // text-h2 / text-h2-lg

// Body & UI
<p>16px</p>       // text-body
<span className="caption">13px</span>      // Minimum size
<span className="caption-lg">14px</span>   // Standard captions
<span className="caption-night">15px</span> // Night mode minimum

// UI Text (numbers, metrics)
<span className="ui-text">Inter Medium</span>
```

## Corner Radius & Shadows

### Border Radius
```tsx
// Cards
<Card className="rounded-card">16px</Card>
<Card className="rounded-card-lg">20px</Card>

// Drawers
<div className="rounded-drawer">24px</div>

// Buttons & Pills
<Button radius="pill">999px (fully rounded)</Button>
<Button radius="default">12px</Button>
```

### Shadows
```tsx
// Soft, single-layer shadows only
<Card className="shadow-card">    // Base card shadow
<Card className="shadow-hover">   // Hover state
<div className="shadow-soft">     // Subtle elements
```

## Motion & Animations

### Micro-interactions (150-250ms ease-out)
```tsx
<Button className="micro-scale">   // Subtle scale on hover
<Card className="card-hover">      // Card hover effects
<div className="micro-bounce">     // Gentle bounce
```

### Progress & Charts (500-700ms)
```tsx
<div className="progress-bar">
  <div className="progress-fill animate-progress-fill" />
</div>
```

### Voice States (Calming 12-16fps)
```tsx
<VoiceIndicator variant="pulse" isActive={true} />
<VoiceIndicator variant="waveform" isActive={true} />
```

## Components

### Button System
```tsx
// Variants with micro-interactions built-in
<Button variant="default">Primary Action</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Subtle Action</Button>
<Button variant="game">Playful Game Action</Button>

// Sizes (all meet 44x44px minimum touch target)
<Button size="sm">Small</Button>
<Button size="default">Standard</Button>
<Button size="lg">Large</Button>
<Button size="icon">Icon Only</Button>

// Radius options
<Button radius="default">Rounded</Button>
<Button radius="pill">Fully Rounded</Button>
```

### Card System
```tsx
<Card className="card-hover">
  <CardHeader>
    <CardTitle>Uses Poppins semibold</CardTitle>
    <CardDescription>Caption-lg size</CardDescription>
  </CardHeader>
  <CardContent>
    Content with proper spacing
  </CardContent>
</Card>
```

### Chip/Badge System
```tsx
<Chip variant="default">Status</Chip>
<Chip variant="success">Ready to Play</Chip>
<Chip variant="warning">Attention</Chip>
<Chip variant="info">Information</Chip>
```

### Metric Display
```tsx
<MetricDisplay 
  value="1,234" 
  label="Score" 
  variant="primary" 
  size="lg" 
/>
```

### Voice Indicator
```tsx
// Pulse ring for listening state
<VoiceIndicator variant="pulse" isActive={isListening} />

// Waveform for processing/speaking
<VoiceIndicator variant="waveform" isActive={isProcessing} />
```

## Focus States

### Light Mode
- Standard ring focus with offset

### Dark Mode  
- Subtle inner glow with primary color
- No harsh outlines
- Smooth 200ms animation

```css
.dark button:focus-visible {
  animation: focus-glow 200ms ease-out forwards;
  box-shadow: 
    0 0 0 2px hsl(var(--primary) / 0.3),
    inset 0 0 0 1px hsl(var(--primary) / 0.2);
}
```

## Accessibility

### Touch Targets
- Minimum 44×44px for all interactive elements
- Built into `.btn-base` and `.touch-target` utilities

### Typography
- Captions minimum 15px in night flows
- High contrast ratios maintained
- Proper heading hierarchy

### Motion
- Respects `prefers-reduced-motion`
- Gentle, calming animations (12-16fps for voice states)
- No harsh or jarring transitions

## Usage Examples

### Voice State Hook
```tsx
const voiceState = useVoiceState({
  onStateChange: (state) => console.log('Voice:', state),
  autoTimeout: 3000,
});

// Use in components
<VoiceIndicator 
  variant="pulse" 
  isActive={voiceState.isListening} 
/>
```

### Responsive Typography
```tsx
// Automatically scales on larger screens
<h1>Responsive Heading</h1>  // 24px → 28px on md+
<h2>Subheading</h2>          // 20px → 22px on md+
```

### Brand Personality
Every component reinforces:
- **Warm**: Soft shadows, gentle animations
- **Reassuring**: Consistent patterns, predictable interactions  
- **Practical**: Clear hierarchy, accessible design
- **Evidence-based**: Proper contrast, tested patterns
- **Playful-but-mature**: Subtle bounces, colorful but professional
