import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useUser } from '@clerk/nextjs'
import { useMessages } from '@/hooks/useMessages'
import DashboardPage from '@/app/dashboard/page'
import { CommandCenter } from '@/components/dashboard/command-center'
import { UnifiedInbox } from '@/components/dashboard/UnifiedInbox'
import { ContextPanel } from '@/components/dashboard/ContextPanel'

jest.mock('@clerk/nextjs')
jest.mock('@/hooks/useMessages')
jest.mock('next/navigation')

const mockMessages = [
  {
    id: '1',
    sender: {
      name: 'John Doe',
      email: 'john@company.com',
      avatar: 'https://ui-avatars.com/api/?name=John+Doe',
    },
    subject: 'Q4 Financial Report',
    content: 'Please review the attached Q4 financial report...',
    preview: 'Please review the attached Q4 financial report before the board meeting',
    aiSummary: 'Q4 financial report needs review before board meeting',
    priorityScore: 95,
    priority: 'high',
    isVip: true,
    isRead: false,
    isArchived: false,
    isSnoozed: false,
    source: 'Gmail',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    timeAgo: '5 minutes ago',
    needsAiSummary: false,
    tags: ['board', 'finance'],
  },
  {
    id: '2',
    sender: {
      name: 'Jane Smith',
      email: 'jane@company.com',
      avatar: 'https://ui-avatars.com/api/?name=Jane+Smith',
    },
    subject: 'Project Update',
    content: 'Here is the latest update on Project Alpha...',
    preview: 'Here is the latest update on Project Alpha',
    aiSummary: null,
    priorityScore: 60,
    priority: 'medium',
    isVip: false,
    isRead: true,
    isArchived: false,
    isSnoozed: false,
    source: 'Gmail',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    timeAgo: '1 hour ago',
    needsAiSummary: true,
    tags: ['project'],
  },
]

const mockMetrics = {
  total: 25,
  vip: 5,
  urgent: 3,
  unread: 12,
  today: 8,
  needsAiSummary: 4,
}

