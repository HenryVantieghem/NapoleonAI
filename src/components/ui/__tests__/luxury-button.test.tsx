import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { LuxuryButton, ExecutiveCTA } from '../luxury-button'
import '@testing-library/jest-dom'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    button: React.forwardRef(({ children, onClick, className, ...props }: any, ref) => (
      <button ref={ref} onClick={onClick} className={className} {...props}>
        {children}
      </button>
    ))
  }
}))

describe('LuxuryButton', () => {
  it('renders with default props', () => {
    render(<LuxuryButton>Test Button</LuxuryButton>)
    expect(screen.getByRole('button')).toBeInTheDocument()
    expect(screen.getByText('Test Button')).toBeInTheDocument()
  })

  it('applies primary variant styles correctly', () => {
    render(<LuxuryButton variant="primary">Primary Button</LuxuryButton>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-gradient-to-r', 'from-midnightBlue', 'to-jetBlack')
  })

  it('applies luxury variant styles correctly', () => {
    render(<LuxuryButton variant="luxury">Luxury Button</LuxuryButton>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-gradient-to-br', 'from-jetBlack', 'via-midnightBlue')
  })

  it('shows loading state correctly', () => {
    render(<LuxuryButton loading>Loading Button</LuxuryButton>)
    expect(screen.getByText('Processing...')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<LuxuryButton onClick={handleClick}>Clickable Button</LuxuryButton>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies correct size classes', () => {
    render(<LuxuryButton size="xl">Large Button</LuxuryButton>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('px-8', 'py-4', 'text-xl')
  })

  it('shows crown icon when showCrown is true', () => {
    render(<LuxuryButton showCrown>Crown Button</LuxuryButton>)
    // Crown icon should be rendered
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('applies disabled state correctly', () => {
    render(<LuxuryButton disabled>Disabled Button</LuxuryButton>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed')
  })
})

describe('ExecutiveCTA', () => {
  it('renders executive CTA with luxury styling', () => {
    render(<ExecutiveCTA>Executive Action</ExecutiveCTA>)
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    expect(screen.getByText('Executive Action')).toBeInTheDocument()
  })

  it('has correct luxury variant and size', () => {
    render(<ExecutiveCTA>Executive CTA</ExecutiveCTA>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-gradient-to-br', 'from-jetBlack')
  })
})