import { render, screen, fireEvent } from '@testing-library/react'
import { Crown } from 'lucide-react'
import SelectableCard from '../SelectableCard'

// Mock framer-motion to avoid test complexity
jest.mock('framer-motion', () => ({
  motion: {
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

describe('SelectableCard', () => {
  const defaultProps = {
    icon: <Crown data-testid="crown-icon" />,
    title: 'CEO',
    description: 'Chief Executive Officer',
    selected: false,
    onClick: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders with correct content', () => {
    render(<SelectableCard {...defaultProps} />)
    
    expect(screen.getByTestId('crown-icon')).toBeInTheDocument()
    expect(screen.getByText('CEO')).toBeInTheDocument()
    expect(screen.getByText('Chief Executive Officer')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    render(<SelectableCard {...defaultProps} />)
    
    fireEvent.click(screen.getByRole('button'))
    expect(defaultProps.onClick).toHaveBeenCalledTimes(1)
  })

  it('applies selected styles when selected', () => {
    render(<SelectableCard {...defaultProps} selected={true} />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('border-gold', 'bg-gold-50')
  })

  it('applies hover styles when not selected', () => {
    render(<SelectableCard {...defaultProps} />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('border-gray-200', 'hover:border-gold-300')
  })

  it('shows selection indicator when selected', () => {
    render(<SelectableCard {...defaultProps} selected={true} />)
    
    // Check for CheckCircle icon in selection indicator
    expect(screen.getByRole('button')).toContainHTML('circle-check-big')
  })

  it('does not show selection indicator when not selected', () => {
    render(<SelectableCard {...defaultProps} selected={false} />)
    
    // Should not contain CheckCircle when not selected
    expect(screen.getByRole('button')).not.toContainHTML('circle-check-big')
  })

  it('handles disabled state', () => {
    const onClick = jest.fn()
    render(<SelectableCard {...defaultProps} disabled={true} onClick={onClick} />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('opacity-50', 'cursor-not-allowed')
    
    fireEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('applies compact variant styling', () => {
    render(<SelectableCard {...defaultProps} variant="compact" />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('p-3')
  })

  it('applies large variant styling', () => {
    render(<SelectableCard {...defaultProps} variant="large" />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('p-6')
  })

  it('applies custom className', () => {
    render(<SelectableCard {...defaultProps} className="custom-class" />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })

  it('applies correct icon container size for compact variant', () => {
    render(<SelectableCard {...defaultProps} variant="compact" />)
    
    // Find the icon container div
    const iconContainer = screen.getByRole('button').querySelector('.w-10.h-10')
    expect(iconContainer).toBeInTheDocument()
  })

  it('applies correct font sizes for variants', () => {
    const { rerender } = render(<SelectableCard {...defaultProps} variant="large" />)
    
    let titleElement = screen.getByText('CEO')
    expect(titleElement).toHaveClass('text-lg')
    
    rerender(<SelectableCard {...defaultProps} variant="compact" />)
    titleElement = screen.getByText('CEO')
    expect(titleElement).toHaveClass('text-sm')
    
    rerender(<SelectableCard {...defaultProps} variant="default" />)
    titleElement = screen.getByText('CEO')
    expect(titleElement).toHaveClass('text-base')
  })

  it('animates icon background color based on selection', () => {
    const { rerender } = render(<SelectableCard {...defaultProps} selected={false} />)
    
    // Icon container should have default background initially
    let iconContainer = screen.getByRole('button').querySelector('.w-12.h-12')
    expect(iconContainer).toBeInTheDocument()
    
    rerender(<SelectableCard {...defaultProps} selected={true} />)
    
    // Icon container should still be present when selected
    iconContainer = screen.getByRole('button').querySelector('.w-12.h-12')
    expect(iconContainer).toBeInTheDocument()
  })

  it('supports keyboard accessibility', () => {
    render(<SelectableCard {...defaultProps} />)
    
    const button = screen.getByRole('button')
    expect(button).toBeVisible()
    expect(button).not.toBeDisabled()
    
    // Button should be focusable
    button.focus()
    expect(button).toHaveFocus()
  })
})