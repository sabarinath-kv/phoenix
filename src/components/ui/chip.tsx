import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const chipVariants = cva(
  "chip-base micro-bounce",
  {
    variants: {
      variant: {
        default: "bg-secondary text-secondary-foreground border-border",
        primary: "bg-primary text-primary-foreground border-primary/20",
        success: "bg-game-success/10 text-game-success border-game-success/20",
        warning: "bg-game-warning/10 text-game-warning border-game-warning/20",
        info: "bg-game-info/10 text-game-info border-game-info/20",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        default: "px-3 py-1 text-sm",
        lg: "px-4 py-1.5 text-body",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ChipProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof chipVariants> {}

const Chip = React.forwardRef<HTMLDivElement, ChipProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div
        className={cn(chipVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Chip.displayName = "Chip";

export { Chip, chipVariants };
