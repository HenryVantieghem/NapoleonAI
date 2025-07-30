import { test, expect } from '@playwright/test'

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login')
  })

  test('should display login page with luxury branding', async ({ page }) => {
    // Check for Napoleon AI branding
    await expect(page.locator('h1')).toContainText('Take Command Now')
    await expect(page.locator('text=Your executive intelligence headquarters')).toBeVisible()
    
    // Check for luxury styling elements
    await expect(page.locator('[class*="bg-gradient-gold"]')).toBeVisible()
    await expect(page.locator('[class*="shadow-luxury"]')).toBeVisible()
    
    // Check for animated crown logo
    await expect(page.locator('svg').first()).toBeVisible()
  })

  test('should display Clerk sign-in component', async ({ page }) => {
    // Check for Clerk sign-in form
    await expect(page.locator('[data-clerk-sign-in]')).toBeVisible()
  })

  test('should show OAuth provider information', async ({ page }) => {
    // Check for provider information section
    await expect(page.locator('h3:has-text("Connect Your Executive Platforms")')).toBeVisible()
    await expect(page.locator('text=Secure OAuth integration with enterprise-grade encryption')).toBeVisible()
    
    // Check for platform icons and status
    await expect(page.locator('text=Gmail')).toBeVisible()
    await expect(page.locator('text=Ready')).toBeVisible()
    await expect(page.locator('text=Slack')).toBeVisible()
    await expect(page.locator('text=Teams')).toBeVisible()
  })

  test('should display executive features section', async ({ page }) => {
    // Check for executive features
    await expect(page.locator('h3:has-text("Executive Command Center")')).toBeVisible()
    await expect(page.locator('text=Intelligence-driven leadership platform')).toBeVisible()
    
    // Check for feature highlights
    await expect(page.locator('text=VIP Intelligence')).toBeVisible()
    await expect(page.locator('text=Command Security')).toBeVisible()
  })

  test('should have terms and privacy links in footer', async ({ page }) => {
    // Check for legal links
    await expect(page.locator('a[href="/terms"]')).toBeVisible()
    await expect(page.locator('a[href="/privacy"]')).toBeVisible()
    await expect(page.locator('text=By signing in, you agree to our')).toBeVisible()
  })

  test('should be mobile responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Check that content is still visible and usable
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('[data-clerk-sign-in]')).toBeVisible()
    
    // Check that sections stack properly on mobile
    await expect(page.locator('h3:has-text("Connect Your Executive Platforms")')).toBeVisible()
  })

  test('should have proper color scheme', async ({ page }) => {
    // Check for navy and gold color scheme
    const navyElements = page.locator('[class*="navy"]')
    const goldElements = page.locator('[class*="gold"]')
    
    await expect(navyElements.first()).toBeVisible()
    await expect(goldElements.first()).toBeVisible()
  })

  test('should handle missing Clerk configuration gracefully', async ({ page, context }) => {
    // Mock missing Clerk configuration
    await context.route('**/*', route => {
      if (route.request().url().includes('clerk')) {
        route.abort()
      } else {
        route.continue()
      }
    })
    
    await page.reload()
    
    // Should show fallback message
    await expect(page.locator('text=Authentication service is being configured...')).toBeVisible()
  })

  test('should have animated elements', async ({ page }) => {
    // Check for Framer Motion animations
    const animatedCrown = page.locator('[class*="animate"]').first()
    await expect(animatedCrown).toBeVisible()
    
    // Check for sparkle animations
    const sparkles = page.locator('svg[class*="text-gold-400"]')
    await expect(sparkles.first()).toBeVisible()
  })

  test('should have proper accessibility', async ({ page }) => {
    // Check for proper heading hierarchy
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('h3')).toHaveCount(2)
    
    // Check for proper link structure
    const links = page.locator('a')
    const linkCount = await links.count()
    expect(linkCount).toBeGreaterThan(0)
    
    // Check for proper button structure
    const buttons = page.locator('button')
    for (let i = 0; i < await buttons.count(); i++) {
      await expect(buttons.nth(i)).toBeVisible()
    }
  })
})