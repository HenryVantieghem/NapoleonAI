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
          "bg-gradient-to-r from-champagneGold to-champagneGold-700 text-jetBlack shadow-lg hover:shadow-xl hover:scale-105 focus-visible:ring-champagneGold/50 font-semibold",
        secondary:
          "bg-midnightBlue text-warmIvory border-2 border-platinumSilver hover:bg-midnightBlue-900 hover:border-champagneGold focus-visible:ring-champagneGold/50",
        ghost: 
          "bg-transparent text-platinumSilver border border-platinumSilver hover:bg-platinumSilver/10 hover:text-warmIvory hover:border-champagneGold focus-visible:ring-champagneGold/50",
        luxury:
          "bg-gradient-to-r from-champagneGold via-champagneGold-700 to-champagneGold-800 text-jetBlack shadow-luxury hover:shadow-luxury-lg hover:scale-105 focus-visible:ring-champagneGold/50 relative overflow-hidden font-semibold",
        outline:
          "border-2 border-platinumSilver bg-transparent text-warmIvory hover:bg-platinumSilver/10 hover:border-champagneGold focus-visible:ring-champagneGold/50",
        link: 
          "text-champagneGold underline-offset-4 hover:underline hover:text-champagneGold/80 focus-visible:ring-champagneGold/50",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
        vip:
          "bg-cognacLeather text-warmIvory border border-champagneGold hover:bg-cognacLeather-800 hover:shadow-champagne-glow focus-visible:ring-champagneGold/50 font-medium"
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