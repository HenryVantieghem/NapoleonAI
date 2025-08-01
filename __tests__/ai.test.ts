import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { aiService } from '@/lib/ai/ai-service'
import { openAIClient } from '@/lib/ai/openai-client'
import { createClient } from '@/lib/supabase/client'

jest.mock('@/lib/ai/openai-client')
jest.mock('@/lib/supabase/client')

describe('AI Pipeline', () => {
  const mockSupabase = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
  }

  const mockMessage = {
    id: 'msg-123',
    user_id: 'user-123',
    from_email: 'board@company.com',
    from_name: 'Board Member',
    subject: 'Q4 Financial Results - Urgent Review Required',
    body_text: 'Please review the attached Q4 financial results before tomorrow\'s board meeting.',
    is_vip: true,
    received_at: new Date().toISOString(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
  })

  describe('Message Processing', () => {
    it('processes a message successfully', async () => {
      const mockAnalysis = {
        summary: 'Q4 financial results need review before board meeting tomorrow.',
        priorityScore: 95,
        sentiment: 'neutral',
        actionItems: [
          {
            action: 'Review Q4 financial results',
            due: 'Tomorrow',
            owner: 'Executive',
          },
        ],
      }

      ;(openAIClient.analyzeMessage as jest.Mock).mockResolvedValue(mockAnalysis)
      mockSupabase.single.mockResolvedValue({ data: null, error: null })

      const result = await aiService.processMessage(mockMessage, 'user-123')

      expect(result).toEqual(mockAnalysis)
      expect(openAIClient.analyzeMessage).toHaveBeenCalledWith(mockMessage)
    })

    it('applies VIP boost to priority score', async () => {
      const mockAnalysis = {
        summary: 'Regular update on project status.',
        priorityScore: 50,
        sentiment: 'neutral',
        actionItems: [],
      }

      ;(openAIClient.analyzeMessage as jest.Mock).mockResolvedValue(mockAnalysis)
      mockSupabase.single.mockResolvedValue({ data: null, error: null })

      const vipMessage = { ...mockMessage, is_vip: true }
      const result = await aiService.processMessage(vipMessage, 'user-123')

      expect(result.priorityScore).toBeGreaterThan(50)
    })

    it('handles processing errors with fallback', async () => {
      ;(openAIClient.analyzeMessage as jest.Mock).mockRejectedValue(
        new Error('OpenAI API error')
      )

      const result = await aiService.processMessage(mockMessage, 'user-123')

      expect(result).toBeDefined()
      expect(result.summary).toContain('urgent') // Fallback keyword detection
      expect(result.priorityScore).toBeGreaterThan(0)
    })
  })

  describe('Batch Processing', () => {
    it('processes multiple messages in batch', async () => {
      const messages = [
        mockMessage,
        { ...mockMessage, id: 'msg-124', subject: 'Project Update' },
        { ...mockMessage, id: 'msg-125', subject: 'Meeting Request' },
      ]

      const mockResults = messages.map((msg, idx) => ({
        messageId: msg.id,
        summary: `Summary for ${msg.subject}`,
        priorityScore: 90 - idx * 10,
      }))

      ;(openAIClient.batchAnalyze as jest.Mock).mockResolvedValue(mockResults)

      const results = await aiService.processBatch(messages, 'user-123')

      expect(results).toHaveLength(3)
      expect(openAIClient.batchAnalyze).toHaveBeenCalledWith(messages)
    })

    it('respects batch size limits', async () => {
      const messages = Array(15).fill(mockMessage).map((msg, idx) => ({
        ...msg,
        id: `msg-${idx}`,
      }))

      await aiService.processBatch(messages, 'user-123')

      // Should process in batches of 10
      expect(openAIClient.batchAnalyze).toHaveBeenCalledTimes(2)
    })
  })

  describe('Summarization', () => {
    it('generates executive summary', async () => {
      const mockSummary = 'Q4 revenue exceeded targets by 15%. Board approval needed for expansion budget by Friday.'
      
      ;(openAIClient.summarize as jest.Mock).mockResolvedValue(mockSummary)

      const result = await aiService.summarizeMessage(mockMessage.body_text)

      expect(result).toEqual(mockSummary)
      expect(openAIClient.summarize).toHaveBeenCalledWith(mockMessage.body_text)
    })

    it('handles long messages appropriately', async () => {
      const longMessage = 'Lorem ipsum '.repeat(1000)
      
      await aiService.summarizeMessage(longMessage)

      expect(openAIClient.summarize).toHaveBeenCalledWith(
        expect.stringContaining('Lorem ipsum')
      )
    })
  })

  describe('Priority Scoring', () => {
    it('calculates priority based on multiple factors', async () => {
      const testCases = [
        { sender: 'board@company.com', subject: 'Urgent: Board Decision', expected: 90 },
        { sender: 'investor@vc.com', subject: 'Investment Update', expected: 80 },
        { sender: 'team@company.com', subject: 'Weekly Update', expected: 40 },
        { sender: 'unknown@email.com', subject: 'FYI', expected: 20 },
      ]

      for (const testCase of testCases) {
        const message = {
          ...mockMessage,
          from_email: testCase.sender,
          subject: testCase.subject,
          is_vip: testCase.sender.includes('board') || testCase.sender.includes('investor'),
        }

        const score = await aiService.calculatePriorityScore(message)
        expect(score).toBeGreaterThanOrEqual(testCase.expected - 10)
        expect(score).toBeLessThanOrEqual(100)
      }
    })
  })

  describe('Action Item Extraction', () => {
    it('extracts action items from messages', async () => {
      const mockActionItems = [
        {
          action: 'Review Q4 financial report',
          due: '2024-02-03',
          owner: 'CEO',
          context: 'Board meeting preparation',
        },
        {
          action: 'Approve expansion budget',
          due: '2024-02-05',
          owner: 'CEO',
          context: 'Following board approval',
        },
      ]

      ;(openAIClient.extractActionItems as jest.Mock).mockResolvedValue(mockActionItems)

      const result = await aiService.extractActionItems(mockMessage.body_text)

      expect(result).toEqual(mockActionItems)
      expect(result).toHaveLength(2)
    })

    it('handles messages with no action items', async () => {
      ;(openAIClient.extractActionItems as jest.Mock).mockResolvedValue([])

      const result = await aiService.extractActionItems('FYI - No action needed')

      expect(result).toEqual([])
    })
  })

  describe('Rate Limiting', () => {
    it('respects rate limits', async () => {
      const messages = Array(100).fill(mockMessage)
      
      // Mock rate limiter
      const mockRateLimiter = {
        removeTokens: jest.fn().mockResolvedValue(true),
      }
      ;(aiService as any).rateLimiter = mockRateLimiter

      await aiService.processBatch(messages, 'user-123')

      expect(mockRateLimiter.removeTokens).toHaveBeenCalled()
    })

    it('queues messages when rate limited', async () => {
      const mockRateLimiter = {
        removeTokens: jest.fn().mockResolvedValue(false),
      }
      ;(aiService as any).rateLimiter = mockRateLimiter

      const result = await aiService.processMessage(mockMessage, 'user-123')

      expect(result).toHaveProperty('queued', true)
    })
  })

  describe('Metrics Logging', () => {
    it('logs processing metrics', async () => {
      const mockMetrics = {
        processing_time_ms: 342,
        prompt_tokens: 150,
        completion_tokens: 95,
        total_tokens: 245,
        cost_usd: 0.0245,
      }

      ;(openAIClient.analyzeMessage as jest.Mock).mockResolvedValue({
        summary: 'Test summary',
        priorityScore: 80,
        metrics: mockMetrics,
      })

      mockSupabase.insert.mockResolvedValue({ data: null, error: null })

      await aiService.processMessage(mockMessage, 'user-123')

      expect(mockSupabase.from).toHaveBeenCalledWith('ai_processing_logs')
      expect(mockSupabase.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-123',
          message_id: 'msg-123',
          processing_type: 'full_analysis',
          ...mockMetrics,
          status: 'success',
        })
      )
    })
  })

  describe('Error Handling', () => {
    it('handles API timeouts gracefully', async () => {
      ;(openAIClient.analyzeMessage as jest.Mock).mockRejectedValue(
        new Error('Request timeout')
      )

      const result = await aiService.processMessage(mockMessage, 'user-123')

      expect(result).toBeDefined()
      expect(result.fallback).toBe(true)
    })

    it('retries on transient errors', async () => {
      let attempts = 0
      ;(openAIClient.analyzeMessage as jest.Mock).mockImplementation(() => {
        attempts++
        if (attempts < 3) {
          throw new Error('Transient error')
        }
        return { summary: 'Success after retries', priorityScore: 75 }
      })

      const result = await aiService.processMessage(mockMessage, 'user-123')

      expect(result.summary).toBe('Success after retries')
      expect(attempts).toBe(3)
    })

    it('falls back to keyword analysis on persistent errors', async () => {
      ;(openAIClient.analyzeMessage as jest.Mock).mockRejectedValue(
        new Error('Persistent error')
      )

      const result = await aiService.processMessage(mockMessage, 'user-123')

      expect(result.fallback).toBe(true)
      expect(result.summary).toBeDefined()
      expect(result.priorityScore).toBeGreaterThan(0)
    })
  })

  describe('Prompt Templates', () => {
    it('uses correct prompt template for summarization', async () => {
      await aiService.summarizeMessage(mockMessage.body_text)

      expect(openAIClient.summarize).toHaveBeenCalledWith(
        mockMessage.body_text,
        expect.objectContaining({
          template: 'summarise',
        })
      )
    })

    it('uses correct prompt template for priority scoring', async () => {
      await aiService.calculatePriorityScore(mockMessage)

      expect(openAIClient.scorePriority).toHaveBeenCalledWith(
        mockMessage,
        expect.objectContaining({
          template: 'priority_score',
        })
      )
    })
  })
})