describe('Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useUser as jest.Mock).mockReturnValue({
      user: { id: '123', firstName: 'Test', lastName: 'User' },
    })
    ;(useMessages as jest.Mock).mockReturnValue({
      messages: mockMessages,
      filteredMessages: mockMessages,
      selectedMessage: null,
      loading: false,
      error: null,
      metrics: mockMetrics,
      refreshMessages: jest.fn(),
      searchMessages: jest.fn(),
      filterMessages: jest.fn(),
      selectMessage: jest.fn(),
      archiveMessage: jest.fn(),
      snoozeMessage: jest.fn(),
      markAsRead: jest.fn(),
      updatePriority: jest.fn(),
      createActionItem: jest.fn(),
      searchQuery: '',
      activeFilters: ['all'],
      searchResults: mockMessages,
    })
  })

  describe('Dashboard Page', () => {
    it('renders dashboard layout', async () => {
      render(<DashboardPage />)
      await waitFor(() => {
        expect(screen.getByText(/Command Center/i)).toBeInTheDocument()
      })
    })

    it('shows loading state initially', () => {
      ;(useMessages as jest.Mock).mockReturnValue({
        messages: [],
        loading: true,
        error: null,
        metrics: null,
      })
      render(<DashboardPage />)
      expect(screen.getByText(/Loading/i)).toBeInTheDocument()
    })
  })

  describe('Command Center', () => {
    it('renders three panels', () => {
      render(<CommandCenter />)
      expect(screen.getByText(/Strategic Digest/i)).toBeInTheDocument()
      expect(screen.getByText(/Unified Inbox/i)).toBeInTheDocument()
      expect(screen.getByText(/Context & Actions/i)).toBeInTheDocument()
    })

    it('displays metrics correctly', () => {
      render(<CommandCenter />)
      expect(screen.getByText('25')).toBeInTheDocument() // total messages
      expect(screen.getByText('5')).toBeInTheDocument() // VIP messages
      expect(screen.getByText('12')).toBeInTheDocument() // unread messages
    })
  })

  describe('Unified Inbox', () => {
    it('renders message list', () => {
      render(<UnifiedInbox />)
      expect(screen.getByText('Q4 Financial Report')).toBeInTheDocument()
      expect(screen.getByText('Project Update')).toBeInTheDocument()
    })

    it('shows VIP badge for VIP messages', () => {
      render(<UnifiedInbox />)
      const vipBadges = screen.getAllByText('VIP')
      expect(vipBadges).toHaveLength(1)
    })

    it('handles message selection', () => {
      const mockSelectMessage = jest.fn()
      ;(useMessages as jest.Mock).mockReturnValue({
        ...useMessages(),
        selectMessage: mockSelectMessage,
      })
      
      render(<UnifiedInbox />)
      fireEvent.click(screen.getByText('Q4 Financial Report'))
      expect(mockSelectMessage).toHaveBeenCalledWith('1')
    })

    it('displays search bar', () => {
      render(<UnifiedInbox />)
      expect(screen.getByPlaceholderText(/Search messages/i)).toBeInTheDocument()
    })

    it('shows filter buttons', () => {
      render(<UnifiedInbox />)
      expect(screen.getByRole('button', { name: /All/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /VIP/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /High Priority/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Unread/i })).toBeInTheDocument()
    })
  })

  describe('Context Panel', () => {
    it('shows empty state when no message selected', () => {
      render(<ContextPanel />)
      expect(screen.getByText(/Select a message/i)).toBeInTheDocument()
    })

    it('displays message details when selected', () => {
      ;(useMessages as jest.Mock).mockReturnValue({
        ...useMessages(),
        selectedMessage: mockMessages[0],
      })
      
      render(<ContextPanel />)
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('john@company.com')).toBeInTheDocument()
      expect(screen.getByText('Q4 Financial Report')).toBeInTheDocument()
    })

    it('shows AI summary button', () => {
      ;(useMessages as jest.Mock).mockReturnValue({
        ...useMessages(),
        selectedMessage: mockMessages[0],
      })
      
      render(<ContextPanel />)
      expect(screen.getByRole('button', { name: /Summarize/i })).toBeInTheDocument()
    })

    it('displays action buttons', () => {
      ;(useMessages as jest.Mock).mockReturnValue({
        ...useMessages(),
        selectedMessage: mockMessages[0],
      })
      
      render(<ContextPanel />)
      expect(screen.getByRole('button', { name: /Archive/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Snooze/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Reply/i })).toBeInTheDocument()
    })
  })

  describe('Message Interactions', () => {
    it('handles archive action', async () => {
      const mockArchive = jest.fn()
      ;(useMessages as jest.Mock).mockReturnValue({
        ...useMessages(),
        archiveMessage: mockArchive,
        selectedMessage: mockMessages[0],
      })
      
      render(<ContextPanel />)
      fireEvent.click(screen.getByRole('button', { name: /Archive/i }))
      
      await waitFor(() => {
        expect(mockArchive).toHaveBeenCalledWith('1')
      })
    })

    it('handles search input', () => {
      const mockSearch = jest.fn()
      ;(useMessages as jest.Mock).mockReturnValue({
        ...useMessages(),
        searchMessages: mockSearch,
      })
      
      render(<UnifiedInbox />)
      const searchInput = screen.getByPlaceholderText(/Search messages/i)
      
      fireEvent.change(searchInput, { target: { value: 'financial' } })
      
      waitFor(() => {
        expect(mockSearch).toHaveBeenCalledWith('financial')
      })
    })

    it('handles filter selection', () => {
      const mockFilter = jest.fn()
      ;(useMessages as jest.Mock).mockReturnValue({
        ...useMessages(),
        filterMessages: mockFilter,
      })
      
      render(<UnifiedInbox />)
      fireEvent.click(screen.getByRole('button', { name: /VIP/i }))
      
      expect(mockFilter).toHaveBeenCalledWith(['vip'])
    })
  })
})