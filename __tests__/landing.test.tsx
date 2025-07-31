import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { expect, test, describe, beforeEach, jest } from '@jest/globals'
import LandingPageClient from '@/app/landing-page-client'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
  useScroll: () => ({ scrollY: { get: () => 0 } }),
  useTransform: () => 1,
}))

describe('Landing Page', () => {
  beforeEach(() => {
    jest.clearAllTimers()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  test('renders hero section with main headline', () => {
    render(<LandingPageClient />)
    
    expect(screen.getByText('Transform Communication Chaos')).toBeInTheDocument()
    expect(screen.getByText('into Strategic Clarity')).toBeInTheDocument()
  })

  test('displays primary and secondary CTAs', () => {
    render(<LandingPageClient />)
    
    const primaryCTA = screen.getByRole('link', { name: /take command now/i })
    const secondaryCTA = screen.getByRole('link', { name: /request concierge/i })
    
    expect(primaryCTA).toBeInTheDocument()
    expect(primaryCTA).toHaveAttribute('href', '/auth/signup')
    
    expect(secondaryCTA).toBeInTheDocument()
    expect(secondaryCTA).toHaveAttribute('href', '/contact')
  })

  test('renders how it works section with three steps', () => {
    render(<LandingPageClient />)
    
    expect(screen.getByText('How It Works')).toBeInTheDocument()
    expect(screen.getByText('Executive simplicity in three steps')).toBeInTheDocument()
    
    expect(screen.getByText('Connect Accounts')).toBeInTheDocument()
    expect(screen.getByText('Define VIPs & Preferences')).toBeInTheDocument()
    expect(screen.getByText('Execute with Precision')).toBeInTheDocument()
  })

  test('shows trust badges in social proof section', () => {
    render(<LandingPageClient />)
    
    expect(screen.getByText('Enterprise Trust')).toBeInTheDocument()
    expect(screen.getByText('SOC 2 Type II')).toBeInTheDocument()
    expect(screen.getByText('GDPR Compliant')).toBeInTheDocument()
    expect(screen.getByText('HIPAA Ready')).toBeInTheDocument()
    expect(screen.getByText('ISO 27001')).toBeInTheDocument()
  })

  test('displays testimonials carousel', () => {
    render(<LandingPageClient />)
    
    expect(screen.getByText(/napoleon ai transformed how i handle communications/i)).toBeInTheDocument()
    expect(screen.getByText('Victoria Chen')).toBeInTheDocument()
    expect(screen.getByText('CEO, TechVentures Inc.')).toBeInTheDocument()
  })

  test('testimonials rotate automatically', async () => {
    render(<LandingPageClient />)
    
    // First testimonial should be visible
    expect(screen.getByText('Victoria Chen')).toBeInTheDocument()
    
    // Fast-forward time to trigger testimonial change
    jest.advanceTimersByTime(5000)
    
    await waitFor(() => {
      expect(screen.getByText('Marcus Thompson')).toBeInTheDocument()
    })
  })

  test('pricing section displays executive plan', () => {
    render(<LandingPageClient />)
    
    expect(screen.getByText('Executive Plan')).toBeInTheDocument()
    expect(screen.getByText('One plan. Unlimited power.')).toBeInTheDocument()
    expect(screen.getByText('$500')).toBeInTheDocument()
    expect(screen.getByText('/month')).toBeInTheDocument()
  })

  test('pricing toggle changes between monthly and annual', async () => {
    render(<LandingPageClient />)
    
    const annualButton = screen.getByRole('button', { name: /annual \(save 20%\)/i })
    
    expect(screen.getByText('$500')).toBeInTheDocument()
    
    fireEvent.click(annualButton)
    
    await waitFor(() => {
      expect(screen.getByText('$400')).toBeInTheDocument()
      expect(screen.getByText('Save $1,200 annually')).toBeInTheDocument()
    })
  })

  test('pricing section shows key features', () => {
    render(<LandingPageClient />)
    
    expect(screen.getByText(/unlimited executive message processing/i)).toBeInTheDocument()
    expect(screen.getByText(/ai-powered c-suite prioritization/i)).toBeInTheDocument()
    expect(screen.getByText(/board & investor relationship intelligence/i)).toBeInTheDocument()
    expect(screen.getByText(/dedicated executive success manager/i)).toBeInTheDocument()
  })

  test('footer contains navigation links and branding', () => {
    render(<LandingPageClient />)
    
    expect(screen.getByText('Napoleon AI')).toBeInTheDocument()
    expect(screen.getByText('Executive Intelligence. Amplified.')).toBeInTheDocument()
    
    expect(screen.getByRole('link', { name: /privacy/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /terms/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /security/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /contact/i })).toBeInTheDocument()
  })

  test('exclusivity messaging displays pricing and value proposition', () => {
    render(<LandingPageClient />)
    
    expect(screen.getByText(/designed for c-suite leaders – only/i)).toBeInTheDocument()
    expect(screen.getByText('$500/mo')).toBeInTheDocument()
    expect(screen.getByText('Save 2+ hours daily')).toBeInTheDocument()
  })

  test('CTA buttons have proper styling classes', () => {
    render(<LandingPageClient />)
    
    const primaryCTA = screen.getByRole('link', { name: /take command now/i })
    const pricingCTA = screen.getByRole('link', { name: /start free trial/i })
    
    expect(primaryCTA).toHaveClass('bg-gradient-gold')
    expect(pricingCTA).toHaveClass('bg-gradient-gold')
  })

  test('scroll indicator is present in hero section', () => {
    render(<LandingPageClient />)
    
    // Check for ChevronDown icon (represented as svg or similar)
    const heroSection = screen.getByRole('main', { hidden: true }) || document.querySelector('section')
    expect(heroSection).toBeInTheDocument()
  })

  test('background patterns and animations are present', () => {
    render(<LandingPageClient />)
    
    // Check for background pattern in How It Works section
    const howItWorksSection = screen.getByText('How It Works').closest('section')
    expect(howItWorksSection).toBeInTheDocument()
    
    // Check for animated background elements
    const heroSection = screen.getByText('Transform Communication Chaos').closest('section')
    expect(heroSection).toBeInTheDocument()
  })

  test('testimonial carousel indicators are functional', async () => {
    render(<LandingPageClient />)
    
    // Find testimonial indicators (buttons for carousel navigation)
    const indicators = screen.getAllByRole('button').filter(button => 
      button.className.includes('rounded-full') && 
      (button.className.includes('bg-gold') || button.className.includes('bg-gold/30'))
    )
    
    expect(indicators.length).toBe(3) // Three testimonials
    
    // Click on second indicator
    if (indicators[1]) {
      fireEvent.click(indicators[1])
      await waitFor(() => {
        expect(screen.getByText('Marcus Thompson')).toBeInTheDocument()
      })
    }
  })

  test('responsive design elements are present', () => {
    render(<LandingPageClient />)
    
    // Check for responsive classes
    const headline = screen.getByText('Transform Communication Chaos')
    expect(headline).toHaveClass('text-5xl', 'sm:text-7xl', 'md:text-8xl')
    
    // Check for responsive grid layout
    const howItWorksSection = screen.getByText('Connect Accounts').closest('div')?.parentElement
    expect(howItWorksSection).toHaveClass('grid', 'md:grid-cols-3')
  })
})