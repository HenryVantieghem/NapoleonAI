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
    relationshipType: 'Board Member',
    source: 'suggested' as const,
  }

  const defaultProps = {
    contact: mockContact,
    selected: false,
    onClick: jest.fn(),
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

  it('generates correct initials from name', () => {
    render(<VipCard {...defaultProps} />)
    
    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('handles single name correctly', () => {
    const singleNameContact = { ...mockContact, name: 'Madonna' }
    render(<VipCard {...defaultProps} contact={singleNameContact} />)
    
    expect(screen.getByText('M')).toBeInTheDocument()
  })

  it('limits initials to 2 characters', () => {
    const longNameContact = { ...mockContact, name: 'John Michael Smith Doe' }
    render(<VipCard {...defaultProps} contact={longNameContact} />)
    
    expect(screen.getByText('JM')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    render(<VipCard {...defaultProps} />)
    
    fireEvent.click(screen.getByRole('button'))
    expect(defaultProps.onClick).toHaveBeenCalledTimes(1)
  })

  it('applies selected styles when selected', () => {
    render(<VipCard {...defaultProps} selected={true} />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('border-gold', 'bg-gold-50')
  })

  it('shows selection indicator when selected', () => {
    render(<VipCard {...defaultProps} selected={true} />)
    
    // Selection indicator should be visible
    const indicator = screen.getByRole('button').querySelector('.absolute.top-3.right-3')
    expect(indicator).toBeInTheDocument()
  })

  it('does not show selection indicator when not selected', () => {
    render(<VipCard {...defaultProps} selected={false} />)
    
    // Selection indicator should not be visible
    const indicator = screen.getByRole('button').querySelector('.absolute.top-3.right-3')
    expect(indicator).not.toBeInTheDocument()
  })

  describe('Relationship Type Icons', () => {
    it('shows Crown icon for Board Member', () => {
      render(<VipCard {...defaultProps} />)
      
      // Check for purple gradient background (Board Member color)
      const iconContainer = screen.getByRole('button').querySelector('.from-purple-500')
      expect(iconContainer).toBeInTheDocument()
    })

    it('shows Star icon for Investor', () => {
      const investorContact = { ...mockContact, relationshipType: 'Investor' }
      render(<VipCard {...defaultProps} contact={investorContact} />)
      
      // Check for emerald gradient background (Investor color)
      const iconContainer = screen.getByRole('button').querySelector('.from-emerald-500')
      expect(iconContainer).toBeInTheDocument()
    })

    it('shows Building icon for Executive', () => {
      const executiveContact = { ...mockContact, relationshipType: 'Executive' }
      render(<VipCard {...defaultProps} contact={executiveContact} />)
      
      // Check for navy gradient background (Executive color)
      const iconContainer = screen.getByRole('button').querySelector('.from-navy-500')
      expect(iconContainer).toBeInTheDocument()
    })

    it('shows Mail icon for Client', () => {
      const clientContact = { ...mockContact, relationshipType: 'Client' }
      render(<VipCard {...defaultProps} contact={clientContact} />)
      
      // Check for blue gradient background (Client color)
      const iconContainer = screen.getByRole('button').querySelector('.from-blue-500')
      expect(iconContainer).toBeInTheDocument()
    })

    it('shows Building icon for Partner', () => {
      const partnerContact = { ...mockContact, relationshipType: 'Partner' }
      render(<VipCard {...defaultProps} contact={partnerContact} />)
      
      // Check for gold gradient background (Partner color)
      const iconContainer = screen.getByRole('button').querySelector('.from-gold-500')
      expect(iconContainer).toBeInTheDocument()
    })

    it('falls back to Star icon for unknown relationship type', () => {
      const unknownContact = { ...mockContact, relationshipType: 'Unknown Type' }
      render(<VipCard {...defaultProps} contact={unknownContact} />)
      
      // Should fall back to gray gradient (Other color)
      const iconContainer = screen.getByRole('button').querySelector('.from-gray-500')
      expect(iconContainer).toBeInTheDocument()
    })
  })

  describe('Source Indicators', () => {
    it('shows AI Suggested badge for suggested contacts', () => {
      render(<VipCard {...defaultProps} showSource={true} />)
      
      expect(screen.getByText('AI Suggested')).toBeInTheDocument()
      expect(screen.getByText('AI Suggested')).toHaveClass('bg-blue-100', 'text-blue-700')
    })

    it('shows Imported badge for imported contacts', () => {
      const importedContact = { ...mockContact, source: 'imported' as const }
      render(<VipCard {...defaultProps} contact={importedContact} showSource={true} />)
      
      expect(screen.getByText('Imported')).toBeInTheDocument()
      expect(screen.getByText('Imported')).toHaveClass('bg-emerald-100', 'text-emerald-700')
    })

    it('shows Manual badge for manually added contacts', () => {
      const manualContact = { ...mockContact, source: 'manual' as const }
      render(<VipCard {...defaultProps} contact={manualContact} showSource={true} />)
      
      expect(screen.getByText('Manual')).toBeInTheDocument()
      expect(screen.getByText('Manual')).toHaveClass('bg-gold-100', 'text-gold-700')
    })

    it('does not show source indicator when showSource is false', () => {
      render(<VipCard {...defaultProps} showSource={false} />)
      
      expect(screen.queryByText('AI Suggested')).not.toBeInTheDocument()
    })

    it('does not show source indicator when contact has no source', () => {
      const noSourceContact = { ...mockContact, source: undefined }
      render(<VipCard {...defaultProps} contact={noSourceContact} showSource={true} />)
      
      expect(screen.queryByText('AI Suggested')).not.toBeInTheDocument()
      expect(screen.queryByText('Imported')).not.toBeInTheDocument()
      expect(screen.queryByText('Manual')).not.toBeInTheDocument()
    })
  })

  it('applies compact variant padding', () => {
    render(<VipCard {...defaultProps} variant="compact" />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('p-3')
  })

  it('applies default variant padding', () => {
    render(<VipCard {...defaultProps} variant="default" />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('p-4')
  })

  it('truncates long text content', () => {
    const longContact = {
      ...mockContact,
      name: 'Very Long Name That Should Be Truncated',
      email: 'very.long.email.address.that.should.be.truncated@company.com'
    }
    
    render(<VipCard {...defaultProps} contact={longContact} />)
    
    const nameElement = screen.getByText(longContact.name)
    const emailElement = screen.getByText(longContact.email)
    
    expect(nameElement).toHaveClass('truncate')
    expect(emailElement).toHaveClass('truncate')
  })

  it('supports keyboard accessibility', () => {
    render(<VipCard {...defaultProps} />)
    
    const button = screen.getByRole('button')
    expect(button).toBeVisible()
    expect(button).not.toBeDisabled()
    
    // Button should be focusable
    button.focus()
    expect(button).toHaveFocus()
  })
})