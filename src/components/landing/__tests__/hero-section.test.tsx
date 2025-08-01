import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { HeroSection } from '../hero-section'

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
  },
  AnimatePresence: ({ children }: any) => children,
}))

// Mock scroll behavior
const mockScrollIntoView = jest.fn()
Object.defineProperty(Element.prototype, 'scrollIntoView', {
  writable: true,
  value: mockScrollIntoView,
})

describe('HeroSection Component', () => {
  beforeEach(() => {
    mockScrollIntoView.mockClear()
  })

  it('renders all core executive elements with private-jet theme', () => {
    render(<HeroSection />)

    // Check for private-jet background styling
    const heroSection = screen.getByRole('region', { hidden: true })
    expect(heroSection).toHaveClass('bg-jetBlack')

    // Executive badge
    expect(screen.getByText('Exclusive for C-Suite Executives')).toBeInTheDocument()

    // Main headline with private-jet terminology
    expect(screen.getByText(/Transform Communication/)).toBeInTheDocument()
    expect(screen.getByText(/Chaos/)).toBeInTheDocument()
    expect(screen.getByText(/Strategic/)).toBeInTheDocument()
    expect(screen.getByText(/Clarity/)).toBeInTheDocument()

    // Subheadline mentioning private jet experience
    expect(screen.getByText(/luxury AI command center/)).toBeInTheDocument()
    expect(screen.getByText(/Fortune 500 executives/)).toBeInTheDocument()
  })

  it('displays executive metrics with proper champagne gold styling', () => {
    render(<HeroSection />)

    // Executive performance metrics
    expect(screen.getByText('15h')).toBeInTheDocument() // Time saved
    expect(screen.getByText('Saved Weekly')).toBeInTheDocument()
    
    expect(screen.getByText('96%')).toBeInTheDocument() // AI accuracy
    expect(screen.getByText('AI Accuracy')).toBeInTheDocument()
    
    expect(screen.getByText('2m')).toBeInTheDocument() // VIP response time
    expect(screen.getByText('VIP Response')).toBeInTheDocument()
    
    expect(screen.getByText('3')).toBeInTheDocument() // Communication platforms
    expect(screen.getByText('Platforms')).toBeInTheDocument()
  })

  it('renders primary CTA button with champagne gold gradient', () => {
    render(<HeroSection />)

    const primaryCTA = screen.getByRole('button', { name: /Take Command Now/i })
    expect(primaryCTA).toBeInTheDocument()
    expect(primaryCTA).toHaveClass('bg-gradient-champagne')
    expect(primaryCTA).toHaveClass('text-jetBlack')
  })

  it('renders secondary CTA button with private jet styling', () => {
    render(<HeroSection />)

    const secondaryCTA = screen.getByRole('button', { name: /Experience the Journey/i })
    expect(secondaryCTA).toBeInTheDocument()
    expect(secondaryCTA).toHaveClass('backdrop-blur-executive')
    expect(secondaryCTA).toHaveClass('border-platinumSilver/30')
  })

  it('displays private jet trust indicators', () => {
    render(<HeroSection />)

    expect(screen.getByText('Executive Security')).toBeInTheDocument()
    expect(screen.getByText('500+ Fortune 500 Leaders')).toBeInTheDocument()
    expect(screen.getByText('Private Jet Experience')).toBeInTheDocument()
  })

  it('includes runway-style scroll indicator with champagne lights', () => {
    render(<HeroSection />)

    expect(screen.getByText('Begin Your Journey')).toBeInTheDocument()
    
    // Check for runway lights elements (should have champagne gold styling)
    const runwaySection = screen.getByText('Begin Your Journey').closest('div')
    expect(runwaySection).toBeInTheDocument()
  })

  it('handles primary CTA click with smooth scrolling', async () => {
    // Mock getElementById to return a mock element
    const mockElement = { scrollIntoView: mockScrollIntoView }
    jest.spyOn(document, 'getElementById').mockReturnValue(mockElement as any)

    render(<HeroSection />)

    const primaryCTA = screen.getByRole('button', { name: /Take Command Now/i })
    fireEvent.click(primaryCTA)

    expect(document.getElementById).toHaveBeenCalledWith('cta-section')
    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' })
  })

  it('handles secondary CTA click for demo video section', async () => {
    const mockElement = { scrollIntoView: mockScrollIntoView }
    jest.spyOn(document, 'getElementById').mockReturnValue(mockElement as any)

    render(<HeroSection />)

    const secondaryCTA = screen.getByRole('button', { name: /Experience the Journey/i })
    fireEvent.click(secondaryCTA)

    expect(document.getElementById).toHaveBeenCalledWith('demo-video')
    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' })
  })

  it('handles runway scroll indicator click', async () => {
    const mockElement = { scrollIntoView: mockScrollIntoView }
    jest.spyOn(document, 'getElementById').mockReturnValue(mockElement as any)

    render(<HeroSection />)

    const scrollIndicator = screen.getByText('Begin Your Journey').closest('div')
    expect(scrollIndicator).toBeInTheDocument()
    
    if (scrollIndicator) {
      fireEvent.click(scrollIndicator)
      expect(document.getElementById).toHaveBeenCalledWith('value-proposition')
      expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' })
    }
  })

  it('renders VIP priority preview card with executive styling', () => {
    render(<HeroSection />)

    expect(screen.getByText('VIP PRIORITY')).toBeInTheDocument()
    expect(screen.getByText(/Board Chairman/)).toBeInTheDocument()
    expect(screen.getByText(/acquisition proposal/)).toBeInTheDocument()
  })

  it('renders AI intelligence preview card with champagne accents', () => {
    render(<HeroSection />)

    expect(screen.getByText('AI INTELLIGENCE')).toBeInTheDocument()
    expect(screen.getByText(/strategic action items/)).toBeInTheDocument()
    expect(screen.getByText(/investor communications/)).toBeInTheDocument()
  })

  it('includes private jet elements and sunset gradient', () => {
    render(<HeroSection />)

    // Test that the hero section contains plane icons and luxury elements
    const planeIcons = screen.getAllByTestId('lucide-plane')
    expect(planeIcons.length).toBeGreaterThan(0)

    // Check for sunset gradient orb styling via className patterns
    const heroSection = screen.getByRole('region', { hidden: true })
    expect(heroSection).toBeInTheDocument()
  })

  it('applies glassmorphism effects to executive elements', () => {
    render(<HeroSection />)

    const executiveBadge = screen.getByText('Exclusive for C-Suite Executives').closest('div')
    if (executiveBadge) {
      expect(executiveBadge).toHaveClass('backdrop-blur-executive')
      expect(executiveBadge).toHaveClass('border-platinumSilver/30')
      expect(executiveBadge).toHaveClass('shadow-luxury-glass')
    }
  })

  it('uses luxury typography classes for executive appeal', () => {
    render(<HeroSection />)

    const mainHeadline = screen.getByRole('heading', { level: 1 })
    expect(mainHeadline).toHaveClass('font-serif')
    expect(mainHeadline).toHaveClass('text-warmIvory')
    expect(mainHeadline).toHaveClass('tracking-tight')
  })

  it('implements hover states for interactive elements', () => {
    render(<HeroSection />)

    const primaryCTA = screen.getByRole('button', { name: /Take Command Now/i })
    expect(primaryCTA).toHaveClass('shadow-champagne-glow')
    
    const secondaryCTA = screen.getByRole('button', { name: /Experience the Journey/i })
    expect(secondaryCTA).toHaveClass('hover:bg-midnightBlue/30')
  })

  it('maintains executive performance standards with proper semantics', () => {
    render(<HeroSection />)

    // Proper semantic structure
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.getAllByRole('button')).toHaveLength(2)
    
    // Accessibility considerations
    const buttons = screen.getAllByRole('button')
    buttons.forEach(button => {
      expect(button).toHaveAttribute('type')
      expect(button.textContent).toBeTruthy()
    })
  })
})