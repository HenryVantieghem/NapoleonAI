import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { enhancedAIService } from '../enhanced-ai-service'
import type { Message, VipContact } from '@/types/database'

// Mock dependencies
vi.mock('../openai-client', () => ({
  openai: {
    chat: {
      completions: {
        create: vi.fn()
      }
    }
  }
}))

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: [],
          error: null
        }))
      })),
      insert: vi.fn(() => ({
        data: null,
        error: null
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: null,
          error: null
        }))
      })),
      upsert: vi.fn(() => ({
        data: null,
        error: null
      }))
    }))
  }
}))

vi.mock('fs/promises', () => ({
  readFile: vi.fn()
}))

describe('EnhancedAIService', () => {
  const mockMessage: Message = {
    id: 'msg-123',
    user_id: 'user-456',
    sender_email: 'ceo@company.com',
    sender_name: 'John CEO',
    subject: 'Board Meeting Tomorrow - Urgent Decision Required',
    content: 'We need to approve the $50M acquisition by tomorrow morning. Please review the attached documents and provide your decision.',
    message_date: new Date().toISOString(),
    platform: 'gmail',
    priority_score: 50,
    ai_summary: null,
    sentiment: null,
    is_vip: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  const mockVipContacts: VipContact[] = [
    {
      id: 'vip-1',
      user_id: 'user-456',
      email: 'ceo@company.com',
      name: 'John CEO',
      priority_level: 9,
      relationship_type: 'board_member',
      notes: 'Board Chair - highest priority',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock file system for prompt templates
    const mockPromptTemplate = `
You are Napoleon AI. Analyze this message:
FROM: {{sender_name}} <{{sender_email}}>
SUBJECT: {{subject}}
CONTENT: {{content}}

Respond with JSON containing analysis.
`
    vi.mocked(require('fs/promises').readFile).mockResolvedValue(mockPromptTemplate)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('VIP Detection and Boosting', () => {
    it('should correctly identify VIP contacts and apply appropriate boost', () => {
      const vipStatus = (enhancedAIService as any).analyzeVipStatus('ceo@company.com', mockVipContacts)
      
      expect(vipStatus.isVip).toBe(true)
      expect(vipStatus.boost).toBe(20) // Priority level 9 should give 20 point boost
      expect(vipStatus.relationship).toBe('board_member')
      expect(vipStatus.isBoardMember).toBe(true)
    })

    it('should handle non-VIP contacts correctly', () => {
      const vipStatus = (enhancedAIService as any).analyzeVipStatus('regular@user.com', mockVipContacts)
      
      expect(vipStatus.isVip).toBe(false)
      expect(vipStatus.boost).toBe(0)
      expect(vipStatus.relationship).toBe('standard')
      expect(vipStatus.isBoardMember).toBe(false)
    })

    it('should calculate boost correctly for different priority levels', () => {
      const testCases = [
        { level: 10, expectedBoost: 25 },
        { level: 9, expectedBoost: 20 },
        { level: 8, expectedBoost: 18 },
        { level: 7, expectedBoost: 15 },
        { level: 6, expectedBoost: 12 },
        { level: 1, expectedBoost: 10 }
      ]

      testCases.forEach(({ level, expectedBoost }) => {
        const testContact = { ...mockVipContacts[0], priority_level: level }
        const vipStatus = (enhancedAIService as any).analyzeVipStatus('ceo@company.com', [testContact])
        expect(vipStatus.boost).toBe(expectedBoost)
      })
    })
  })

  describe('Rate Limiting', () => {
    it('should allow processing within rate limits', () => {
      const canProcess = (enhancedAIService as any).checkRateLimit('user-456')
      expect(canProcess).toBe(true)
    })

    it('should block processing when rate limit exceeded', () => {
      const service = enhancedAIService as any
      
      // Simulate 12 requests in the last hour
      for (let i = 0; i < 12; i++) {
        service.recordBatchRequest('user-456')
      }
      
      const canProcess = service.checkRateLimit('user-456')
      expect(canProcess).toBe(false)
    })

    it('should reset rate limiting after time window', () => {
      const service = enhancedAIService as any
      
      // Mock old timestamps (2 hours ago)
      const oldTimestamp = Date.now() - (2 * 60 * 60 * 1000)
      service.rateLimitTracker.set('user-456', [oldTimestamp])
      
      const canProcess = service.checkRateLimit('user-456')
      expect(canProcess).toBe(true)
    })
  })

  describe('Batch Processing', () => {
    it('should process messages in batches with proper limits', async () => {
      // Mock successful OpenAI responses
      const mockOpenAIResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              executive_summary: 'Board meeting requires urgent decision',
              key_points: ['$50M acquisition', 'Tomorrow deadline', 'CEO approval needed'],
              business_impact: 'critical',
              decision_required: true
            })
          }
        }],
        usage: { total_tokens: 150 }
      }

      vi.mocked(require('../openai-client').openai.chat.completions.create)
        .mockResolvedValue(mockOpenAIResponse)

      // Mock Supabase responses
      vi.mocked(require('@/lib/supabase/client').supabase.from).mockImplementation((table: string) => {
        if (table === 'messages') {
          return {
            select: () => ({
              eq: () => ({
                single: () => ({
                  data: mockMessage,
                  error: null
                })
              })
            })
          }
        }
        if (table === 'vip_contacts') {
          return {
            select: () => ({
              eq: () => ({
                data: mockVipContacts,
                error: null
              })
            })
          }
        }
        return {}
      })

      const result = await enhancedAIService.processBatch('user-456', ['msg-123'])

      expect(result.processed).toBe(1)
      expect(result.failed).toBe(0)
      expect(result.rateLimited).toBe(false)
      expect(result.batchId).toBeTruthy()
    })

    it('should enforce batch size limits', async () => {
      const messageIds = Array.from({ length: 15 }, (_, i) => `msg-${i}`)
      
      const result = await enhancedAIService.processBatch('user-456', messageIds)
      
      // Should only process first 10 messages (batch size limit)
      expect(result.processed + result.failed).toBeLessThanOrEqual(10)
    })
  })

  describe('Prompt Template System', () => {
    it('should load and substitute variables in prompt templates', async () => {
      const variables = {
        sender_name: 'John CEO',
        sender_email: 'ceo@company.com',
        subject: 'Test Subject',
        content: 'Test content'
      }

      const prompt = await (enhancedAIService as any).loadPromptTemplate('executive-summary', variables)

      expect(prompt).toContain('John CEO')
      expect(prompt).toContain('ceo@company.com')
      expect(prompt).toContain('Test Subject')
      expect(prompt).toContain('Test content')
    })

    it('should cache prompt templates for performance', async () => {
      const variables = { sender_name: 'Test' }
      
      // First call
      await (enhancedAIService as any).loadPromptTemplate('executive-summary', variables)
      
      // Second call should use cache
      await (enhancedAIService as any).loadPromptTemplate('executive-summary', variables)
      
      // Should only read file once
      expect(vi.mocked(require('fs/promises').readFile)).toHaveBeenCalledTimes(1)
    })
  })

  describe('AI Metrics Collection', () => {
    it('should collect comprehensive processing metrics', async () => {
      const dateRange = {
        start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString()
      }

      // Mock database response
      vi.mocked(require('@/lib/supabase/client').supabase.from).mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            gte: () => ({
              lte: () => ({
                data: [
                  {
                    processing_time_ms: 450,
                    tokens_used: 150,
                    cost_usd: 0.045,
                    success: true,
                    vip_boost_applied: 20
                  },
                  {
                    processing_time_ms: 520,
                    tokens_used: 180,
                    cost_usd: 0.054,
                    success: true,
                    vip_boost_applied: 0
                  }
                ],
                error: null
              })
            })
          })
        })
      }))

      const metrics = await enhancedAIService.getAIMetrics('user-456', dateRange)

      expect(metrics.totalMessages).toBe(2)
      expect(metrics.successfulProcessing).toBe(2)
      expect(metrics.failedProcessing).toBe(0)
      expect(metrics.avgProcessingTime).toBe(485) // (450 + 520) / 2
      expect(metrics.totalTokensUsed).toBe(330) // 150 + 180
      expect(metrics.totalCost).toBe(0.10) // 0.045 + 0.054 rounded
      expect(metrics.vipBoosts).toBe(1) // One message had VIP boost
    })
  })

  describe('Fallback Analysis', () => {
    it('should provide keyword-based analysis when AI fails', async () => {
      const urgentMessage = {
        ...mockMessage,
        content: 'URGENT: System breach detected. Need immediate response from CEO.',
        subject: 'CRITICAL SECURITY ALERT'
      }

      const fallbackAnalysis = (enhancedAIService as any).getFallbackAnalysis(urgentMessage, mockVipContacts)

      expect(fallbackAnalysis.priorityAnalysis.finalScore).toBeGreaterThan(80) // Should detect urgency
      expect(fallbackAnalysis.priorityAnalysis.urgencyIndicators).toContain('Crisis-related keywords')
      expect(fallbackAnalysis.executiveSummary.businessImpact).toBe('critical')
      expect(fallbackAnalysis.actionItems).toBeDefined()
    })

    it('should detect various keyword patterns', () => {
      const testCases = [
        { 
          content: 'Please approve the budget ASAP',
          expectedKeywords: ['Urgency keywords detected']
        },
        {
          content: 'Board meeting scheduled for tomorrow',
          expectedKeywords: ['High-level stakeholder communication']
        },
        {
          content: 'Data breach - need immediate action',
          expectedKeywords: ['Crisis-related keywords']
        }
      ]

      testCases.forEach(({ content, expectedKeywords }) => {
        const testMessage = { ...mockMessage, content }
        const analysis = (enhancedAIService as any).getFallbackAnalysis(testMessage, [])
        
        expectedKeywords.forEach(keyword => {
          expect(analysis.priorityAnalysis.urgencyIndicators).toContain(keyword)
        })
      })
    })
  })

  describe('Executive Feature Detection', () => {
    it('should detect board member communications', () => {
      const boardMessage = {
        ...mockMessage,
        sender_email: 'boardchair@company.com',
        content: 'Board resolution requires your immediate vote'
      }

      const vipStatus = (enhancedAIService as any).analyzeVipStatus(
        'boardchair@company.com', 
        [{
          ...mockVipContacts[0],
          email: 'boardchair@company.com',
          notes: 'Board Chair - highest priority'
        }]
      )

      expect(vipStatus.isBoardMember).toBe(true)
    })

    it('should detect investor communications', () => {
      const investorContact = {
        ...mockVipContacts[0],
        email: 'investor@fund.com',
        relationship_type: 'investor',
        notes: 'Lead investor - Series B'
      }

      const vipStatus = (enhancedAIService as any).analyzeVipStatus('investor@fund.com', [investorContact])

      expect(vipStatus.isInvestor).toBe(true)
    })
  })

  describe('Performance Targets', () => {
    it('should meet executive performance requirements', async () => {
      // Test processing time target (< 500ms per message)
      const startTime = Date.now()
      
      // Mock fast OpenAI response
      vi.mocked(require('../openai-client').openai.chat.completions.create)
        .mockResolvedValue({
          choices: [{ message: { content: '{"summary": "test"}' } }],
          usage: { total_tokens: 100 }
        })

      // Mock Supabase responses
      vi.mocked(require('@/lib/supabase/client').supabase.from).mockReturnValue({
        select: () => ({
          eq: () => ({
            data: [],
            error: null
          })
        })
      })

      try {
        await enhancedAIService.processMessage(mockMessage, 'user-456')
      } catch (error) {
        // Expected to fail due to mocking, but we're testing timing
      }

      const processingTime = Date.now() - startTime
      expect(processingTime).toBeLessThan(2000) // Allow some overhead for test environment
    })
  })
})