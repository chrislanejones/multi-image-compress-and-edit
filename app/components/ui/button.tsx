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
  size?: "default" | "xs" | "sm" | "lg" | "icon";
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
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus:outline-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",

        // Variant styles
        {
          // Default buttons draw from the primary palette colours defined in globals.css.
          "bg-primary text-primary-foreground shadow hover:bg-primary/90":
            variant === "default",
          // Destructive buttons use theme destructive colors for clear communication of dangerous actions.
          "bg-destructive text-destructive-foreground shadow hover:bg-destructive/90": variant === "destructive",
          // Outline variant matches the HTML examples exactly.
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground":
            variant === "outline",
          // Secondary variant uses the secondary palette colours.
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80":
            variant === "secondary",
          // Ghost variant remains minimalist, but gains contrast on hover via the accent colours.
          "hover:bg-accent hover:text-accent-foreground": variant === "ghost",
          // Link variant uses the primary colour for text and a subtle underline on hover.
          "text-primary underline-offset-4 hover:underline": variant === "link",
        },

        // Size styles
        {
          "h-10 px-4 py-2": size === "default",
          "h-8 rounded-md px-3 text-xs": size === "xs",
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
