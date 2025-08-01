import { cn } from "@/lib/utils"
import { HTMLAttributes, forwardRef } from "react"

// H1 Component
export const H1 = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement> & { gradient?: boolean }>(
  ({ className, gradient = false, children, ...props }, ref) => (
    <h1
      ref={ref}
      className={cn(
        "font-serif font-bold text-4xl sm:text-5xl lg:text-6xl leading-tight tracking-tight",
        gradient && "text-gradient-burgundy",
        !gradient && "text-gray-900",
        className
      )}
      {...props}
    >
      {children}
    </h1>
  )
)
H1.displayName = "H1"

// H2 Component
export const H2 = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement> & { gradient?: boolean }>(
  ({ className, gradient = false, children, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn(
        "font-serif font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight tracking-tight",
        gradient && "text-gradient-burgundy",
        !gradient && "text-gray-900",
        className
      )}
      {...props}
    >
      {children}
    </h2>
  )
)
H2.displayName = "H2"

// H3 Component
export const H3 = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement> & { gradient?: boolean }>(
  ({ className, gradient = false, children, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        "font-serif font-semibold text-2xl sm:text-3xl lg:text-4xl leading-snug",
        gradient && "text-gradient-burgundy",
        !gradient && "text-gray-900",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  )
)
H3.displayName = "H3"

// Paragraph component
export const P = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(
        "font-sans text-base sm:text-lg leading-relaxed text-gray-700",
        className
      )}
      {...props}
    >
      {children}
    </p>
  )
)
P.displayName = "P"

// Lead paragraph for important text
export const Lead = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(
        "font-sans text-lg sm:text-xl lg:text-2xl leading-relaxed text-gray-600",
        className
      )}
      {...props}
    >
      {children}
    </p>
  )
)
Lead.displayName = "Lead"

// Display text for hero sections
export const Display = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & { gradient?: boolean }>(
  ({ className, gradient = true, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "font-serif font-bold text-5xl sm:text-6xl lg:text-7xl xl:text-8xl leading-none tracking-tight",
        gradient && "text-gradient-burgundy",
        !gradient && "text-gray-900",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
Display.displayName = "Display"

// Quote component
export const Quote = forwardRef<HTMLQuoteElement, HTMLAttributes<HTMLQuoteElement>>(
  ({ className, children, ...props }, ref) => (
    <blockquote
      ref={ref}
      className={cn(
        "font-serif text-lg sm:text-xl italic text-gray-700 border-l-4 border-burgundy-300 pl-6 py-2",
        className
      )}
      {...props}
    >
      {children}
    </blockquote>
  )
)
Quote.displayName = "Quote"

// Typography variant component
interface TypographyProps extends HTMLAttributes<HTMLElement> {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'body-sm' | 'display' | 'lead'
  gradient?: boolean
  as?: keyof JSX.IntrinsicElements
}

export const Typography = forwardRef<HTMLElement, TypographyProps>(
  ({ variant = 'body', gradient = false, as, className, children, ...props }, ref) => {
    const Component = as || (variant.startsWith('h') ? variant as keyof JSX.IntrinsicElements : 'div')
    
    const variants = {
      h1: "font-serif font-bold text-4xl sm:text-5xl lg:text-6xl leading-tight tracking-tight",
      h2: "font-serif font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight tracking-tight", 
      h3: "font-serif font-semibold text-2xl sm:text-3xl lg:text-4xl leading-snug",
      body: "font-sans text-base sm:text-lg leading-relaxed text-gray-700",
      'body-sm': "font-sans text-sm leading-relaxed text-gray-600",
      display: "font-serif font-bold text-5xl sm:text-6xl lg:text-7xl xl:text-8xl leading-none tracking-tight",
      lead: "font-sans text-lg sm:text-xl lg:text-2xl leading-relaxed text-gray-600"
    }

    return (
      <Component
        className={cn(
          variants[variant],
          gradient && "text-gradient-burgundy",
          className
        )}
        {...(props as any)}
      >
        {children}
      </Component>
    )
  }
)

Typography.displayName = "Typography"