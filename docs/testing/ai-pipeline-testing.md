# Napoleon AI - AI Pipeline Testing Guide

## Overview

This document outlines the comprehensive testing strategy for Napoleon AI's AI processing pipeline, including unit tests, integration tests, and end-to-end testing approaches.

## Testing Architecture

### Test Framework Stack
- **Unit/Integration Tests**: Vitest (modern, fast, TypeScript-first)
- **Component Tests**: Jest + React Testing Library (existing)
- **E2E Tests**: Playwright (existing)
- **API Testing**: Vitest with mock HTTP requests
- **Database Testing**: Supabase with test database

### Test Categories

#### 1. Unit Tests (`tests/ai/`)
- Individual function testing
- Pure logic validation
- Mock external dependencies
- Fast execution (< 100ms per test)

#### 2. Integration Tests (`tests/integration/`)
- Component interaction testing
- Database integration
- API endpoint testing
- External service mocking

#### 3. End-to-End Tests (`tests/e2e/`)
- Full user workflow testing
- Real browser automation
- Production-like environment

## Test Structure

### Directory Organization
```
tests/
├── setup.ts                 # Global test configuration
├── ai/                      # AI pipeline unit tests
│   ├── ai-processing.test.ts
│   ├── summarization.test.ts
│   └── metrics.test.ts
├── integration/             # Integration tests
│   ├── mock-import.test.ts
│   └── api-integration.test.ts
└── e2e/                     # End-to-end tests
    ├── ai-workflow.spec.ts
    └── dashboard.spec.ts
```

### Test File Naming Convention
- Unit tests: `*.test.ts`
- Integration tests: `*.test.ts` (in integration folder)
- E2E tests: `*.spec.ts`
- Test utilities: `*.util.ts`

## Running Tests

### Development Commands

```bash
# Run all AI pipeline tests
npm run test:ai

# Run specific test categories
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:e2e          # End-to-end tests

# Watch mode for development
npm run test:watch

# Coverage reporting
npm run test:coverage

# Full test suite
npm run test:all
```

### CI/CD Integration

```yaml
# GitHub Actions example
name: AI Pipeline Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with: { node-version: '18' }
      
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm run test:unit
      - run: npm run test:integration
      
      # E2E tests in separate job
      - name: Install Playwright
        run: npx playwright install
      - run: npm run test:e2e
```

## Test Coverage Requirements

### Minimum Coverage Targets
- **Overall Coverage**: 85%
- **AI Processing Functions**: 90%
- **API Routes**: 85%
- **Database Operations**: 80%
- **Error Handling**: 90%

### Coverage Exclusions
- Next.js generated files
- Configuration files
- Type definitions
- Test utilities
- Mock data

## Testing Patterns

### 1. AI Processing Tests

```typescript
describe('AI Message Processing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setupMockSupabase()
    setupMockOpenAI()
  })

  it('should process messages with AI analysis', async () => {
    // Arrange
    const mockMessages = generateMockMessages(3)
    mockSupabase.select.mockResolvedValue({ data: mockMessages })
    
    // Act
    const response = await POST(createMockRequest())
    const data = await response.json()
    
    // Assert
    expect(response.status).toBe(200)
    expect(data.processed).toBe(3)
    expect(data.successful).toBe(3)
  })
})
```

### 2. Database Integration Tests

```typescript
describe('Database Operations', () => {
  let testSupabase: SupabaseClient
  
  beforeAll(async () => {
    testSupabase = createTestClient()
    await setupTestData()
  })
  
  afterAll(async () => {
    await cleanupTestData()
  })
  
  it('should insert and retrieve messages correctly', async () => {
    const testMessage = createMockMessage()
    
    const { data, error } = await testSupabase
      .from('messages')
      .insert(testMessage)
      .select()
      .single()
    
    expect(error).toBeNull()
    expect(data.id).toBeDefined()
    expect(data.content).toBe(testMessage.content)
  })
})
```

