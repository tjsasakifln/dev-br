import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-brasil hover:cursor-pointer relative overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "border border-brasil-gold/30 bg-transparent text-brasil-pearl shadow-xs hover:bg-brasil-gold/10 hover:border-brasil-gold/50 hover:shadow-lg",
        secondary:
          "bg-brasil-royal text-brasil-pearl shadow-xs hover:bg-brasil-royal/80 hover:shadow-lg border border-brasil-gold/20",
        ghost: "hover:bg-brasil-gold/10 hover:text-brasil-gold transition-colors duration-200",
        link: "text-brasil-gold underline-offset-4 hover:underline hover:text-brasil-amber",
        brasil: "btn-brasil shadow-lg hover:shadow-xl hover:glow-gold transform hover:scale-105 active:scale-95",
        success: "bg-success-gradient text-success-foreground shadow-lg hover:shadow-xl hover:glow-success",
        warning: "bg-warning text-warning-foreground shadow-lg hover:shadow-xl hover:scale-105",
      },
      size: {
        default: "h-10 px-6 py-3 has-[>svg]:px-4",
        sm: "h-8 rounded-md gap-1.5 px-4 has-[>svg]:px-3 text-xs",
        lg: "h-12 rounded-lg px-8 has-[>svg]:px-6 text-base",
        xl: "h-14 rounded-xl px-10 has-[>svg]:px-8 text-lg",
        icon: "size-10",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "brasil",
      size: "default",
    },
  },
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants, type ButtonProps };
