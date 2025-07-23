import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-base font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: 
          "bg-gradient-to-r from-burgundy-600 to-burgundy-700 text-white shadow-burgundy hover:shadow-burgundy-lg hover:scale-105 focus-visible:ring-burgundy-500",
        secondary:
          "bg-white text-burgundy-700 border-2 border-burgundy-200 hover:bg-burgundy-50 hover:border-burgundy-300 focus-visible:ring-burgundy-500",
        ghost: 
          "bg-transparent text-gray-700 border border-gray-200 hover:bg-gray-50 hover:text-gray-900 focus-visible:ring-gray-500",
        luxury:
          "bg-gradient-to-r from-burgundy-600 via-burgundy-700 to-burgundy-800 text-white shadow-luxury hover:shadow-luxury-lg hover:scale-105 focus-visible:ring-burgundy-500 relative overflow-hidden",
        outline:
          "border-2 border-burgundy-200 bg-transparent text-burgundy-700 hover:bg-burgundy-50 hover:border-burgundy-400 focus-visible:ring-burgundy-500",
        link: 
          "text-burgundy-600 underline-offset-4 hover:underline hover:text-burgundy-700 focus-visible:ring-burgundy-500"
      },
      size: {
        sm: "h-10 px-4 py-2 text-sm",
        md: "h-12 px-6 py-3 text-base",
        lg: "h-14 px-8 py-4 text-lg",
        xl: "h-16 px-12 py-6 text-xl",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {variant === "luxury" && (
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        )}
        <span className="relative z-10">{children}</span>
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }