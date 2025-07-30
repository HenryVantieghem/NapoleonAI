import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { getSession, requireAuth, isExecutiveUser, isCSuiteUser, getUserPriorityThreshold } from '../session'

// Mock Clerk
jest.mock('@clerk/nextjs/server', () => ({
  currentUser: jest.fn()
}))

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn()
        }))
      }))
    }))
  }))
}))

// Mock Next.js redirect
jest.mock('next/navigation', () => ({
  redirect: jest.fn()
}))

describe('Session Management', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('User Role Classification', () => {
    it('should identify executive users correctly', () => {
      const executiveSession = {
        id: '1',
        email: 'ceo@company.com',
        name: 'John CEO',
        role: 'ceo',
        onboardingCompleted: true,
        subscriptionStatus: 'active',
        mfaEnabled: true,
        lastLoginAt: new Date().toISOString()
      }

      expect(isExecutiveUser(executiveSession)).toBe(true)
      expect(isCSuiteUser(executiveSession)).toBe(true)
    })

    it('should identify non-executive users correctly', () => {
      const nonExecutiveSession = {
        id: '2',
        email: 'employee@company.com',
        name: 'Jane Employee',
        role: 'analyst',
        onboardingCompleted: true,
        subscriptionStatus: 'active',
        mfaEnabled: false,
        lastLoginAt: new Date().toISOString()
      }

      expect(isExecutiveUser(nonExecutiveSession)).toBe(false)
      expect(isCSuiteUser(nonExecutiveSession)).toBe(false)
    })

    it('should set correct priority thresholds', () => {
      const ceoSession = {
        id: '1',
        email: 'ceo@company.com',
        name: 'John CEO',
        role: 'ceo',
        onboardingCompleted: true,
        subscriptionStatus: 'active',
        mfaEnabled: true,
        lastLoginAt: new Date().toISOString()
      }

      const vpSession = {
        id: '2',
        email: 'vp@company.com',
        name: 'Jane VP',
        role: 'vp',
        onboardingCompleted: true,
        subscriptionStatus: 'active',
        mfaEnabled: false,
        lastLoginAt: new Date().toISOString()
      }

      const employeeSession = {
        id: '3',
        email: 'employee@company.com',
        name: 'Bob Employee',
        role: 'analyst',
        onboardingCompleted: true,
        subscriptionStatus: 'active',
        mfaEnabled: false,
        lastLoginAt: new Date().toISOString()
      }

      expect(getUserPriorityThreshold(ceoSession)).toBe(80)
      expect(getUserPriorityThreshold(vpSession)).toBe(70)
      expect(getUserPriorityThreshold(employeeSession)).toBe(60)
    })
  })
})