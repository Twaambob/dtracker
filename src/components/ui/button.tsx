import * as React from "react"
// import { type VariantProps, cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

// I forgot to install class-variance-authority. I will do it.
// For now, I'll write the code assuming it's available, and install it in the next step.

// Actually, I should install it first or right now.
// I'll skip CVA for now to keep it simple or install it. CVA is standard for these components.
// I'll install it in the next turn. I'll write a simple version first?
// No, I want "award winning". I should use CVA.

// I'll write the file but I need to start the install command.
// I'll use a simpler approach without CVA for this turn to avoid breakage,
// OR I'll assume I can install it immediately.
// I'll install it immediately.

// Let's use standard props for now to ensure compile.
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    // I'll implement manual class logic for now to avoid dependency hell this second.
    // Later I can refactor to CVA.

    const variants = {
      default: "bg-primary text-primary-foreground hover:bg-primary/90",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      link: "text-primary underline-offset-4 hover:underline",
    }

    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
      icon: "h-10 w-10",
    }

    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
