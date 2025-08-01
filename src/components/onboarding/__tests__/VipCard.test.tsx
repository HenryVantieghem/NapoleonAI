import { render, screen, fireEvent } from '@testing-library/react'
import VipCard from '../VipCard'

// Mock framer-motion to avoid test complexity
jest.mock('framer-motion', () => ({
  motion: {
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

describe('VipCard', () => {
  const mockContact = {
    email: 'john.doe@company.com',
    name: 'John Doe',
    relationshipType: 'Board Member' as const,
    source: 'suggested' as const,
  }

  const defaultProps = {
    contact: mockContact,
    selected: false,
    onToggle: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders contact information correctly', () => {
    render(<VipCard {...defaultProps} />)
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Board Member')).toBeInTheDocument()
    expect(screen.getByText('john.doe@company.com')).toBeInTheDocument()
  })

  it('displays contact initial', () => {
    render(<VipCard {...defaultProps} />)
    
    expect(screen.getByText('J')).toBeInTheDocument()
  })

  it('calls onToggle when clicked', () => {
    render(<VipCard {...defaultProps} />)
    
    const card = screen.getByRole('button')
    fireEvent.click(card)
    expect(defaultProps.onToggle).toHaveBeenCalledTimes(1)
  })

  it('shows selected state correctly', () => {
    render(<VipCard {...defaultProps} selected={true} />)
    
    // Should show selected styling
    const card = screen.getByRole('button')
    expect(card).toHaveClass('border-gold')
  })

  it('shows unselected state correctly', () => {
    render(<VipCard {...defaultProps} selected={false} />)
    
    // Should show unselected styling
    const card = screen.getByRole('button')
    expect(card).toHaveClass('border-gray-200')
  })

  it('shows crown icon for high priority contacts', () => {
    const highPriorityContact = { ...mockContact, priority: 9 }
    render(<VipCard {...defaultProps} contact={highPriorityContact} />)
    
    // Crown icon should be present for high priority contacts
    expect(screen.getByTestId('lucide-crown')).toBeInTheDocument()
  })

  it('shows check icon when selected', () => {
    render(<VipCard {...defaultProps} selected={true} />)
    
    expect(screen.getByTestId('lucide-check')).toBeInTheDocument()
  })

  it('does not show check icon when not selected', () => {
    render(<VipCard {...defaultProps} selected={false} />)
    
    expect(screen.queryByTestId('lucide-check')).not.toBeInTheDocument()
  })

  describe('Relationship Types', () => {
    const relationshipTypes = [
      'Board Member',
      'Investor', 
      'Executive',
      'Client',
      'Partner',
      'VIP',
      'Other'
    ] as const

    relationshipTypes.forEach(type => {
      it(`renders ${type} relationship type correctly`, () => {
        const contact = { ...mockContact, relationshipType: type }
        render(<VipCard {...defaultProps} contact={contact} />)
        
        expect(screen.getByText(type)).toBeInTheDocument()
      })
    })
  })

  describe('Source Types', () => {
    const sourceTypes = ['suggested', 'manual', 'imported'] as const

    sourceTypes.forEach(source => {
      it(`handles ${source} source correctly`, () => {
        const contact = { ...mockContact, source }
        render(<VipCard {...defaultProps} contact={contact} />)
        
        // Should render without errors
        expect(screen.getByText('John Doe')).toBeInTheDocument()
      })
    })
  })

  it('supports keyboard accessibility', () => {
    render(<VipCard {...defaultProps} />)
    
    const card = screen.getByRole('button')
    expect(card).toBeVisible()
    expect(card).not.toBeDisabled()
    
    // Card should be focusable
    card.focus()
    expect(card).toHaveFocus()
  })
})