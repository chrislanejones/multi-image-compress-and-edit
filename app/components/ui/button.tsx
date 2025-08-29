// Example: Fixed Button component
import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        // Base styles
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",

        // Variant styles
        {
          // Default buttons draw from the primary palette colours defined in globals.css.
          "bg-primary text-primary-foreground hover:bg-primary/90":
            variant === "default",
          // Destructive buttons remain red for clear communication of dangerous actions.
          "bg-red-600 text-white hover:bg-red-700": variant === "destructive",
          // Outline variant now includes a subtle border to separate it from the background.
          "bg-background border border-background text-foreground hover:secondary/10 hover:text-accent-foreground":
            variant === "outline",
          // Secondary variant uses the secondary palette colours.
          "bg-secondary text-secondary-foreground hover:bg-secondary/80":
            variant === "secondary",
          // Ghost variant remains minimalist, but gains contrast on hover via the accent colours.
          "hover:bg-accent hover:text-accent-foreground": variant === "ghost",
          // Link variant uses the primary colour for text and a subtle underline on hover.
          "text-primary underline-offset-4 hover:underline": variant === "link",
        },

        // Size styles
        {
          "h-10 px-4 py-2": size === "default",
          "h-9 rounded-md px-3": size === "sm",
          "h-11 rounded-md px-8": size === "lg",
          "h-10 w-10": size === "icon",
        },

        // Custom className from props
        className
      )}
      {...props}
    />
  );
}
