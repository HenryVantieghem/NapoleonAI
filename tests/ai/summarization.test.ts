/**
 * AI Summarization Tests
 * 
 * Tests for the message summarization functionality including:
 * - Individual message summarization
 * - Cache handling for existing summaries
 * - Error handling and fallbacks
 * - Metrics logging
 * - Template system integration
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { POST, GET } from '@/app/api/ai/summarise/route'
import { createServiceClient } from '@/lib/supabase/server'

// Mock dependencies
vi.mock('@clerk/nextjs/server', () => ({
  currentUser: vi.fn()
}))

vi.mock('@/lib/supabase/server', () => ({
  createServiceClient: vi.fn()
}))

vi.mock('openai', () => ({
  openai: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn()
      }
    }
  }))
}))

vi.mock('fs', () => ({
  readFileSync: vi.fn()
}))

describe('AI Summarization', () => {
  const mockUser = {
    id: 'user_123',
    emailAddresses: [{ emailAddress: 'test@example.com' }]
  }

  const mockSupabase = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis()
  }

  const mockMessage = {
    id: 'msg_1',
    user_id: 'user_123',
    source: 'gmail',
    sender: 'ceo@company.com',
    subject: 'Strategic Partnership Opportunity',
    content: 'We have identified a potential strategic partnership with TechCorp that could significantly expand our market reach. I would like to schedule a meeting this week to discuss the details and get your thoughts on the proposal.',
    is_vip: true,
    urgency_keywords: ['strategic', 'partnership'],
    created_at: new Date().toISOString(),
    processing_status: 'pending',
    ai_summary: null
  }

  const mockMessageWithSummary = {
    ...mockMessage,
    ai_summary: 'CEO proposes strategic partnership with TechCorp for market expansion. Meeting requested this week.',
    processing_status: 'completed'
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock current user
    const { currentUser } = require('@clerk/nextjs/server')
    currentUser.mockResolvedValue(mockUser)
    
    // Mock Supabase client
    const { createServiceClient } = require('@/lib/supabase/server')
    createServiceClient.mockReturnValue(mockSupabase)
    
    // Mock prompt template
    const fs = require('fs')
    fs.readFileSync.mockReturnValue(`
You are an executive assistant AI specializing in email summarization for C-suite executives.

INSTRUCTIONS:
Summarize the following email in 2-3 sentences maximum.

EMAIL CONTENT:
{{content}}

SENDER: {{sender}}
SUBJECT: {{subject}}
VIP: {{is_vip}}

Your summary:`)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('POST /api/ai/summarise', () => {
    it('should generate summary for new message', async () => {
      // Mock message fetch
      mockSupabase.single.mockResolvedValueOnce({
        data: mockMessage,
        error: null
      })

      // Mock OpenAI response
      const mockOpenAI = require('openai').openai()
      mockOpenAI.chat.completions.create.mockResolvedValueOnce({
        choices: [{
          message: {
            content: 'CEO proposes strategic partnership with TechCorp for market expansion. Meeting requested this week to discuss details and get executive input.'
          }
        }],
        usage: { total_tokens: 75 }
      })

      // Mock database updates
      mockSupabase.update.mockResolvedValueOnce({ error: null })
      mockSupabase.insert.mockResolvedValueOnce({ error: null })

      const request = new NextRequest('http://localhost:3000/api/ai/summarise', {
        method: 'POST',
        body: JSON.stringify({ messageId: 'msg_1' }),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.messageId).toBe('msg_1')
      expect(data.summary).toContain('strategic partnership')
      expect(data.cached).toBe(false)
      expect(data.metrics.tokensUsed).toBe(75)
    })

    it('should return cached summary if already exists', async () => {
      // Mock message fetch with existing summary
      mockSupabase.single.mockResolvedValueOnce({
        data: mockMessageWithSummary,
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/ai/summarise', {
        method: 'POST',
        body: JSON.stringify({ messageId: 'msg_1' }),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.messageId).toBe('msg_1')
      expect(data.summary).toBe(mockMessageWithSummary.ai_summary)
      expect(data.cached).toBe(true)
      
      // Should not call OpenAI for cached summaries
      const mockOpenAI = require('openai').openai()
      expect(mockOpenAI.chat.completions.create).not.toHaveBeenCalled()
    })

    it('should handle OpenAI API errors', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: mockMessage,
        error: null
      })

      // Mock OpenAI error
      const mockOpenAI = require('openai').openai()
      mockOpenAI.chat.completions.create.mockRejectedValueOnce(
        new Error('OpenAI API rate limit exceeded')
      )

      // Mock metrics logging
      mockSupabase.insert.mockResolvedValueOnce({ error: null })

      const request = new NextRequest('http://localhost:3000/api/ai/summarise', {
        method: 'POST',
        body: JSON.stringify({ messageId: 'msg_1' }),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(false)
      expect(data.error).toContain('rate limit exceeded')
      expect(data.cached).toBe(false)
    })

    it('should reject request without messageId', async () => {
      const request = new NextRequest('http://localhost:3000/api/ai/summarise', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('messageId is required')
    })

    it('should reject request for non-existent message', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116', message: 'No rows returned' }
      })

      const request = new NextRequest('http://localhost:3000/api/ai/summarise', {
        method: 'POST',
        body: JSON.stringify({ messageId: 'non_existent' }),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Message not found or access denied')
    })

    it('should reject requests from unauthorized users', async () => {
      const { currentUser } = require('@clerk/nextjs/server')
      currentUser.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/ai/summarise', {
        method: 'POST',
        body: JSON.stringify({ messageId: 'msg_1' }),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should prevent cross-user access', async () => {
      // Message belongs to different user
      const messageOtherUser = {
        ...mockMessage,
        user_id: 'other_user_456'
      }

      mockSupabase.single.mockResolvedValueOnce({
        data: null, // RLS would prevent access
        error: { code: 'PGRST116', message: 'No rows returned' }
      })

      const request = new NextRequest('http://localhost:3000/api/ai/summarise', {
        method: 'POST',
        body: JSON.stringify({ messageId: 'msg_1' }),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Message not found or access denied')
    })

    it('should log metrics for successful summarization', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: mockMessage,
        error: null
      })

      const mockOpenAI = require('openai').openai()
      mockOpenAI.chat.completions.create.mockResolvedValueOnce({
        choices: [{
          message: { content: 'Test summary' }
        }],
        usage: { total_tokens: 50 }
      })

      mockSupabase.update.mockResolvedValueOnce({ error: null })
      mockSupabase.insert.mockResolvedValueOnce({ error: null })

      const request = new NextRequest('http://localhost:3000/api/ai/summarise', {
        method: 'POST',
        body: JSON.stringify({ messageId: 'msg_1' }),
        headers: { 'Content-Type': 'application/json' }
      })

      await POST(request)

      // Verify metrics logging call
      expect(mockSupabase.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user_123',
          operation_type: 'summarize',
          message_count: 1,
          tokens_used: 50,
          success_count: 1,
          error_count: 0,
          model_used: 'gpt-4'
        })
      )
    })
  })

  describe('GET /api/ai/summarise', () => {
    it('should retrieve existing summary', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: 'msg_1',
          ai_summary: 'Executive summary of the message',
          priority_score: 85,
          processing_status: 'completed',
          subject: 'Strategic Partnership',
          sender: 'ceo@company.com',
          created_at: new Date().toISOString()
        },
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/ai/summarise?messageId=msg_1', {
        method: 'GET'
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.messageId).toBe('msg_1')
      expect(data.summary).toBe('Executive summary of the message')
      expect(data.priorityScore).toBe(85)
      expect(data.hasSummary).toBe(true)
      expect(data.processingStatus).toBe('completed')
      expect(data.messagePreview).toMatchObject({
        subject: 'Strategic Partnership',
        sender: 'ceo@company.com'
      })
    })

    it('should handle message without summary', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: 'msg_1',
          ai_summary: null,
          priority_score: null,
          processing_status: 'pending',
          subject: 'Test Message',
          sender: 'test@example.com',
          created_at: new Date().toISOString()
        },
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/ai/summarise?messageId=msg_1', {
        method: 'GET'
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.messageId).toBe('msg_1')
      expect(data.summary).toBeNull()
      expect(data.hasSummary).toBe(false)
      expect(data.processingStatus).toBe('pending')
    })

    it('should require messageId parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/ai/summarise', {
        method: 'GET'
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('messageId parameter is required')
    })

    it('should handle non-existent messages', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116', message: 'No rows returned' }
      })

      const request = new NextRequest('http://localhost:3000/api/ai/summarise?messageId=non_existent', {
        method: 'GET'
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Message not found or access denied')
    })

    it('should reject unauthorized requests', async () => {
      const { currentUser } = require('@clerk/nextjs/server')
      currentUser.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/ai/summarise?messageId=msg_1', {
        method: 'GET'
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })
  })

  describe('Template Integration', () => {
    it('should properly fill template variables', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: mockMessage,
        error: null
      })

      const mockOpenAI = require('openai').openai()
      mockOpenAI.chat.completions.create.mockResolvedValueOnce({
        choices: [{ message: { content: 'Test summary' } }],
        usage: { total_tokens: 25 }
      })

      mockSupabase.update.mockResolvedValueOnce({ error: null })
      mockSupabase.insert.mockResolvedValueOnce({ error: null })

      const request = new NextRequest('http://localhost:3000/api/ai/summarise', {
        method: 'POST',
        body: JSON.stringify({ messageId: 'msg_1' }),
        headers: { 'Content-Type': 'application/json' }
      })

      await POST(request)

      // Verify that OpenAI was called with properly filled template
      const openaiCall = mockOpenAI.chat.completions.create.mock.calls[0][0]
      const prompt = openaiCall.messages[0].content

      expect(prompt).toContain(mockMessage.content)
      expect(prompt).toContain(mockMessage.sender)
      expect(prompt).toContain(mockMessage.subject)
      expect(prompt).toContain('Yes') // is_vip: true should be converted to 'Yes'
    })

    it('should handle template loading errors', async () => {
      const fs = require('fs')
      fs.readFileSync.mockImplementation(() => {
        throw new Error('Template file not found')
      })

      mockSupabase.single.mockResolvedValueOnce({
        data: mockMessage,
        error: null
      })

      mockSupabase.insert.mockResolvedValueOnce({ error: null })

      const request = new NextRequest('http://localhost:3000/api/ai/summarise', {
        method: 'POST',
        body: JSON.stringify({ messageId: 'msg_1' }),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Template file not found')
    })
  })
})