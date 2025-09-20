import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const metricDisplayVariants = cva(
  "metric-display",
  {
    variants: {
      size: {
        sm: "text-body",
        default: "text-lg",
        lg: "text-xl",
        xl: "text-2xl",
      },
      variant: {
        default: "text-foreground",
        muted: "text-muted-foreground",
        primary: "text-primary",
        success: "text-game-success",
        warning: "text-game-warning",
        info: "text-game-info",
      }
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  },
);

export interface MetricDisplayProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof metricDisplayVariants> {
  value: string | number;
  label?: string;
}

const MetricDisplay = React.forwardRef<HTMLDivElement, MetricDisplayProps>(
  ({ className, size, variant, value, label, ...props }, ref) => {
    return (
      <div
        className={cn("flex flex-col items-center gap-1", className)}
        ref={ref}
        {...props}
      >
        <div className={cn(metricDisplayVariants({ size, variant }))}>
          {value}
        </div>
        {label && (
          <div className="caption text-muted-foreground text-center">
            {label}
          </div>
        )}
      </div>
    );
  },
);
MetricDisplay.displayName = "MetricDisplay";

export { MetricDisplay, metricDisplayVariants };