### 3. API Endpoint Tests

```typescript
describe('API Route: /api/ai/summarise', () => {
  it('should require authentication', async () => {
    vi.mocked(currentUser).mockResolvedValue(null)
    
    const request = new NextRequest('http://localhost/api/ai/summarise', {
      method: 'POST',
      body: JSON.stringify({ messageId: 'test' })
    })
    
    const response = await POST(request)
    expect(response.status).toBe(401)
  })
  
  it('should validate request parameters', async () => {
    const request = new NextRequest('http://localhost/api/ai/summarise', {
      method: 'POST',
      body: JSON.stringify({}) // Missing messageId
    })
    
    const response = await POST(request)
    expect(response.status).toBe(400)
  })
})
```

## Test Data Management

### Mock Data Generation

```typescript
// Utility functions in tests/setup.ts
export const createMockMessage = (overrides = {}) => ({
  id: crypto.randomUUID(),
  user_id: 'test-user',
  content: 'Test message content',
  sender: 'test@example.com',
  subject: 'Test Subject',
  priority_score: 50,
  created_at: new Date().toISOString(),
  ...overrides
})

export const generateRealisticEmails = (count: number) => {
  const templates = [
    { subject: 'Board Meeting Agenda', priority: 90, isVip: true },
    { subject: 'Weekly Newsletter', priority: 30, isVip: false },
    { subject: 'Urgent: System Alert', priority: 85, isVip: false }
  ]
  
  return Array.from({ length: count }, (_, i) => {
    const template = templates[i % templates.length]
    return createMockMessage({
      subject: `${template.subject} ${i + 1}`,
      priority_score: template.priority + Math.floor(Math.random() * 10),
      is_vip: template.isVip
    })
  })
}
```

### Test Database Setup

```typescript
// For integration tests requiring real database
export const setupTestDatabase = async () => {
  const testClient = createClient(
    process.env.TEST_SUPABASE_URL,
    process.env.TEST_SUPABASE_ANON_KEY
  )
  
  // Run migrations
  await testClient.rpc('reset_test_data')
  
  return testClient
}
```

## Error Testing Strategies

### 1. Network Failures

```typescript
it('should handle OpenAI API failures gracefully', async () => {
  const mockOpenAI = setupMockOpenAI()
  mockOpenAI.chat.completions.create.mockRejectedValue(
    new Error('API rate limit exceeded')
  )
  
  const response = await processMessage(mockMessage)
  
  expect(response.success).toBe(false)
  expect(response.error).toContain('rate limit')
})
```

### 2. Database Errors

```typescript
it('should handle database connection failures', async () => {
  mockSupabase.select.mockRejectedValue(
    new Error('Connection timeout')
  )
  
  const response = await GET(createMockRequest())
  
  expect(response.status).toBe(500)
  expect(await response.json()).toMatchObject({
    error: 'Internal server error'
  })
})
```

### 3. Invalid Data

```typescript
it('should validate message data integrity', async () => {
  const invalidMessage = {
    id: null,
    content: '', // Empty content
    sender: 'invalid-email' // Invalid email format
  }
  
  const result = await processMessage(invalidMessage)
  
  expect(result.success).toBe(false)
  expect(result.error).toContain('validation')
})
```

## Performance Testing

### 1. Load Testing

```typescript
describe('Performance Tests', () => {
  it('should process large message batches efficiently', async () => {
    const largeMessageBatch = generateMockMessages(100)
    const startTime = Date.now()
    
    const results = await Promise.all(
      largeMessageBatch.map(msg => processMessage(msg))
    )
    
    const duration = Date.now() - startTime
    
    expect(duration).toBeLessThan(30000) // 30 seconds max
    expect(results.filter(r => r.success).length).toBeGreaterThan(95) // 95% success rate
  })
})
```

### 2. Memory Usage

