/**
 * AI Metrics Tests
 * 
 * Tests for the metrics and monitoring functionality including:
 * - Metrics calculation and aggregation
 * - Time-based filtering
 * - User and operation breakdowns
 * - Cost analysis
 * - Recommendations generation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/admin/metrics/route'
import { createServiceClient } from '@/lib/supabase/server'

// Mock dependencies
vi.mock('@clerk/nextjs/server', () => ({
  currentUser: vi.fn()
}))

vi.mock('@/lib/supabase/server', () => ({
  createServiceClient: vi.fn()
}))

describe('AI Metrics API', () => {
  const mockUser = {
    id: 'admin_123',
    emailAddresses: [{ emailAddress: 'admin@company.com' }]
  }

  const mockSupabase = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    slice: vi.fn()
  }

  // Mock processing logs data
  const mockProcessingLogs = [
    {
      id: 'log_1',
      user_id: 'user_1',
      batch_id: 'batch_1',
      operation_type: 'batch_process',
      message_count: 5,
      processing_time_ms: 2500,
      tokens_used: 150,
      cost_cents: 45,
      success_count: 5,
      error_count: 0,
      model_used: 'gpt-4',
      processed_at: new Date().toISOString()
    },
    {
      id: 'log_2',
      user_id: 'user_1',
      batch_id: 'batch_2',
      operation_type: 'summarize',
      message_count: 1,
      processing_time_ms: 800,
      tokens_used: 75,
      cost_cents: 23,
      success_count: 1,
      error_count: 0,
      model_used: 'gpt-4',
      processed_at: new Date().toISOString()
    },
    {
      id: 'log_3',
      user_id: 'user_2',
      batch_id: 'batch_3',
      operation_type: 'batch_process',
      message_count: 3,
      processing_time_ms: 5000,
      tokens_used: 200,
      cost_cents: 60,
      success_count: 2,
      error_count: 1,
      model_used: 'gpt-4',
      processed_at: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
    }
  ]

  // Mock messages data
  const mockMessages = [
    {
      id: 'msg_1',
      user_id: 'user_1',
      processing_status: 'completed',
      created_at: new Date().toISOString()
    },
    {
      id: 'msg_2',
      user_id: 'user_1',
      processing_status: 'completed',
      created_at: new Date().toISOString()
    },
    {
      id: 'msg_3',
      user_id: 'user_2',
      processing_status: 'pending',
      created_at: new Date().toISOString()
    },
    {
      id: 'msg_4',
      user_id: 'user_2',
      processing_status: 'failed',
      created_at: new Date().toISOString()
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock current user (admin)
    const { currentUser } = require('@clerk/nextjs/server')
    currentUser.mockResolvedValue(mockUser)
    
    // Mock Supabase client
    const { createServiceClient } = require('@/lib/supabase/server')
    createServiceClient.mockReturnValue(mockSupabase)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('GET /api/admin/metrics', () => {
    it('should return comprehensive metrics for 24h timeframe', async () => {
      // Mock logs query
      mockSupabase.gte.mockReturnValueOnce(mockSupabase)
      mockSupabase.select.mockResolvedValueOnce({
        data: mockProcessingLogs,
        error: null
      })

      // Mock messages query
      mockSupabase.gte.mockReturnValueOnce(mockSupabase)
      mockSupabase.select.mockResolvedValueOnce({
        data: mockMessages,
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/admin/metrics?timeframe=24h', {
        method: 'GET'
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.timeframe).toBe('24h')
      expect(data.metrics).toBeDefined()
      
      // Check overview metrics
      const { overview } = data.metrics
      expect(overview.totalRequests).toBe(3)
      expect(overview.successfulRequests).toBe(3) // All logs have success_count > 0
      expect(overview.failedRequests).toBe(1) // One log has error_count > 0
      expect(overview.totalTokens).toBe(425) // 150 + 75 + 200
      expect(overview.totalCostCents).toBe(128) // 45 + 23 + 60
      expect(overview.totalMessages).toBe(4)
      expect(overview.activeUsers).toBe(2)
    })

    it('should filter by operation type', async () => {
      const summarizeLogs = mockProcessingLogs.filter(log => log.operation_type === 'summarize')
      
      mockSupabase.eq.mockReturnValueOnce(mockSupabase)
      mockSupabase.gte.mockReturnValueOnce(mockSupabase)
      mockSupabase.select.mockResolvedValueOnce({
        data: summarizeLogs,
        error: null
      })

      mockSupabase.gte.mockReturnValueOnce(mockSupabase)
      mockSupabase.select.mockResolvedValueOnce({
        data: mockMessages,
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/admin/metrics?operation=summarize', {
        method: 'GET'
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.operation).toBe('summarize')
      expect(data.metrics.overview.totalRequests).toBe(1)
      expect(data.metrics.operations.summarize).toBeDefined()
      expect(data.metrics.operations.batch_process).toBeUndefined()
    })

    it('should filter by user ID', async () => {
      const user1Logs = mockProcessingLogs.filter(log => log.user_id === 'user_1')
      const user1Messages = mockMessages.filter(msg => msg.user_id === 'user_1')
      
      mockSupabase.eq.mockReturnValueOnce(mockSupabase)
      mockSupabase.gte.mockReturnValueOnce(mockSupabase)
      mockSupabase.select.mockResolvedValueOnce({
        data: user1Logs,
        error: null
      })

      mockSupabase.eq.mockReturnValueOnce(mockSupabase)
      mockSupabase.gte.mockReturnValueOnce(mockSupabase)
      mockSupabase.select.mockResolvedValueOnce({
        data: user1Messages,
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/admin/metrics?userId=user_1', {
        method: 'GET'
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.userId).toBe('user_1')
      expect(data.metrics.overview.totalRequests).toBe(2)
      expect(data.metrics.overview.activeUsers).toBe(1)
    })

    it('should handle different timeframes', async () => {
      mockSupabase.gte.mockReturnValueOnce(mockSupabase)
      mockSupabase.select.mockResolvedValueOnce({
        data: mockProcessingLogs,
        error: null
      })

      mockSupabase.gte.mockReturnValueOnce(mockSupabase)
      mockSupabase.select.mockResolvedValueOnce({
        data: mockMessages,
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/admin/metrics?timeframe=7d', {
        method: 'GET'
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.timeframe).toBe('7d')
    })

    it('should calculate operation breakdown correctly', async () => {
      mockSupabase.gte.mockReturnValueOnce(mockSupabase)
      mockSupabase.select.mockResolvedValueOnce({
        data: mockProcessingLogs,
        error: null
      })

      mockSupabase.gte.mockReturnValueOnce(mockSupabase)
      mockSupabase.select.mockResolvedValueOnce({
        data: mockMessages,
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/admin/metrics', {
        method: 'GET'
      })

      const response = await GET(request)
      const data = await response.json()

      const { operations } = data.metrics
      
      // batch_process: 2 logs, 1 with error
      expect(operations.batch_process.requests).toBe(2)
      expect(operations.batch_process.errors).toBe(1)
      expect(operations.batch_process.errorRate).toBe(50) // 1/2 * 100
      
      // summarize: 1 log, no errors
      expect(operations.summarize.requests).toBe(1)
      expect(operations.summarize.errors).toBe(0)
      expect(operations.summarize.errorRate).toBe(0)
    })

    it('should generate timeline data', async () => {
      mockSupabase.gte.mockReturnValueOnce(mockSupabase)
      mockSupabase.select.mockResolvedValueOnce({
        data: mockProcessingLogs,
        error: null
      })

      mockSupabase.gte.mockReturnValueOnce(mockSupabase)
      mockSupabase.select.mockResolvedValueOnce({
        data: mockMessages,
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/admin/metrics', {
        method: 'GET'
      })

      const response = await GET(request)
      const data = await response.json()

      expect(data.metrics.timeline).toBeDefined()
      expect(Array.isArray(data.metrics.timeline)).toBe(true)
      expect(data.metrics.timeline.length).toBeGreaterThan(0)
      
      // Timeline should be sorted by timestamp
      const timeline = data.metrics.timeline
      for (let i = 1; i < timeline.length; i++) {
        expect(timeline[i].timestamp >= timeline[i-1].timestamp).toBe(true)
      }
    })

    it('should calculate cost analysis', async () => {
      mockSupabase.gte.mockReturnValueOnce(mockSupabase)
      mockSupabase.select.mockResolvedValueOnce({
        data: mockProcessingLogs,
        error: null
      })

      mockSupabase.gte.mockReturnValueOnce(mockSupabase)
      mockSupabase.select.mockResolvedValueOnce({
        data: mockMessages,
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/admin/metrics', {
        method: 'GET'
      })

      const response = await GET(request)
      const data = await response.json()

      const { costAnalysis } = data.metrics
      
      expect(costAnalysis.totalCostCents).toBe(128)
      expect(costAnalysis.totalCostDollars).toBe(1.28)
      expect(costAnalysis.avgCostPerRequest).toBe(42.67) // 128/3 rounded
      expect(costAnalysis.costByOperation.batch_process).toBe(105) // 45 + 60
      expect(costAnalysis.costByOperation.summarize).toBe(23)
    })

    it('should generate recommendations', async () => {
      // Create logs with high error rate to trigger recommendations
      const highErrorLogs = [
        ...mockProcessingLogs,
        {
          id: 'log_4',
          user_id: 'user_3',
          batch_id: 'batch_4',
          operation_type: 'batch_process',
          message_count: 5,
          processing_time_ms: 15000, // High latency
          tokens_used: 500,
          cost_cents: 15000, // High cost
          success_count: 0,
          error_count: 5, // All failed
          model_used: 'gpt-4',
          processed_at: new Date().toISOString()
        }
      ]

      mockSupabase.gte.mockReturnValueOnce(mockSupabase)
      mockSupabase.select.mockResolvedValueOnce({
        data: highErrorLogs,
        error: null
      })

      mockSupabase.gte.mockReturnValueOnce(mockSupabase)
      mockSupabase.select.mockResolvedValueOnce({
        data: mockMessages,
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/admin/metrics', {
        method: 'GET'
      })

      const response = await GET(request)
      const data = await response.json()

      const { recommendations } = data.metrics
      
      expect(recommendations).toBeDefined()
      expect(recommendations.length).toBeGreaterThan(0)
      
      // Should have recommendations for high error rate, latency, and cost
      const types = recommendations.map(r => r.type)
      expect(types).toContain('reliability')
      expect(types).toContain('performance')
      expect(types).toContain('cost')
    })

    it('should include sample logs for debugging', async () => {
      mockSupabase.gte.mockReturnValueOnce(mockSupabase)
      mockSupabase.select.mockResolvedValueOnce({
        data: mockProcessingLogs,
        error: null
      })

      mockSupabase.gte.mockReturnValueOnce(mockSupabase)
      mockSupabase.select.mockResolvedValueOnce({
        data: mockMessages,
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/admin/metrics', {
        method: 'GET'
      })

      const response = await GET(request)
      const data = await response.json()

      expect(data.sampleLogs).toBeDefined()
      expect(Array.isArray(data.sampleLogs)).toBe(true)
      expect(data.sampleLogs.length).toBeLessThanOrEqual(10)
      
      if (data.sampleLogs.length > 0) {
        const sample = data.sampleLogs[0]
        expect(sample).toHaveProperty('id')
        expect(sample).toHaveProperty('operation_type')
        expect(sample).toHaveProperty('processed_at')
        expect(sample).toHaveProperty('success_count')
        expect(sample).toHaveProperty('error_count')
      }
    })

    it('should handle database errors gracefully', async () => {
      mockSupabase.gte.mockReturnValueOnce(mockSupabase)
      mockSupabase.select.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database connection failed' }
      })

      const request = new NextRequest('http://localhost:3000/api/admin/metrics', {
        method: 'GET'
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch logs')
    })

    it('should reject unauthorized requests', async () => {
      const { currentUser } = require('@clerk/nextjs/server')
      currentUser.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/admin/metrics', {
        method: 'GET'
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should handle empty data gracefully', async () => {
      mockSupabase.gte.mockReturnValueOnce(mockSupabase)
      mockSupabase.select.mockResolveValue({
        data: [],
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/admin/metrics', {
        method: 'GET'
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.metrics.overview.totalRequests).toBe(0)
      expect(data.metrics.overview.successRate).toBe(0)
      expect(data.metrics.operations).toEqual({})
      expect(data.metrics.timeline).toEqual([])
    })
  })

  describe('POST /api/admin/metrics', () => {
    it('should trigger metrics recalculation', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/metrics', {
        method: 'POST',
        body: JSON.stringify({ action: 'recalculate', timeframe: '24h' }),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('Metrics recalculation triggered')
    })

    it('should reject invalid actions', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/metrics', {
        method: 'POST',
        body: JSON.stringify({ action: 'invalid' }),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid action')
    })

    it('should reject unauthorized requests', async () => {
      const { currentUser } = require('@clerk/nextjs/server')
      currentUser.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/admin/metrics', {
        method: 'POST',
        body: JSON.stringify({ action: 'recalculate' }),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })
  })

  describe('Metrics Calculations', () => {
    it('should calculate success rate correctly', async () => {
      const mixedLogs = [
        { success_count: 5, error_count: 0 }, // success
        { success_count: 3, error_count: 2 }, // mixed (counted as success)
        { success_count: 0, error_count: 1 }, // failure
        { success_count: 2, error_count: 0 }  // success
      ]

      mockSupabase.gte.mockReturnValueOnce(mockSupabase)
      mockSupabase.select.mockResolvedValueOnce({
        data: mixedLogs.map((log, i) => ({ ...mockProcessingLogs[0], ...log, id: `log_${i}` })),
        error: null
      })

      mockSupabase.gte.mockReturnValueOnce(mockSupabase)
      mockSupabase.select.mockResolvedValueOnce({
        data: mockMessages,
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/admin/metrics', {
        method: 'GET'
      })

      const response = await GET(request)
      const data = await response.json()

      // 3 successful requests out of 4 total = 75%
      expect(data.metrics.overview.successRate).toBe(75)
      expect(data.metrics.overview.successfulRequests).toBe(3)
      expect(data.metrics.overview.failedRequests).toBe(1)
    })

    it('should handle user statistics correctly', async () => {
      mockSupabase.gte.mockReturnValueOnce(mockSupabase)
      mockSupabase.select.mockResolvedValueOnce({
        data: mockProcessingLogs,
        error: null
      })

      mockSupabase.gte.mockReturnValueOnce(mockSupabase)
      mockSupabase.select.mockResolvedValueOnce({
        data: mockMessages,
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/admin/metrics', {
        method: 'GET'
      })

      const response = await GET(request)
      const data = await response.json()

      const { userStats } = data.metrics
      
      expect(userStats.totalUsers).toBe(2)
      expect(userStats.topUsers).toBeDefined()
      expect(userStats.topUsers.length).toBeGreaterThan(0)
      
      // Should be sorted by request count
      const topUser = userStats.topUsers[0]
      expect(topUser).toHaveProperty('userId')
      expect(topUser).toHaveProperty('requests')
      expect(topUser).toHaveProperty('tokens')
      expect(topUser).toHaveProperty('cost')
    })
  })
})