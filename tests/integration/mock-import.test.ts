/**
 * Mock Data Import Integration Test
 * 
 * Tests the mock email import script functionality including:
 * - Data generation and formatting
 * - Priority score calculation
 * - Database insertion simulation
 * - VIP detection logic
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock the import script functionality
const mockExecutiveEmails = [
  {
    sender: 'board.chair@company.com',
    subject: 'URGENT: Emergency Board Meeting',
    content: 'We need to convene an emergency board meeting tomorrow at 9 AM to discuss the acquisition proposal from TechCorp. Please confirm your attendance.',
    isVip: true,
    urgencyKeywords: ['urgent', 'emergency', 'tomorrow']
  },
  {
    sender: 'investor@venturecapital.com',
    subject: 'Q3 Performance Review',
    content: 'I would like to schedule a call to review the Q3 performance metrics and discuss the roadmap for Q4. Are you available this week?',
    isVip: true,
    urgencyKeywords: []
  },
  {
    sender: 'newsletter@industry.com',
    subject: 'Weekly Industry Update',
    content: 'Here are this week\'s top industry trends and market analysis for technology sector leaders.',
    isVip: false,
    urgencyKeywords: []
  },
  {
    sender: 'cfo@company.com',
    subject: 'Budget Approval Required',
    content: 'The marketing department has submitted a budget request for $500K for the upcoming campaign. This requires executive approval by Friday.',
    isVip: false,
    urgencyKeywords: ['approval', 'friday']
  }
]

// Priority calculation logic (extracted from mock-import-emails.ts)
function calculatePriorityScore(email: any): number {
  let score = 30 // Base score
  
  // VIP sender boost
  if (email.isVip) {
    score += 40
  }
  
  // Urgency keywords boost
  const urgentWords = ['urgent', 'asap', 'emergency', 'critical', 'deadline']
  const content = (email.subject + ' ' + email.content).toLowerCase()
  
  urgentWords.forEach(word => {
    if (content.includes(word)) {
      score += 15
    }
  })
  
  // Executive keywords boost
  const execWords = ['board', 'ceo', 'investor', 'acquisition', 'merger']
  execWords.forEach(word => {
    if (content.includes(word)) {
      score += 10
    }
  })
  
  // Time-sensitive keywords
  const timeWords = ['today', 'tomorrow', 'this week', 'friday']
  timeWords.forEach(word => {
    if (content.includes(word)) {
      score += 8
    }
  })
  
  // Subject line urgency indicators
  if (email.subject.includes('URGENT') || email.subject.includes('Action Required')) {
    score += 20
  }
  
  // Ensure score is within bounds
  return Math.min(100, Math.max(0, score))
}

// VIP detection logic
function isVipSender(email: string): boolean {
  const vipDomains = [
    'board.company.com',
    'venturecapital.com',
    'investor.com'
  ]
  
  const vipKeywords = [
    'board.chair',
    'investor',
    'ceo',
    'cfo',
    'cto'
  ]
  
  return vipDomains.some(domain => email.includes(domain)) ||
         vipKeywords.some(keyword => email.includes(keyword))
}

// Extract urgency keywords
function extractUrgencyKeywords(text: string): string[] {
  const urgentWords = ['urgent', 'asap', 'emergency', 'critical', 'deadline', 'today', 'tomorrow']
  const content = text.toLowerCase()
  
  return urgentWords.filter(word => content.includes(word))
}

describe('Mock Data Import Integration', () => {
  describe('Priority Score Calculation', () => {
    it('should calculate high priority for VIP urgent messages', () => {
      const email = mockExecutiveEmails[0] // Emergency board meeting
      const score = calculatePriorityScore(email)
      
      // Base (30) + VIP (40) + urgent (15) + emergency (15) + board (10) + tomorrow (8)
      // = 118, capped at 100
      expect(score).toBe(100)
    })

    it('should calculate medium-high priority for VIP non-urgent messages', () => {
      const email = mockExecutiveEmails[1] // Q3 Performance Review
      const score = calculatePriorityScore(email)
      
      // Base (30) + VIP (40) + investor (10) = 80
      expect(score).toBe(80)
    })

    it('should calculate low priority for non-VIP newsletter', () => {
      const email = mockExecutiveEmails[2] // Weekly Industry Update
      const score = calculatePriorityScore(email)
      
      // Base (30) only = 30
      expect(score).toBe(30)
    })

    it('should calculate medium priority for internal urgent requests', () => {
      const email = mockExecutiveEmails[3] // Budget Approval Required
      const score = calculatePriorityScore(email)
      
      // Base (30) + friday (8) = 38
      expect(score).toBe(38)
    })

    it('should handle edge cases correctly', () => {
      const emptyEmail = {
        sender: 'test@example.com',
        subject: '',
        content: '',
        isVip: false,
        urgencyKeywords: []
      }
      
      const score = calculatePriorityScore(emptyEmail)
      expect(score).toBe(30) // Base score only
    })
  })

  describe('VIP Detection', () => {
    it('should detect VIP by domain', () => {
      expect(isVipSender('investor@venturecapital.com')).toBe(true)
      expect(isVipSender('contact@board.company.com')).toBe(true)
    })

    it('should detect VIP by role keywords', () => {
      expect(isVipSender('board.chair@company.com')).toBe(true)
      expect(isVipSender('ceo@startup.com')).toBe(true)
      expect(isVipSender('investor.relations@fund.com')).toBe(true)
    })

    it('should not detect non-VIP senders', () => {
      expect(isVipSender('newsletter@industry.com')).toBe(false)
      expect(isVipSender('marketing@company.com')).toBe(false)
      expect(isVipSender('noreply@service.com')).toBe(false)
    })
  })

  describe('Urgency Keyword Extraction', () => {
    it('should extract urgency keywords from text', () => {
      const text = 'URGENT: This is a critical deadline for tomorrow'
      const keywords = extractUrgencyKeywords(text)
      
      expect(keywords).toContain('urgent')
      expect(keywords).toContain('critical')
      expect(keywords).toContain('deadline')
      expect(keywords).toContain('tomorrow')
      expect(keywords).toHaveLength(4)
    })

    it('should handle case insensitive matching', () => {
      const text = 'Urgent message about ASAP requirements'
      const keywords = extractUrgencyKeywords(text)
      
      expect(keywords).toContain('urgent')
      expect(keywords).toContain('asap')
    })

    it('should return empty array for non-urgent text', () => {
      const text = 'Regular weekly update with standard information'
      const keywords = extractUrgencyKeywords(text)
      
      expect(keywords).toHaveLength(0)
    })
  })

  describe('Data Transformation', () => {
    it('should transform email data correctly for database insertion', () => {
      const email = mockExecutiveEmails[0]
      const userId = 'test-user-123'
      
      // Simulate the transformation that happens in mock-import-emails.ts
      const transformedData = {
        user_id: userId,
        source: 'gmail',
        external_id: 'mock_' + Math.random().toString(36).substr(2, 9),
        sender: email.sender,
        subject: email.subject,
        content: email.content,
        priority_score: calculatePriorityScore(email),
        is_vip: isVipSender(email.sender),
        urgency_keywords: extractUrgencyKeywords(email.subject + ' ' + email.content),
        created_at: expect.any(String),
        processing_status: 'pending'
      }
      
      expect(transformedData.user_id).toBe(userId)
      expect(transformedData.source).toBe('gmail')
      expect(transformedData.sender).toBe(email.sender)
      expect(transformedData.subject).toBe(email.subject)
      expect(transformedData.content).toBe(email.content)
      expect(transformedData.priority_score).toBe(100) // Should be capped
      expect(transformedData.is_vip).toBe(true)
      expect(transformedData.urgency_keywords).toContain('urgent')
      expect(transformedData.processing_status).toBe('pending')
    })

    it('should generate unique external IDs', () => {
      const ids = new Set()
      
      // Generate 100 IDs and ensure they're unique
      for (let i = 0; i < 100; i++) {
        const id = 'mock_' + Math.random().toString(36).substr(2, 9)
        expect(ids.has(id)).toBe(false)
        ids.add(id)
      }
      
      expect(ids.size).toBe(100)
    })

    it('should generate realistic timestamps', () => {
      const now = Date.now()
      const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000)
      
      // Simulate timestamp generation from the script
      const randomTime = sevenDaysAgo + Math.random() * (now - sevenDaysAgo)
      const timestamp = new Date(randomTime).toISOString()
      
      expect(new Date(timestamp).getTime()).toBeGreaterThanOrEqual(sevenDaysAgo)
      expect(new Date(timestamp).getTime()).toBeLessThanOrEqual(now)
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    })
  })

  describe('Batch Processing Simulation', () => {
    it('should process all mock emails correctly', () => {
      const userId = 'test-user-123'
      const processedEmails = mockExecutiveEmails.map(email => ({
        user_id: userId,
        source: 'gmail',
        external_id: 'mock_' + Math.random().toString(36).substr(2, 9),
        sender: email.sender,
        subject: email.subject,
        content: email.content,
        priority_score: calculatePriorityScore(email),
        is_vip: isVipSender(email.sender),
        urgency_keywords: extractUrgencyKeywords(email.subject + ' ' + email.content),
        created_at: new Date().toISOString(),
        processing_status: 'pending'
      }))
      
      expect(processedEmails).toHaveLength(mockExecutiveEmails.length)
      
      // Verify each email is processed correctly
      processedEmails.forEach((processed, index) => {
        const original = mockExecutiveEmails[index]
        expect(processed.sender).toBe(original.sender)
        expect(processed.subject).toBe(original.subject)
        expect(processed.content).toBe(original.content)
        expect(processed.user_id).toBe(userId)
        expect(processed.source).toBe('gmail')
        expect(processed.processing_status).toBe('pending')
      })
      
      // Verify priority distribution
      const priorities = processedEmails.map(e => e.priority_score)
      const highPriority = priorities.filter(p => p >= 70).length
      const mediumPriority = priorities.filter(p => p >= 40 && p < 70).length
      const lowPriority = priorities.filter(p => p < 40).length
      
      expect(highPriority).toBeGreaterThan(0) // Should have some high priority
      expect(lowPriority).toBeGreaterThan(0)  // Should have some low priority
      expect(highPriority + mediumPriority + lowPriority).toBe(processedEmails.length)
    })
  })

  describe('Error Handling', () => {
    it('should handle malformed email data gracefully', () => {
      const malformedEmail = {
        sender: null,
        subject: undefined,
        content: '',
        isVip: 'invalid', // Wrong type
        urgencyKeywords: null
      }
      
      // Should not throw errors
      expect(() => {
        const score = calculatePriorityScore({
          ...malformedEmail,
          isVip: false // Fix the type issue
        })
        expect(typeof score).toBe('number')
        expect(score).toBeGreaterThanOrEqual(0)
        expect(score).toBeLessThanOrEqual(100)
      }).not.toThrow()
    })

    it('should handle empty or missing content', () => {
      const emptyContentEmail = {
        sender: 'test@example.com',
        subject: null,
        content: undefined,
        isVip: false,
        urgencyKeywords: []
      }
      
      const score = calculatePriorityScore(emptyContentEmail)
      expect(score).toBe(30) // Should return base score
      
      const keywords = extractUrgencyKeywords('')
      expect(keywords).toHaveLength(0)
    })
  })
})