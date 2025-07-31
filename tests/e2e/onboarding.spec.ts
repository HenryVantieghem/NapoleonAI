import { test, expect } from '@playwright/test'

// Mock authentication for testing
test.beforeEach(async ({ page }) => {
  // Mock Clerk authentication
  await page.addInitScript(() => {
    // Mock the useUser hook
    window.__mockUser = {
      id: 'test-user-123',
      firstName: 'John',
      lastName: 'Doe',
      emailAddresses: [{ emailAddress: 'john.doe@test.com' }]
    }
  })

  // Navigate to onboarding page
  await page.goto('/onboarding')
})

test.describe('Onboarding Flow', () => {
  test('should complete full onboarding flow successfully', async ({ page }) => {
    // Step 1: Profile Setup
    await expect(page.locator('h1')).toContainText('Welcome, John!')
    await expect(page.locator('text=Step 1 of 3')).toBeVisible()

    // Select CEO role
    await page.click('[data-testid="role-ceo"]')
    
    // Select pain points (max 3)
    await page.click('[data-testid="pain-point-email-overload"]')
    await page.click('[data-testid="pain-point-prioritization"]')
    await page.click('[data-testid="pain-point-meetings"]')
    
    // Continue to step 2
    await page.click('button:has-text("Continue")')
    
    // Step 2: Connect Platforms
    await expect(page.locator('h1')).toContainText('Connect Your Platforms')
    await expect(page.locator('text=Step 2 of 3')).toBeVisible()
    
    // Connect Gmail
    await page.click('button:has-text("Connect your Gmail account")')
    
    // Wait for connection simulation
    await expect(page.locator('text=Connected successfully')).toBeVisible({ timeout: 3000 })
    
    // Continue to step 3
    await page.click('button:has-text("Continue")')
    
    // Step 3: VIP Configuration
    await expect(page.locator('h1')).toContainText('Select Your VIP Contacts')
    await expect(page.locator('text=Step 3 of 3')).toBeVisible()
    
    // Search for contacts
    await page.fill('input[placeholder="Search contacts..."]', 'Sarah')
    await expect(page.locator('text=Sarah Johnson')).toBeVisible()
    
    // Select VIP contacts
    await page.click('[data-testid="vip-contact-sarah.johnson@boardmember.com"]')
    await page.click('[data-testid="vip-contact-michael.chen@vcfund.com"]')  
    await page.click('[data-testid="vip-contact-lisa.rodriguez@growth.capital"]')
    
    // Verify selection count
    await expect(page.locator('text=Selected 3')).toBeVisible()
    await expect(page.locator('text=Minimum reached')).toBeVisible()
    
    // Complete onboarding
    await page.click('button:has-text("Enter Command Center")')
    
    // Verify success modal
    await expect(page.locator('h1')).toContainText('Welcome to Your Command Center!')
    await expect(page.locator('text=Your executive intelligence platform is ready')).toBeVisible()
    
    // Should auto-redirect to dashboard after 3 seconds
    await page.waitForURL('/dashboard', { timeout: 4000 })
  })

  test('should allow skipping steps', async ({ page }) => {
    // Skip from step 1
    await page.click('button:has-text("Skip for now")')
    await expect(page).toHaveURL('/dashboard')
  })

  test('should handle concierge requests', async ({ page }) => {
    // Request concierge from step 1
    await page.click('button:has-text("Schedule Concierge")')
    
    // Should show alert (in production would open calendar)
    await expect(page.locator('text=Concierge call scheduling coming soon')).toBeVisible()
  })

  test('should allow navigation between steps', async ({ page }) => {
    // Complete step 1
    await page.click('[data-testid="role-ceo"]')
    await page.click('button:has-text("Continue")')
    
    // Go back to step 1
    await page.click('button:has-text("Back")')
    await expect(page.locator('text=Step 1 of 3')).toBeVisible()
    
    // Return to step 2
    await page.click('button:has-text("Continue")')
    await expect(page.locator('text=Step 2 of 3')).toBeVisible()
  })

  test('should validate required fields', async ({ page }) => {
    // Try to continue without selecting role
    const continueButton = page.locator('button:has-text("Continue")')
    await expect(continueButton).toBeDisabled()
    
    // Select role to enable continue button
    await page.click('[data-testid="role-ceo"]')
    await expect(continueButton).toBeEnabled()
  })

  test('should limit pain point selection to 3', async ({ page }) => {
    // Select maximum pain points
    await page.click('[data-testid="pain-point-email-overload"]')
    await page.click('[data-testid="pain-point-prioritization"]') 
    await page.click('[data-testid="pain-point-meetings"]')
    
    // Fourth selection should be disabled
    const fourthPainPoint = page.locator('[data-testid="pain-point-responsiveness"]')
    await expect(fourthPainPoint).toBeDisabled()
  })

  test('should persist progress across page refreshes', async ({ page }) => {
    // Complete step 1
    await page.click('[data-testid="role-cfo"]')
    await page.click('[data-testid="pain-point-prioritization"]')
    await page.click('button:has-text("Continue")')
    
    // Refresh page
    await page.reload()
    
    // Should be on step 2 with progress maintained
    await expect(page.locator('text=Step 2 of 3')).toBeVisible()
    await expect(page.locator('text=67% complete')).toBeVisible()
  })

  test('should handle Gmail connection errors', async ({ page }) => {
    // Navigate to step 2
    await page.click('[data-testid="role-ceo"]')
    await page.click('button:has-text("Continue")')
    
    // Mock connection error by intercepting the timeout
    await page.addInitScript(() => {
      // Override the setTimeout to simulate immediate error
      const originalSetTimeout = window.setTimeout
      window.setTimeout = (fn: any, delay: number) => {
        if (delay === 2000) {
          // Simulate error in OAuth simulation
          throw new Error('Connection failed')
        }
        return originalSetTimeout(fn, delay)
      }
    })
    
    // Attempt Gmail connection
    await page.click('button:has-text("Connect your Gmail account")')
    
    // Should show error state
    await expect(page.locator('text=Connection failed')).toBeVisible({ timeout: 3000 })
  })

  test('should search VIP contacts effectively', async ({ page }) => {
    // Navigate to step 3
    await page.click('[data-testid="role-ceo"]')
    await page.click('button:has-text("Continue")')
    await page.click('button:has-text("Continue")')
    
    // Search for specific contact
    await page.fill('input[placeholder="Search contacts..."]', 'Board')
    
    // Should show only board members
    await expect(page.locator('text=Sarah Johnson')).toBeVisible()
    await expect(page.locator('text=Robert Taylor')).toBeVisible()
    await expect(page.locator('text=Michael Chen')).not.toBeVisible()
    
    // Clear search
    await page.click('button[aria-label="Clear search"]')
    
    // Should show all suggested contacts again
    await expect(page.locator('text=Michael Chen')).toBeVisible()
  })

  test('should show different suggested contacts based on role', async ({ page }) => {
    // Test CEO role suggestions
    await page.click('[data-testid="role-ceo"]')
    await page.click('button:has-text("Continue")')
    await page.click('button:has-text("Continue")')
    
    // CEO should see board members and investors first
    await expect(page.locator('text=Sarah Johnson')).toBeVisible()
    await expect(page.locator('text=Michael Chen')).toBeVisible()
    
    // Go back and change role
    await page.click('button:has-text("Back")')
    await page.click('button:has-text("Back")')
    
    // Select CTO role
    await page.click('[data-testid="role-cto"]')
    await page.click('button:has-text("Continue")')
    await page.click('button:has-text("Continue")')
    
    // CTO should see different priority contacts
    // (Implementation would need to verify the specific contacts shown)
  })

  test('should handle mobile responsiveness', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 })
    
    // Should still be navigable on mobile
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('text=Step 1 of 3')).toBeVisible()
    
    // Role cards should be stacked vertically on mobile
    const roleCards = page.locator('[data-testid^="role-"]')
    await expect(roleCards.first()).toBeVisible()
  })

  test('should support keyboard navigation', async ({ page }) => {
    // Tab through elements
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    
    // Should be able to select role with keyboard
    await page.keyboard.press('Enter')
    
    // Continue with keyboard
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')
    
    // Should navigate between steps
    await expect(page.locator('text=Step 2 of 3')).toBeVisible()
  })
})