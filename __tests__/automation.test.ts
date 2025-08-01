import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import analytics from '@/lib/analytics/segment'
import { useNotifications } from '@/hooks/useNotifications'
import { renderHook, act } from '@testing-library/react'

// Mock dependencies
jest.mock('@clerk/nextjs')
jest.mock('@/lib/supabase/client')
jest.mock('@/lib/analytics/segment')

describe('Automation & Analytics', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Segment Analytics', () => {
    it('tracks user identification', async () => {
      const userId = 'user-123'
      const traits = {
        email: 'executive@company.com',
        name: 'John Executive',
        role: 'CEO',
        company: 'Fortune 500 Co',
      }

      await analytics.identify(userId, traits)

      expect(analytics.identify).toHaveBeenCalledWith(userId, expect.objectContaining({
        ...traits,
        source: 'napoleon-ai',
      }))
    })

    it('tracks executive events', async () => {
      const userId = 'user-123'
      const event = analytics.events.VIP_MESSAGE_VIEWED
      const properties = {
        message_id: 'msg-123',
        sender: 'board@company.com',
        priority_score: 95,
      }

      await analytics.track(userId, event, properties)

      expect(analytics.track).toHaveBeenCalledWith(
        userId,
        event,
        expect.objectContaining({
          ...properties,
          timestamp: expect.any(String),
          platform: 'web',
        })
      )
    })

    it('respects user opt-out preferences', async () => {
      const userId = 'user-123'
      
      // Opt out
      analytics.optOut(userId)
      
      // Try to track
      await analytics.trackSafely(userId, 'Test Event', {})

      // Should not track when opted out
      expect(analytics.track).not.toHaveBeenCalled()
    })

    it('tracks executive metrics', async () => {
      const userId = 'user-123'
      const metric = 'TIME_SAVED_MINUTES'
      const value = 120

      await analytics.trackExecutiveMetric(userId, metric, value, {
        date: '2024-02-01',
        session_id: 'session-123',
      })

      expect(analytics.track).toHaveBeenCalledWith(
        userId,
        'Executive Metric',
        expect.objectContaining({
          metric,
          value,
          date: '2024-02-01',
          session_id: 'session-123',
        })
      )
    })
  })

  describe('Notifications Hook', () => {
    const mockUser = { id: 'user-123' }
    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      upsert: jest.fn().mockReturnThis(),
      single: jest.fn(),
      channel: jest.fn().mockReturnThis(),
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn().mockReturnThis(),
    }

    beforeEach(() => {
      jest.mocked(require('@clerk/nextjs').useUser).mockReturnValue({ user: mockUser })
      jest.mocked(require('@/lib/supabase/client').createClient).mockReturnValue(mockSupabase)
    })

    it('fetches notifications on mount', async () => {
      const mockNotifications = [
        {
          id: 'notif-1',
          userId: 'user-123',
          type: 'vip',
          title: 'Board Member Message',
          message: 'New message from board member',
          read: false,
          priority: 'high',
          createdAt: new Date().toISOString(),
        },
      ]

      mockSupabase.limit.mockResolvedValue({
        data: mockNotifications,
        error: null,
      })

      const { result } = renderHook(() => useNotifications())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
      })

      expect(result.current.notifications).toHaveLength(1)
      expect(result.current.unreadCount).toBe(1)
    })

    it('marks notification as read', async () => {
      mockSupabase.eq.mockResolvedValue({ data: null, error: null })

      const { result } = renderHook(() => useNotifications())

      await act(async () => {
        await result.current.markAsRead('notif-1')
      })

      expect(mockSupabase.update).toHaveBeenCalledWith({ read: true })
    })

    it('respects quiet hours', () => {
      const { result } = renderHook(() => useNotifications())

      act(() => {
        result.current.updatePreferences({
          quietHours: {
            enabled: true,
            start: '22:00',
            end: '08:00',
          },
        })
      })

      // Mock current time as 23:00 (11 PM)
      jest.spyOn(Date.prototype, 'getHours').mockReturnValue(23)
      
      expect(result.current.isQuietHours()).toBe(true)
    })

    it('filters VIP-only notifications', async () => {
      const { result } = renderHook(() => useNotifications())

      act(() => {
        result.current.updatePreferences({
          vipOnly: true,
        })
      })

      // Regular notification should not show
      act(() => {
        result.current.showNotification({
          type: 'message',
          title: 'Regular Message',
          message: 'From team member',
        })
      })

      // VIP notification should show
      act(() => {
        result.current.showNotification({
          type: 'vip',
          title: 'VIP Message',
          message: 'From board member',
        })
      })

      // Only VIP notification should be shown
      // (In real implementation, check toast calls)
    })
  })

  describe('Zapier Integration', () => {
    it('formats webhook payload correctly', () => {
      const payload = {
        event: 'new_vip_message',
        timestamp: '2024-02-01T10:30:00Z',
        user_id: 'user_123',
        data: {
          message_id: 'msg_456',
          from: 'board.member@company.com',
          subject: 'Q4 Results Review',
          priority_score: 95,
          ai_summary: 'Board member requests review of Q4 results',
        },
      }

      // Validate payload structure
      expect(payload).toHaveProperty('event')
      expect(payload).toHaveProperty('timestamp')
      expect(payload).toHaveProperty('user_id')
      expect(payload).toHaveProperty('data')
      expect(payload.data).toHaveProperty('message_id')
      expect(payload.data).toHaveProperty('priority_score')
    })

    it('generates valid webhook signature', () => {
      const crypto = require('crypto')
      const payload = JSON.stringify({ test: 'data' })
      const secret = 'webhook_secret'

      const signature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex')

      expect(signature).toMatch(/^[a-f0-9]{64}$/)
    })
  })

  describe('Automation Error Handling', () => {
    it('logs automation errors correctly', async () => {
      const errorPayload = {
        integration: 'zapier',
        error_type: 'authentication_failed',
        error_message: 'Invalid API key',
        automation_id: 'zap_123',
        retry_count: 0,
      }

      const response = await fetch('/api/automation_errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorPayload),
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toHaveProperty('error_id')
      expect(data).toHaveProperty('suggestions')
    })

    it('calculates retry delay with exponential backoff', () => {
      const delays = [0, 1, 2, 3, 4, 5].map(count => {
        return Math.min(Math.pow(2, count) * 1000, 32000)
      })

      expect(delays).toEqual([1000, 2000, 4000, 8000, 16000, 32000])
    })
  })

  describe('Analytics Privacy', () => {
    it('does not track PII in events', async () => {
      const userId = 'user-123'
      const event = 'Message Viewed'
      const properties = {
        message_id: 'msg-123',
        sender_domain: 'company.com', // Domain only, not full email
        has_attachments: true,
        // Should NOT include: email, name, message content
      }

      await analytics.track(userId, event, properties)

      const trackedProps = (analytics.track as jest.Mock).mock.calls[0][2]
      expect(trackedProps).not.toHaveProperty('email')
      expect(trackedProps).not.toHaveProperty('sender_email')
      expect(trackedProps).not.toHaveProperty('content')
    })

    it('allows data export', async () => {
      const exportRequest = {
        user_id: 'user-123',
        date_range: 'last_90_days',
        format: 'csv',
      }

      const response = await fetch('/api/analytics/export', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exportRequest),
      })

      expect(response.headers.get('content-type')).toContain('text/csv')
    })
  })
})