```typescript
it('should not cause memory leaks with repeated processing', async () => {
  const initialMemory = process.memoryUsage().heapUsed
  
  // Process many messages in sequence
  for (let i = 0; i < 1000; i++) {
    await processMessage(createMockMessage())
  }
  
  // Force garbage collection if available
  if (global.gc) global.gc()
  
  const finalMemory = process.memoryUsage().heapUsed
  const memoryIncrease = finalMemory - initialMemory
  
  // Memory increase should be reasonable (< 50MB)
  expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024)
})
```

## Security Testing

### 1. Authentication Tests

```typescript
describe('Security: Authentication', () => {
  it('should reject requests without valid session', async () => {
    vi.mocked(currentUser).mockResolvedValue(null)
    
    const response = await POST(createMockRequest())
    expect(response.status).toBe(401)
  })
  
  it('should prevent cross-user data access', async () => {
    vi.mocked(currentUser).mockResolvedValue({ id: 'user1' })
    
    // Try to access user2's message
    const request = createMockRequest({
      body: { messageId: 'user2-message-id' }
    })
    
    mockSupabase.single.mockResolvedValue({ data: null }) // RLS blocks access
    
    const response = await POST(request)
    expect(response.status).toBe(404)
  })
})
```

### 2. Input Validation

```typescript
describe('Security: Input Validation', () => {
  it('should sanitize user inputs', async () => {
    const maliciousInput = {
      messageId: "'; DROP TABLE messages; --"
    }
    
    const request = createMockRequest({ body: maliciousInput })
    const response = await POST(request)
    
    // Should handle malicious input safely
    expect(response.status).toBe(400)
    
    // Verify database wasn't affected
    const { data } = await mockSupabase.from('messages').select('count')
    expect(data).toBeDefined() // Table still exists
  })
})
```

## Continuous Integration

### Test Pipeline Stages

1. **Static Analysis**
   - TypeScript compilation
   - ESLint checks
   - Import validation

2. **Unit Tests**
   - Fast, isolated tests
   - High coverage requirements
   - Mock all external dependencies

3. **Integration Tests**
   - Database interactions
   - API endpoint testing
   - Service integration

4. **E2E Tests**
   - Full user workflows
   - Browser automation
   - Production environment simulation

### Quality Gates

```yaml
# Required checks for PR merge
quality_gates:
  - test_coverage: 85%
  - unit_tests: passing
  - integration_tests: passing
  - security_scan: passing
  - performance_baseline: maintained
```

## Debugging Test Issues

### Common Problems and Solutions

1. **Test Timeouts**
   ```typescript
   // Increase timeout for slow operations
   it('should handle large processing jobs', async () => {
     // ... test code
   }, 30000) // 30 second timeout
   ```

2. **Mock Inconsistencies**
   ```typescript
   beforeEach(() => {
     vi.clearAllMocks() // Clear all mocks
     vi.resetAllMocks() // Reset mock implementations
   })
   ```

3. **Async Test Issues**
   ```typescript
   // Always await async operations
   it('should complete async operations', async () => {
     await expect(asyncFunction()).resolves.toBe(expectedValue)
   })
   ```

4. **Environment Variables**
   ```typescript
   // Mock env vars in tests
   beforeAll(() => {
     process.env.OPENAI_API_KEY = 'test-key'
   })
   ```

## Test Maintenance

### Regular Tasks
- Update test data to reflect schema changes
- Review and update coverage requirements
- Refresh mock implementations
- Validate test environment setup
- Monitor test execution times

### Best Practices
- Keep tests focused and isolated
- Use descriptive test names
- Mock external dependencies consistently
- Test both success and failure scenarios
- Maintain realistic test data
- Document complex test scenarios

---

**Next Steps for Full Implementation**:
1. Install test dependencies: `npm install vitest @vitest/coverage-v8 tsx`
2. Run initial test suite: `npm run test:ai`
3. Set up CI/CD pipeline with test automation
4. Configure test database for integration tests
5. Implement E2E tests for critical user flows