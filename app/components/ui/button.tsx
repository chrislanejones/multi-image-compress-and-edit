import React from 'react'
import { cn } from '../../lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function Button({ className, variant = 'default', size = 'default', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        {
          "bg-primary text-primary-foreground hover:bg-primary/90": variant === 'default',
          "bg-destructive text-destructive-foreground hover:bg-destructive/90": variant === 'destructive',
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground": variant === 'outline',
          "bg-secondary text-secondary-foreground hover:bg-secondary/80": variant === 'secondary',
          "hover:bg-accent hover:text-accent-foreground": variant === 'ghost',
          "text-primary underline-offset-4 hover:underline": variant === 'link',
        },
        {
          "h-10 px-4 py-2": size === 'default',
          "h-9 rounded-md px-3": size === 'sm',
          "h-11 rounded-md px-8": size === 'lg',
          "h-10 w-10": size === 'icon',
        },
        className
      )}
      {...props}
    />
  )
}
