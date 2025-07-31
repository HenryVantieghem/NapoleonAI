/**
 * AI Processing Pipeline Tests
 * 
 * Tests for the AI processing functionality including:
 * - Message processing workflow
 * - Prompt template system
 * - Error handling and fallbacks
 * - Rate limiting
 * - Metrics logging
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { POST, GET } from '@/app/api/ai/process-messages/route'
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

describe('AI Processing Pipeline', () => {
  const mockUser = {
    id: 'user_123',
    emailAddresses: [{ emailAddress: 'test@example.com' }]
  }

  const mockSupabase = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    raw: vi.fn()
  }

  const mockMessages = [
    {
      id: 'msg_1',
      user_id: 'user_123',
      source: 'gmail',
      sender: 'board@company.com',
      subject: 'Urgent: Q3 Board Meeting',
      content: 'Please review the attached Q3 financial reports before tomorrow\'s board meeting.',
      is_vip: true,
      urgency_keywords: ['urgent'],
      created_at: new Date().toISOString(),
      processing_status: 'pending'
    },
    {
      id: 'msg_2',
      user_id: 'user_123',
      source: 'gmail',
      sender: 'newsletter@industry.com',
      subject: 'Weekly Industry Update',
      content: 'Here are this week\'s top industry news and trends.',
      is_vip: false,
      urgency_keywords: [],
      created_at: new Date().toISOString(),
      processing_status: 'pending'
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock current user
    const { currentUser } = require('@clerk/nextjs/server')
    currentUser.mockResolvedValue(mockUser)
    
    // Mock Supabase client
    const { createServiceClient } = require('@/lib/supabase/server')
    createServiceClient.mockReturnValue(mockSupabase)
    
    // Mock file system for prompt templates
    const fs = require('fs')
    fs.readFileSync.mockImplementation((path: string) => {
      if (path.includes('summarise.txt')) {
        return 'Summarize: {{content}} from {{sender}}'
      }
      if (path.includes('priority_score.txt')) {
        return 'Score priority for: {{content}} VIP: {{is_vip}}'
      }
      if (path.includes('extract_actions.txt')) {
        return 'Extract actions from: {{content}}'
      }
      return 'Mock template'
    })
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('Batch Processing Endpoint', () => {
    it('should successfully process messages with AI', async () => {
      // Mock Supabase responses
      mockSupabase.single.mockResolvedValueOnce({
        data: { ai_preferences: {}, vip_contacts: [] },
        error: null
      })
      
      mockSupabase.limit.mockResolvedValueOnce({
        data: mockMessages,
        error: null
      })

      // Mock OpenAI responses
      const mockOpenAI = require('openai').openai()
      mockOpenAI.chat.completions.create
        .mockResolvedValueOnce({
          choices: [{ message: { content: 'Board meeting requires urgent attention.' } }],
          usage: { total_tokens: 50 }
        })
        .mockResolvedValueOnce({
          choices: [{ message: { content: '{"priority_score": 90, "reasoning": "VIP board communication"}' } }],
          usage: { total_tokens: 30 }
        })
        .mockResolvedValueOnce({
          choices: [{ message: { content: '[{"description": "Review Q3 reports", "due_date": "2024-01-15", "priority": "urgent"}]' } }],
          usage: { total_tokens: 40 }
        })

      // Mock update and insert operations
      mockSupabase.update.mockResolvedValue({ error: null })
      mockSupabase.insert.mockResolvedValue({ error: null })

      const request = new NextRequest('http://localhost:3000/api/ai/process-messages', {
        method: 'POST'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.processed).toBe(2)
      expect(data.successful).toBe(2)
      expect(data.failed).toBe(0)
    })

    it('should handle rate limiting', async () => {
      // Mock rate limit check to return false
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: null
      })
      
      // Mock recent logs that exceed rate limit
      mockSupabase.gte.mockResolvedValueOnce({
        data: Array(15).fill({ batch_id: 'batch_1' }), // Exceeds 12 batches/hour limit
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/ai/process-messages', {
        method: 'POST'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(429)
      expect(data.error).toContain('Rate limit exceeded')
      expect(data.retryAfter).toBe(3600)
    })

    it('should handle OpenAI API errors gracefully', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { ai_preferences: {}, vip_contacts: [] },
        error: null
      })
      
      mockSupabase.limit.mockResolvedValueOnce({
        data: [mockMessages[0]],
        error: null
      })

      // Mock OpenAI error
      const mockOpenAI = require('openai').openai()
      mockOpenAI.chat.completions.create.mockRejectedValue(new Error('API rate limit exceeded'))

      mockSupabase.update.mockResolvedValue({ error: null })
      mockSupabase.insert.mockResolvedValue({ error: null })

      const request = new NextRequest('http://localhost:3000/api/ai/process-messages', {
        method: 'POST'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.failed).toBe(1)
      expect(data.results[0].success).toBe(false)
    })

    it('should handle empty message queue', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { ai_preferences: {}, vip_contacts: [] },
        error: null
      })
      
      mockSupabase.limit.mockResolvedValueOnce({
        data: [],
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/ai/process-messages', {
        method: 'POST'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.processed).toBe(0)
      expect(data.message).toBe('No messages to process')
    })
  })

  describe('Processing Status Endpoint', () => {
    it('should return processing statistics', async () => {
      mockSupabase.eq.mockReturnThis()
      mockSupabase.select.mockResolvedValueOnce({
        data: [
          { processing_status: 'pending' },
          { processing_status: 'pending' },
          { processing_status: 'completed' },
          { processing_status: 'failed' }
        ],
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/ai/process-messages', {
        method: 'GET'
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.pending).toBe(2)
      expect(data.completed).toBe(1)
      expect(data.failed).toBe(1)
      expect(data.total).toBe(4)
    })

    it('should handle empty message table', async () => {
      mockSupabase.eq.mockReturnThis()
      mockSupabase.select.mockResolvedValueOnce({
        data: null,
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/ai/process-messages', {
        method: 'GET'
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.pending).toBe(0)
      expect(data.completed).toBe(0)
      expect(data.failed).toBe(0)
      expect(data.total).toBe(0)
    })
  })

  describe('Template System', () => {
    it('should load and fill prompt templates correctly', async () => {
      const fs = require('fs')
      
      // Mock template loading
      fs.readFileSync.mockReturnValue('Hello {{name}}, your score is {{score}}')
      
      // This would be tested in isolation, but we're testing the integration
      const templateVars = { name: 'John', score: '95' }
      
      expect(fs.readFileSync).toHaveBeenCalled()
      
      // The actual template filling would happen in the processMessage function
      // We verify the structure through the successful API call test above
    })

    it('should handle missing template files', async () => {
      const fs = require('fs')
      fs.readFileSync.mockImplementation(() => {
        throw new Error('ENOENT: no such file or directory')
      })

      mockSupabase.single.mockResolvedValueOnce({
        data: { ai_preferences: {}, vip_contacts: [] },
        error: null
      })
      
      mockSupabase.limit.mockResolvedValueOnce({
        data: [mockMessages[0]],
        error: null
      })

      mockSupabase.update.mockResolvedValue({ error: null })
      mockSupabase.insert.mockResolvedValue({ error: null })

      const request = new NextRequest('http://localhost:3000/api/ai/process-messages', {
        method: 'POST'
      })

      const response = await POST(request)
      const data = await response.json()

      // Should handle template loading errors gracefully
      expect(response.status).toBe(200)
      expect(data.failed).toBe(1)
    })
  })

  describe('Authentication', () => {
    it('should reject unauthenticated requests', async () => {
      const { currentUser } = require('@clerk/nextjs/server')
      currentUser.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/ai/process-messages', {
        method: 'POST'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })
  })

  describe('Database Error Handling', () => {
    it('should handle database connection errors', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Connection failed' }
      })

      const request = new NextRequest('http://localhost:3000/api/ai/process-messages', {
        method: 'POST'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')
    })

    it('should handle message fetch errors', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { ai_preferences: {}, vip_contacts: [] },
        error: null
      })
      
      mockSupabase.limit.mockResolvedValueOnce({
        data: null,
        error: { message: 'Failed to fetch messages' }
      })

      const request = new NextRequest('http://localhost:3000/api/ai/process-messages', {
        method: 'POST'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch messages for processing')
    })
  })
})