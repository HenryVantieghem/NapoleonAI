import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { StrategicDigest } from '../strategic-digest'
import '@testing-library/jest-dom'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, onClick, ...props }: any) => (
      <button onClick={onClick} {...props}>{children}</button>
    )
  }
}))

describe('StrategicDigest', () => {
  const mockProps = {
    onMessageSelect: jest.fn(),
    selectedMessage: null
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders executive command center header', () => {
    render(<StrategicDigest {...mockProps} />)
    expect(screen.getByText('Executive Command Center')).toBeInTheDocument()
  })

  it('displays executive summary metrics', () => {
    render(<StrategicDigest {...mockProps} />)
    
    // Check for metrics
    expect(screen.getByText('8')).toBeInTheDocument() // Priority messages
    expect(screen.getByText('5')).toBeInTheDocument() // Action items
    expect(screen.getByText('3')).toBeInTheDocument() // Meetings
    expect(screen.getByText('$2.4M')).toBeInTheDocument() // Revenue
  })

  it('shows critical decisions section', () => {
    render(<StrategicDigest {...mockProps} />)
    expect(screen.getByText('Critical Decisions Required')).toBeInTheDocument()
    expect(screen.getByText('3 pending')).toBeInTheDocument()
  })

  it('displays priority messages with correct styling', () => {
    render(<StrategicDigest {...mockProps} />)
    
    // Check for priority message
    expect(screen.getByText('Q4 Board Meeting - Strategic Decisions Required')).toBeInTheDocument()
    expect(screen.getByText('from Sarah Chen, Chief Strategy Officer')).toBeInTheDocument()
  })

  it('handles message selection', () => {
    render(<StrategicDigest {...mockProps} />)
    
    // Click on a priority message
    const messageElement = screen.getByText('Q4 Board Meeting - Strategic Decisions Required')
    fireEvent.click(messageElement.closest('[role="button"], button, [onClick]') || messageElement)
    
    expect(mockProps.onMessageSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        id: '1',
        subject: 'Q4 Board Meeting - Strategic Decisions Required'
      })
    )
  })

  it('shows AI insights section', () => {
    render(<StrategicDigest {...mockProps} />)
    expect(screen.getByText('AI Insights')).toBeInTheDocument()
    expect(screen.getByText('Communication Pattern Alert')).toBeInTheDocument()
  })

  it('displays today\'s executive schedule', () => {
    render(<StrategicDigest {...mockProps} />)
    expect(screen.getByText('Today\'s Executive Schedule')).toBeInTheDocument()
    expect(screen.getByText('Strategic Planning Review')).toBeInTheDocument()
    expect(screen.getByText('10:00 AM')).toBeInTheDocument()
  })

  it('applies correct priority colors', () => {
    render(<StrategicDigest {...mockProps} />)
    
    // Check for priority indicators
    const criticalElements = screen.getAllByText('CRITICAL')
    expect(criticalElements.length).toBeGreaterThan(0)
    
    const highElements = screen.getAllByText('HIGH')
    expect(highElements.length).toBeGreaterThan(0)
  })

  it('shows business impact information', () => {
    render(<StrategicDigest {...mockProps} />)
    expect(screen.getByText(/High - \$50M investment decision/)).toBeInTheDocument()
    expect(screen.getByText(/Very High - \$100M acquisition/)).toBeInTheDocument()
  })

  it('displays time-sensitive information', () => {
    render(<StrategicDigest {...mockProps} />)
    expect(screen.getByText('4 hours')).toBeInTheDocument()
    expect(screen.getByText('2 days')).toBeInTheDocument()
    expect(screen.getByText('1 day')).toBeInTheDocument()
  })

  it('renders with private-jet color scheme', () => {
    const { container } = render(<StrategicDigest {...mockProps} />)
    
    // Check for private-jet color classes
    expect(container.querySelector('.from-warmIvory')).toBeInTheDocument()
    expect(container.querySelector('.text-champagneGold')).toBeInTheDocument()
  })
})