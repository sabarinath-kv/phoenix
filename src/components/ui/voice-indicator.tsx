import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const voiceIndicatorVariants = cva(
  "inline-flex items-center justify-center",
  {
    variants: {
      variant: {
        pulse: "voice-pulse-ring",
        waveform: "waveform-container gap-1",
      },
      size: {
        sm: "w-8 h-8",
        default: "w-12 h-12",
        lg: "w-16 h-16",
      }
    },
    defaultVariants: {
      variant: "pulse",
      size: "default",
    },
  },
);

export interface VoiceIndicatorProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof voiceIndicatorVariants> {
  isActive?: boolean;
}

const VoiceIndicator = React.forwardRef<HTMLDivElement, VoiceIndicatorProps>(
  ({ className, variant, size, isActive = false, ...props }, ref) => {
    if (variant === "waveform") {
      return (
        <div
          className={cn(voiceIndicatorVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "voice-waveform-bar w-1",
                size === "sm" && "h-4",
                size === "default" && "h-6",
                size === "lg" && "h-8",
                !isActive && "animate-none opacity-30"
              )}
            />
          ))}
        </div>
      );
    }

    return (
      <div
        className={cn(
          voiceIndicatorVariants({ variant, size, className }),
          "bg-primary/20 border-2 border-primary/40",
          !isActive && "animate-none"
        )}
        ref={ref}
        {...props}
      >
        <div className="w-3 h-3 bg-primary rounded-full" />
      </div>
    );
  },
);
VoiceIndicator.displayName = "VoiceIndicator";

export { VoiceIndicator, voiceIndicatorVariants };
