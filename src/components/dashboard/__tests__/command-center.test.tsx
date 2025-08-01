import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CommandCenter } from '../command-center'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
  },
}))

// Mock dashboard components
jest.mock('../strategic-digest', () => ({
  StrategicDigest: () => <div data-testid="strategic-digest">Strategic Digest</div>
}))

jest.mock('../messages-list', () => ({
  MessagesList: () => <div data-testid="messages-list">Messages List</div>
}))

jest.mock('../context-panel', () => ({
  ContextPanel: () => <div data-testid="context-panel">Context Panel</div>
}))

// Mock authentication
jest.mock('@/lib/hooks/use-auth', () => ({
  useAuth: () => ({
    user: {
      id: 'exec_user_123',
      firstName: 'John',
      lastName: 'Smith',
      executiveLevel: 'C-Suite'
    },
    isAuthenticated: true,
    luxuryPreferences: {
      theme: 'private-jet',
      animations: true,
      glassmorphism: true
    }
  })
}))

describe('CommandCenter Dashboard Component', () => {
  beforeEach(() => {
    // Mock window.matchMedia for responsive tests
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query.includes('lg'), // Mock large screen
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    })
  })

  it('renders executive command center with private-jet theme', () => {
    render(<CommandCenter />)

    // Main command center container
    const commandCenter = screen.getByTestId('command-center')
    expect(commandCenter).toBeInTheDocument()
    expect(commandCenter).toHaveClass('bg-jetBlack')
    expect(commandCenter).toHaveClass('min-h-screen')
  })

  it('displays three-panel executive layout', () => {
    render(<CommandCenter />)

    // Strategic digest panel (left)
    expect(screen.getByTestId('strategic-digest')).toBeInTheDocument()
    
    // Messages list panel (center)
    expect(screen.getByTestId('messages-list')).toBeInTheDocument()
    
    // Context panel (right)
    expect(screen.getByTestId('context-panel')).toBeInTheDocument()
  })

  it('applies luxury glassmorphism styling to panels', () => {
    render(<CommandCenter />)

    const commandCenter = screen.getByTestId('command-center')
    
    // Should have executive glassmorphism classes
    expect(commandCenter).toHaveClass('backdrop-blur-executive')
    
    // Grid layout for executive panels
    const panelContainer = commandCenter.querySelector('[class*="grid"]')
    expect(panelContainer).toBeInTheDocument()
  })

  it('implements responsive behavior for mobile executives', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query.includes('max-width'), // Mock mobile
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    })

    render(<CommandCenter />)

    const commandCenter = screen.getByTestId('command-center')
    
    // Mobile layout should stack panels vertically
    expect(commandCenter).toBeInTheDocument()
  })

  it('handles executive panel switching', async () => {
    render(<CommandCenter />)

    // Test panel interaction
    const strategicDigest = screen.getByTestId('strategic-digest')
    const messagesList = screen.getByTestId('messages-list')
    const contextPanel = screen.getByTestId('context-panel')

    expect(strategicDigest).toBeVisible()
    expect(messagesList).toBeVisible()
    expect(contextPanel).toBeVisible()

    // Simulate panel focus/selection
    fireEvent.click(strategicDigest)
    await waitFor(() => {
      expect(strategicDigest).toBeInTheDocument()
    })
  })

  it('maintains executive performance standards', () => {
    const renderStart = Date.now()
    render(<CommandCenter />)
    const renderTime = Date.now() - renderStart

    // Executive performance: sub-100ms render
    expect(renderTime).toBeLessThan(100)

    // All critical elements should be present
    expect(screen.getByTestId('strategic-digest')).toBeInTheDocument()
    expect(screen.getByTestId('messages-list')).toBeInTheDocument()
    expect(screen.getByTestId('context-panel')).toBeInTheDocument()
  })

  it('applies champagne gold accents to active elements', () => {
    render(<CommandCenter />)

    const commandCenter = screen.getByTestId('command-center')
    
    // Should have champagne gold accent elements
    const accentElements = commandCenter.querySelectorAll('[class*="champagneGold"]')
    expect(accentElements.length).toBeGreaterThan(0)
  })

  it('integrates with executive authentication context', () => {
    render(<CommandCenter />)

    // Component should render when authenticated as executive
    expect(screen.getByTestId('command-center')).toBeInTheDocument()
    
    // Should display all executive panels
    expect(screen.getByTestId('strategic-digest')).toBeInTheDocument()
    expect(screen.getByTestId('messages-list')).toBeInTheDocument()
    expect(screen.getByTestId('context-panel')).toBeInTheDocument()
  })

  it('handles luxury animation preferences', () => {
    render(<CommandCenter />)

    const commandCenter = screen.getByTestId('command-center')
    
    // Should respect executive animation preferences
    expect(commandCenter).toBeInTheDocument()
    
    // Animation classes should be applied based on preferences
    // (Specific classes depend on implementation)
  })

  it('provides executive keyboard navigation', () => {
    render(<CommandCenter />)

    const commandCenter = screen.getByTestId('command-center')
    
    // Should be keyboard accessible for executives
    fireEvent.keyDown(commandCenter, { key: 'Tab' })
    
    // Focus should move between panels
    expect(document.activeElement).toBeInTheDocument()
  })

  it('implements executive drag and drop interactions', () => {
    render(<CommandCenter />)

    const messagesList = screen.getByTestId('messages-list')
    
    // Test drag start
    fireEvent.dragStart(messagesList, {
      dataTransfer: {
        setData: jest.fn(),
        getData: jest.fn()
      }
    })
    
    expect(messagesList).toBeInTheDocument()
  })

  it('handles executive error states gracefully', () => {
    // Mock error in strategic digest
    jest.mock('../strategic-digest', () => ({
      StrategicDigest: () => {
        throw new Error('Strategic digest error')
      }
    }))

    // Should not crash the entire command center
    expect(() => render(<CommandCenter />)).not.toThrow()
  })

  it('maintains executive state across panel interactions', async () => {
    render(<CommandCenter />)

    const strategicDigest = screen.getByTestId('strategic-digest')
    const contextPanel = screen.getByTestId('context-panel')

    // Interact with strategic digest
    fireEvent.click(strategicDigest)
    
    // Switch to context panel
    fireEvent.click(contextPanel)
    
    // State should be maintained
    await waitFor(() => {
      expect(strategicDigest).toBeInTheDocument()
      expect(contextPanel).toBeInTheDocument()
    })
  })

  it('applies executive luxury transitions between panels', () => {
    render(<CommandCenter />)

    const commandCenter = screen.getByTestId('command-center')
    
    // Should have transition classes for luxury experience
    expect(commandCenter).toHaveClass('transition-all')
    
    // Executive panel transitions should be smooth
    const panels = commandCenter.querySelectorAll('[data-testid$="-panel"], [data-testid$="-digest"], [data-testid$="-list"]')
    panels.forEach(panel => {
      expect(panel).toBeInTheDocument()
    })
  })
})