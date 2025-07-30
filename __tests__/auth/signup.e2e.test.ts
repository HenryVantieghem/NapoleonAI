import { test, expect } from '@playwright/test'

test.describe('Sign Up Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/signup')
  })

  test('should display sign up page with luxury branding', async ({ page }) => {
    // Check for Napoleon AI branding
    await expect(page.locator('h1')).toContainText('Take Command Now')
    
    // Check for luxury styling elements
    await expect(page.locator('[class*="bg-gradient-gold"]')).toBeVisible()
    await expect(page.locator('[class*="shadow-luxury"]')).toBeVisible()
    
    // Check for executive messaging
    await expect(page.locator('text=Join the elite executive intelligence platform')).toBeVisible()
  })

  test('should show profile form when "Complete Profile First" is clicked', async ({ page }) => {
    await page.click('button:has-text("Complete Profile First")')
    
    // Check for profile form elements
    await expect(page.locator('h2:has-text("Executive Profile Setup")')).toBeVisible()
    await expect(page.locator('input[placeholder="Your executive name"]')).toBeVisible()
    await expect(page.locator('text=Executive Role')).toBeVisible()
    await expect(page.locator('text=Company Size')).toBeVisible()
  })

  test('should validate required fields in profile form', async ({ page }) => {
    await page.click('button:has-text("Complete Profile First")')
    
    // Try to submit without filling fields
    await page.click('button:has-text("Continue to Sign Up")')
    
    // Check for validation errors
    await expect(page.locator('text=Full name must be at least 2 characters')).toBeVisible()
    await expect(page.locator('text=Please select your role')).toBeVisible()
    await expect(page.locator('text=Please select your company size')).toBeVisible()
  })

  test('should allow profile form completion with valid data', async ({ page }) => {
    await page.click('button:has-text("Complete Profile First")')
    
    // Fill out the form
    await page.fill('input[placeholder="Your executive name"]', 'John Executive')
    await page.click('input[value="ceo"]')
    await page.click('input[value="200+"]')
    await page.click('input[type="checkbox"]') // Terms consent
    
    // Submit the form
    await page.click('button:has-text("Continue to Sign Up")')
    
    // Should show Clerk signup component
    await expect(page.locator('[data-clerk-sign-up]')).toBeVisible()
  })

  test('should display integration status correctly', async ({ page }) => {
    // Check for Gmail integration status
    await expect(page.locator('text=Gmail')).toBeVisible()
    await expect(page.locator('text=Ready')).toBeVisible()
    
    // Check for future integrations
    await expect(page.locator('text=Slack')).toBeVisible()
    await expect(page.locator('text=Teams')).toBeVisible()
    await expect(page.locator('text=Phase 2')).toHaveCount(2)
  })

  test('should have executive role options', async ({ page }) => {
    await page.click('button:has-text("Complete Profile First")')
    
    // Check for executive roles
    const roles = ['CEO', 'COO', 'CFO', 'CTO', 'Founder', 'VP', 'Director']
    
    for (const role of roles) {
      await expect(page.locator(`text=${role}`)).toBeVisible()
    }
  })

  test('should have company size options', async ({ page }) => {
    await page.click('button:has-text("Complete Profile First")')
    
    // Check for company size options
    const sizes = ['1-10 employees', '11-50 employees', '51-200 employees', '200+ employees']
    
    for (const size of sizes) {
      await expect(page.locator(`text=${size}`)).toBeVisible()
    }
  })

  test('should be mobile responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Check that content is still visible and usable
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('button:has-text("Complete Profile First")')).toBeVisible()
    
    // Check that form is responsive
    await page.click('button:has-text("Complete Profile First")')
    await expect(page.locator('input[placeholder="Your executive name"]')).toBeVisible()
  })

  test('should have proper accessibility attributes', async ({ page }) => {
    await page.click('button:has-text("Complete Profile First")')
    
    // Check for proper labels and ARIA attributes
    const nameInput = page.locator('input[placeholder="Your executive name"]')
    await expect(nameInput).toHaveAttribute('aria-describedby')
    
    // Check for proper form structure
    await expect(page.locator('label[for="fullName"]')).toBeVisible()
    await expect(page.locator('label[for="consentTerms"]')).toBeVisible()
  })
})