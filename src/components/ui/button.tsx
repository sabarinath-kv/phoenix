import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "btn-base whitespace-nowrap ui-text text-sm focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft hover:shadow-hover micro-scale",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-soft micro-scale",
        outline: "border-2 border-border bg-background hover:bg-accent hover:text-accent-foreground shadow-soft micro-scale",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-soft micro-scale",
        ghost: "hover:bg-accent hover:text-accent-foreground micro-bounce",
        link: "text-primary underline-offset-4 hover:underline micro-bounce",
        game: "bg-gradient-primary text-white hover:opacity-90 shadow-soft hover:shadow-hover micro-scale",
        playful: "bg-gradient-playful text-white hover:opacity-90 shadow-soft hover:shadow-hover micro-scale"
      },
      size: {
        default: "h-12 px-6 py-3 btn-rounded",
        sm: "h-10 px-4 btn-rounded text-sm",
        lg: "h-14 px-8 btn-rounded text-body",
        icon: "h-12 w-12 btn-rounded",
        pill: "h-12 px-6 py-3 btn-pill",
      },
      radius: {
        default: "btn-rounded",
        pill: "btn-pill",
        none: "rounded-none",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      radius: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, radius, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, radius, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
