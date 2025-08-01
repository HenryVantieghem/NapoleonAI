import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Crown, TrendingUp } from 'lucide-react'
import { LuxuryCard, ExecutiveStatCard, LuxuryTestimonialCard } from '../luxury-card'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    blockquote: ({ children, ...props }: any) => <blockquote {...props}>{children}</blockquote>,
  },
  forwardRef: (component: any) => component,
}))

// Mock animations
jest.mock('@/lib/animations', () => ({
  cardHoverEffect: {
    rest: { scale: 1 },
    hover: { scale: 1.02 },
  },
}))

describe('LuxuryCard Component', () => {
  it('renders with default private-jet styling', () => {
    render(
      <LuxuryCard data-testid="luxury-card">
        <div>Test Content</div>
      </LuxuryCard>
    )

    const card = screen.getByTestId('luxury-card')
    expect(card).toHaveClass('bg-midnightBlue')
    expect(card).toHaveClass('shadow-luxury')
    expect(card).toHaveClass('border-platinumSilver/20')
    expect(card).toHaveClass('rounded-2xl')
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('applies elevated variant with enhanced luxury shadows', () => {
    render(
      <LuxuryCard variant="elevated" data-testid="elevated-card">
        Content
      </LuxuryCard>
    )

    const card = screen.getByTestId('elevated-card')
    expect(card).toHaveClass('shadow-luxury-lg')
    expect(card).toHaveClass('border-platinumSilver/30')
  })

  it('applies glass variant with executive glassmorphism', () => {
    render(
      <LuxuryCard variant="glass" data-testid="glass-card">
        Glass Content
      </LuxuryCard>
    )

    const card = screen.getByTestId('glass-card')
    expect(card).toHaveClass('backdrop-blur-[30px]')
    expect(card).toHaveClass('bg-midnightBlue/10')
    expect(card).toHaveClass('shadow-[0_0_24px_rgba(0,0,0,0.5)]')
  })

  it('applies executive variant with jet black theme', () => {
    render(
      <LuxuryCard variant="executive" data-testid="executive-card">
        Executive Content
      </LuxuryCard>
    )

    const card = screen.getByTestId('executive-card')
    expect(card).toHaveClass('backdrop-blur-[30px]')
    expect(card).toHaveClass('bg-jetBlack/20')
    expect(card).toHaveClass('border-champagneGold/30')
  })

  it('applies gradient variant with midnight to jet black gradient', () => {
    render(
      <LuxuryCard variant="gradient" data-testid="gradient-card">
        Gradient Content
      </LuxuryCard>
    )

    const card = screen.getByTestId('gradient-card')
    expect(card).toHaveClass('bg-gradient-to-br')
    expect(card).toHaveClass('from-midnightBlue')
    expect(card).toHaveClass('to-jetBlack')
  })

  it('adds interactive hover effects when interactive prop is true', () => {
    render(
      <LuxuryCard interactive data-testid="interactive-card">
        Interactive Content
      </LuxuryCard>
    )

    const card = screen.getByTestId('interactive-card')
    expect(card).toHaveClass('cursor-pointer')
    expect(card).toHaveClass('hover:scale-[1.02]')
  })

  it('applies VIP styling with champagne gold accents', () => {
    render(
      <LuxuryCard vip data-testid="vip-card">
        VIP Content
      </LuxuryCard>
    )

    const card = screen.getByTestId('vip-card')
    expect(card).toHaveClass('ring-2')
    expect(card).toHaveClass('ring-champagneGold/30')
    expect(card).toHaveClass('shadow-champagne-glow')
  })

  it('renders shimmer effect when shimmer prop is true', () => {
    render(
      <LuxuryCard shimmer data-testid="shimmer-card">
        <div>Shimmer Content</div>
      </LuxuryCard>
    )

    const card = screen.getByTestId('shimmer-card')
    expect(card).toBeInTheDocument()
    
    // Check for shimmer animation elements
    const shimmerElement = card.querySelector('[class*="via-champagneGold/20"]')
    expect(shimmerElement).toBeInTheDocument()
  })

  it('renders glow effect when glow prop is true', () => {
    render(
      <LuxuryCard glow data-testid="glow-card">
        <div>Glow Content</div>
      </LuxuryCard>
    )

    const card = screen.getByTestId('glow-card')
    expect(card).toBeInTheDocument()
    
    // Check for glow effect elements
    const glowElement = card.querySelector('[class*="via-champagneGold/20"]')
    expect(glowElement).toBeInTheDocument()
  })

  it('combines multiple props correctly', () => {
    render(
      <LuxuryCard 
        variant="executive" 
        interactive 
        vip 
        glow 
        shimmer 
        data-testid="combined-card"
      >
        Combined Effects
      </LuxuryCard>
    )

    const card = screen.getByTestId('combined-card')
    expect(card).toHaveClass('bg-jetBlack/20')
    expect(card).toHaveClass('cursor-pointer')
    expect(card).toHaveClass('ring-champagneGold/30')
  })

  it('forwards custom className and other props', () => {
    render(
      <LuxuryCard 
        className="custom-class" 
        data-custom="test-value"
        data-testid="custom-card"
      >
        Custom Content
      </LuxuryCard>
    )

    const card = screen.getByTestId('custom-card')
    expect(card).toHaveClass('custom-class')
    expect(card).toHaveAttribute('data-custom', 'test-value')
  })
})

describe('ExecutiveStatCard Component', () => {
  it('renders executive stat card with private-jet styling', () => {
    render(
      <ExecutiveStatCard
        value="15h"
        label="Time Saved Weekly"
        icon={Crown}
      />
    )

    expect(screen.getByText('15h')).toBeInTheDocument()
    expect(screen.getByText('Time Saved Weekly')).toBeInTheDocument()
  })

  it('displays icon with champagne gold color', () => {
    render(
      <ExecutiveStatCard
        value="96%"
        label="AI Accuracy"
        icon={Crown}
      />
    )

    const iconContainer = screen.getByText('96%').parentElement?.querySelector('[class*="text-champagneGold"]')
    expect(iconContainer).toBeInTheDocument()
  })

  it('shows positive trend indicator with proper styling', () => {
    render(
      <ExecutiveStatCard
        value="$2M"
        label="Revenue Impact"
        icon={TrendingUp}
        trend={{ value: 15, positive: true }}
      />
    )

    expect(screen.getByText('↑ 15%')).toBeInTheDocument()
    const trendElement = screen.getByText('↑ 15%')
    expect(trendElement).toHaveClass('bg-green-100')
    expect(trendElement).toHaveClass('text-green-700')
  })

  it('shows negative trend indicator with appropriate styling', () => {
    render(
      <ExecutiveStatCard
        value="45m"
        label="Response Time"
        trend={{ value: 8, positive: false }}
      />
    )

    expect(screen.getByText('↓ 8%')).toBeInTheDocument()
    const trendElement = screen.getByText('↓ 8%')
    expect(trendElement).toHaveClass('bg-red-100')
    expect(trendElement).toHaveClass('text-red-700')
  })

  it('applies luxury executive styling to container', () => {
    const { container } = render(
      <ExecutiveStatCard
        value="24/7"
        label="Availability"
      />
    )

    // Check for executive styling classes
    const cardElement = container.querySelector('[class*="backdrop-blur"]')
    expect(cardElement).toBeInTheDocument()
  })

  it('includes hover indicator with champagne gradient', () => {
    const { container } = render(
      <ExecutiveStatCard
        value="100%"
        label="Uptime"
        icon={Crown}
      />
    )

    const hoverIndicator = container.querySelector('[class*="from-midnightBlue"]')
    expect(hoverIndicator).toBeInTheDocument()
  })
})

describe('LuxuryTestimonialCard Component', () => {
  const testimonialProps = {
    quote: 'Napoleon AI transformed our executive communication strategy',
    author: 'John Smith',
    role: 'CEO',
    company: 'Fortune 500 Corp',
    rating: 5,
  }

  it('renders testimonial with luxury styling', () => {
    render(<LuxuryTestimonialCard {...testimonialProps} />)

    expect(screen.getByText(testimonialProps.quote, { exact: false })).toBeInTheDocument()
    expect(screen.getByText(testimonialProps.author)).toBeInTheDocument()
    expect(screen.getByText(testimonialProps.role)).toBeInTheDocument()
    expect(screen.getByText(testimonialProps.company)).toBeInTheDocument()
  })

  it('displays 5-star rating with champagne gold stars', () => {
    render(<LuxuryTestimonialCard {...testimonialProps} />)

    const stars = screen.getAllByText('★')
    expect(stars).toHaveLength(5)
    
    stars.forEach(star => {
      expect(star).toHaveClass('text-champagneGold')
    })
  })

  it('displays partial rating correctly', () => {
    render(<LuxuryTestimonialCard {...testimonialProps} rating={3} />)

    const stars = screen.getAllByText('★')
    expect(stars).toHaveLength(5)
    
    // First 3 stars should be filled, last 2 should be empty
    stars.slice(0, 3).forEach(star => {
      expect(star).toHaveClass('fill-current')
    })
    
    stars.slice(3).forEach(star => {
      expect(star).toHaveClass('fill-transparent')
    })
  })

  it('formats quote with proper quotation marks', () => {
    render(<LuxuryTestimonialCard {...testimonialProps} />)

    const quote = screen.getByText(`"${testimonialProps.quote}"`)
    expect(quote).toBeInTheDocument()
    expect(quote.tagName).toBe('BLOCKQUOTE')
    expect(quote).toHaveClass('italic')
  })

  it('applies luxury typography and color scheme', () => {
    render(<LuxuryTestimonialCard {...testimonialProps} />)

    const author = screen.getByText(testimonialProps.author)
    expect(author).toHaveClass('text-warmIvory')
    expect(author).toHaveClass('font-semibold')

    const role = screen.getByText(testimonialProps.role)
    expect(role).toHaveClass('text-champagneGold')

    const company = screen.getByText(testimonialProps.company)
    expect(company).toHaveClass('text-platinumSilver')
  })

  it('uses gradient variant for luxury testimonial background', () => {
    const { container } = render(<LuxuryTestimonialCard {...testimonialProps} />)

    const cardElement = container.querySelector('[class*="bg-gradient-to-br"]')
    expect(cardElement).toBeInTheDocument()
  })

  it('includes interactive effects for testimonial card', () => {
    const { container } = render(<LuxuryTestimonialCard {...testimonialProps} />)

    const cardElement = container.querySelector('[class*="cursor-pointer"]')
    expect(cardElement).toBeInTheDocument()
  })

  it('handles animation delay prop', () => {
    render(<LuxuryTestimonialCard {...testimonialProps} delay={0.5} />)

    // Component should render without errors with delay prop
    expect(screen.getByText(testimonialProps.author)).toBeInTheDocument()
  })
})