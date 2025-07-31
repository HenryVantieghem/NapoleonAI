/**
 * Test Setup Configuration
 * 
 * Global setup for all tests including:
 * - Environment variable mocking
 * - Global mocks and utilities
 * - Test database setup (if needed)
 */

import { vi } from 'vitest'

// Mock environment variables
process.env.NODE_ENV = 'test'
process.env.OPENAI_API_KEY = 'test-openai-key'
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'test-clerk-publishable-key'
process.env.CLERK_SECRET_KEY = 'test-clerk-secret-key'

// Mock Next.js modules that are commonly used
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn()
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/test-path'
}))

// Mock Next.js server components
vi.mock('next/server', () => ({
  NextRequest: class MockNextRequest {
    constructor(public url: string, public init?: RequestInit) {}
    
    async json() {
      return this.init?.body ? JSON.parse(this.init.body as string) : {}
    }
  },
  
  NextResponse: {
    json: (data: any, init?: ResponseInit) => ({
      json: async () => data,
      status: init?.status || 200,
      ok: (init?.status || 200) >= 200 && (init?.status || 200) < 300
    }),
    redirect: (url: string, status = 302) => ({
      status,
      headers: { Location: url }
    })
  }
}))

// Mock crypto for UUID generation
global.crypto = {
  randomUUID: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9),
  // Add other crypto methods as needed
} as any

// Mock console methods to reduce test noise (optional)
global.console = {
  ...console,
  // Uncomment to suppress logs during tests
  // log: vi.fn(),
  // error: vi.fn(),
  // warn: vi.fn(),
  // info: vi.fn()
}

// Global test utilities
export const createMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  emailAddresses: [{ emailAddress: 'test@example.com' }],
  firstName: 'Test',
  lastName: 'User',
  ...overrides
})

export const createMockMessage = (overrides = {}) => ({
  id: 'test-message-id',
  user_id: 'test-user-id',
  source: 'gmail',
  external_id: 'external-123',
  sender: 'sender@example.com',
  subject: 'Test Subject',
  content: 'Test message content',
  priority_score: 50,
  ai_summary: null,
  created_at: new Date().toISOString(),
  processing_status: 'pending',
  is_vip: false,
  urgency_keywords: [],
  ...overrides
})

export const createMockProcessingLog = (overrides = {}) => ({
  id: 'test-log-id',
  user_id: 'test-user-id',
  batch_id: 'test-batch-id',
  operation_type: 'batch_process',
  message_count: 1,
  processing_time_ms: 1000,
  tokens_used: 100,
  cost_cents: 30,
  success_count: 1,
  error_count: 0,
  model_used: 'gpt-4',
  model_version: 'gpt-4-0613',
  processed_at: new Date().toISOString(),
  error_details: null,
  ...overrides
})

// Setup and teardown helpers
export const setupMockSupabase = () => {
  const mockSupabase = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    like: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    contains: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockReturnThis(),
    csv: vi.fn().mockReturnThis(),
    raw: vi.fn()
  }
  
  return mockSupabase
}

export const setupMockOpenAI = () => {
  const mockCompletion = {
    choices: [{
      message: {
        content: 'Mock AI response'
      }
    }],
    usage: {
      total_tokens: 50,
      prompt_tokens: 30,
      completion_tokens: 20
    }
  }
  
  const mockOpenAI = {
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue(mockCompletion)
      }
    }
  }
  
  return { mockOpenAI, mockCompletion }
}

// Test data generators
export const generateMockMessages = (count: number, userIds: string[] = ['user1']) => {
  return Array.from({ length: count }, (_, i) => createMockMessage({
    id: `msg_${i + 1}`,
    user_id: userIds[i % userIds.length],
    subject: `Test Subject ${i + 1}`,
    content: `Test message content ${i + 1}`,
    created_at: new Date(Date.now() - i * 60000).toISOString() // Stagger times
  }))
}

export const generateMockProcessingLogs = (count: number, userIds: string[] = ['user1']) => {
  const operations = ['batch_process', 'summarize', 'priority_score', 'extract_actions']
  
  return Array.from({ length: count }, (_, i) => createMockProcessingLog({
    id: `log_${i + 1}`,
    user_id: userIds[i % userIds.length],
    batch_id: `batch_${Math.floor(i / 5) + 1}`, // Group in batches of 5
    operation_type: operations[i % operations.length],
    tokens_used: 50 + (i * 10),
    cost_cents: 15 + (i * 3),
    processed_at: new Date(Date.now() - i * 300000).toISOString() // 5 min intervals
  }))
}

// Assertion helpers
export const expectValidMetrics = (metrics: any) => {
  expect(metrics).toHaveProperty('overview')
  expect(metrics.overview).toHaveProperty('totalRequests')
  expect(metrics.overview).toHaveProperty('successRate')
  expect(metrics.overview).toHaveProperty('totalTokens')
  expect(metrics.overview).toHaveProperty('totalCostCents')
  
  expect(metrics).toHaveProperty('operations')
  expect(metrics).toHaveProperty('timeline')
  expect(metrics).toHaveProperty('userStats')
  expect(metrics).toHaveProperty('costAnalysis')
  expect(metrics).toHaveProperty('recommendations')
  
  // Validate data types
  expect(typeof metrics.overview.totalRequests).toBe('number')
  expect(typeof metrics.overview.successRate).toBe('number')
  expect(Array.isArray(metrics.timeline)).toBe(true)
  expect(Array.isArray(metrics.recommendations)).toBe(true)
}

export const expectValidProcessingResult = (result: any) => {
  expect(result).toHaveProperty('messageId')
  expect(result).toHaveProperty('success')
  
  if (result.success) {
    expect(result).toHaveProperty('summary')
    expect(result).toHaveProperty('priorityScore')
    expect(result).toHaveProperty('actionItems')
  } else {
    expect(result).toHaveProperty('error')
  }
}