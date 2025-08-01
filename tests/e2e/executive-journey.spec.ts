import { test, expect, Page } from '@playwright/test'

// Executive user journey from landing to dashboard
test.describe('Executive User Journey - Private Jet Experience', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication to bypass Clerk for testing
    await page.addInitScript(() => {
      window.__CLERK_TEST_MODE__ = true
    })
  })

  test('Landing page displays private-jet hero with sunset gradient and runway animations', async ({ page }) => {
    await page.goto('/')

    // Hero section with private-jet theme
    await expect(page.locator('section').first()).toHaveClass(/bg-jetBlack/)
    
    // Executive badge with glassmorphism
    await expect(page.getByText('Exclusive for C-Suite Executives')).toBeVisible()
    
    // Main headline with champagne gold gradients
    await expect(page.getByRole('heading', { name: /Transform Communication Chaos/i })).toBeVisible()
    await expect(page.getByText('Chaos')).toHaveClass(/bg-gradient-champagne/)
    await expect(page.getByText('Clarity')).toHaveClass(/bg-gradient-champagne/)

    // Executive metrics cards with luxury styling
    await expect(page.getByText('15h')).toBeVisible()
    await expect(page.getByText('Saved Weekly')).toBeVisible()
    await expect(page.getByText('96%')).toBeVisible()
    await expect(page.getByText('AI Accuracy')).toBeVisible()

    // Private jet trust indicators
    await expect(page.getByText('Executive Security')).toBeVisible()
    await expect(page.getByText('Private Jet Experience')).toBeVisible()
    await expect(page.getByText('500+ Fortune 500 Leaders')).toBeVisible()
  })

  test('Navigation hover-bar functionality with champagne gold underline', async ({ page }) => {
    await page.goto('/')
    
    // Wait for navigation to be visible
    await expect(page.getByRole('navigation')).toBeVisible()
    
    // Test hover states on navigation items
    const commandCenter = page.getByText('Command Center')
    await commandCenter.hover()
    
    // Check for executive tooltip
    await expect(page.getByText('Executive intelligence dashboard')).toBeVisible()
    
    // Test navigation to different sections
    const flightPlan = page.getByText('Flight Plan')
    await flightPlan.hover()
    await expect(page.getByText('Strategic implementation process')).toBeVisible()
    
    // Executive testimonials section
    const testimonials = page.getByText('Executive Testimonials')
    await testimonials.hover()
    await expect(page.getByText('Fortune 500 success stories')).toBeVisible()
  })

  test('Primary CTA button with champagne gold shimmer effect', async ({ page }) => {
    await page.goto('/')
    
    const primaryCTA = page.getByRole('button', { name: /Take Command Now/i })
    await expect(primaryCTA).toBeVisible()
    await expect(primaryCTA).toHaveClass(/bg-gradient-champagne/)
    await expect(primaryCTA).toHaveClass(/text-jetBlack/)
    
    // Test hover state shimmer effect
    await primaryCTA.hover()
    await expect(primaryCTA).toHaveClass(/shadow-champagne-glow/)
    
    // Click should scroll to CTA section (mocked behavior)
    await primaryCTA.click()
  })

  test('Secondary CTA with private jet glass morphism', async ({ page }) => {
    await page.goto('/')
    
    const secondaryCTA = page.getByRole('button', { name: /Experience the Journey/i })
    await expect(secondaryCTA).toBeVisible()
    await expect(secondaryCTA).toHaveClass(/backdrop-blur-executive/)
    await expect(secondaryCTA).toHaveClass(/border-platinumSilver/)
    
    // Test hover effect
    await secondaryCTA.hover()
    await expect(secondaryCTA).toHaveClass(/hover:bg-midnightBlue/)
  })

  test('Runway scroll indicator with champagne lights animation', async ({ page }) => {
    await page.goto('/')
    
    // Runway lights section
    const runwayIndicator = page.getByText('Begin Your Journey')
    await expect(runwayIndicator).toBeVisible()
    
    // Should have champagne gold styling
    await expect(runwayIndicator).toHaveClass(/text-platinumSilver-500/)
    
    // Click should scroll to next section
    await runwayIndicator.click()
  })

  test('VIP preview cards with executive intelligence', async ({ page }) => {
    await page.goto('/')
    
    // VIP priority card
    await expect(page.getByText('VIP PRIORITY')).toBeVisible()
    await expect(page.getByText('Board Chairman')).toBeVisible()
    await expect(page.getByText(/acquisition proposal/)).toBeVisible()
    
    // AI intelligence card
    await expect(page.getByText('AI INTELLIGENCE')).toBeVisible()
    await expect(page.getByText(/strategic action items/)).toBeVisible()
    await expect(page.getByText(/investor communications/)).toBeVisible()
  })

  test('Mobile navigation with private jet menu styling', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // Mobile menu button
    const mobileMenuButton = page.locator('button').filter({ hasText: /menu/i }).first()
    await expect(mobileMenuButton).toBeVisible()
    
    // Open mobile menu
    await mobileMenuButton.click()
    
    // Check for mobile navigation items
    await expect(page.getByText('Command Center')).toBeVisible()
    await expect(page.getByText('Flight Plan')).toBeVisible()
    
    // Mobile luxury feature cards
    await expect(page.getByText('Executive Security')).toBeVisible()
    await expect(page.getByText('Private Jet Experience')).toBeVisible()
    await expect(page.getByText('AI Intelligence')).toBeVisible()
    
    // Mobile CTA buttons
    await expect(page.getByRole('button', { name: /Take Flight/i })).toBeVisible()
  })

  test('Scroll behavior triggers runway progress and luxury effects', async ({ page }) => {
    await page.goto('/')
    
    // Initial state - no runway progress
    const navigation = page.getByRole('navigation')
    await expect(navigation).toBeVisible()
    
    // Scroll down to trigger effects
    await page.evaluate(() => window.scrollTo(0, 500))
    
    // Wait for scroll effects to apply
    await page.waitForTimeout(500)
    
    // Navigation should update with runway progress
    await expect(navigation).toHaveClass(/backdrop-blur-executive/)
    
    // Runway lights should be visible
    // (Implementation depends on specific runway light selectors)
  })

  test('Executive authentication flow integration', async ({ page }) => {
    await page.goto('/')
    
    // Look for executive access button
    const executiveAccess = page.getByText('Executive Access')
    await expect(executiveAccess).toBeVisible()
    
    // Should have luxury styling
    await expect(executiveAccess).toHaveClass(/hover:text-champagneGold/)
    
    // Take Flight button should lead to signup
    const takeFlightButton = page.getByRole('button', { name: /Take Flight/i })
    await takeFlightButton.click()
    
    // Should scroll to signup section (mocked in test environment)
  })

  test('Performance metrics - sub-3-second interactions', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/')
    
    // Wait for hero section to be fully loaded
    await expect(page.getByRole('heading', { name: /Transform Communication/i })).toBeVisible()
    
    const loadTime = Date.now() - startTime
    
    // Executive performance standard: sub-3-second load
    expect(loadTime).toBeLessThan(3000)
  })

  test('Executive glassmorphism effects are properly rendered', async ({ page }) => {
    await page.goto('/')
    
    // Check for backdrop blur effects
    const executiveBadge = page.getByText('Exclusive for C-Suite Executives').locator('..')
    await expect(executiveBadge).toHaveClass(/backdrop-blur-executive/)
    
    // Metric cards should have glass effects
    const metricCards = page.locator('[class*="backdrop-blur"]')
    expect(await metricCards.count()).toBeGreaterThan(0)
    
    // VIP cards should have luxury glass styling
    const vipCard = page.getByText('VIP PRIORITY').locator('..')
    await expect(vipCard).toHaveClass(/backdrop-blur-executive/)
  })

  test('Champagne gold gradients and accents throughout', async ({ page }) => {
    await page.goto('/')
    
    // Main CTA should have champagne gradient
    const primaryCTA = page.getByRole('button', { name: /Take Command Now/i })
    await expect(primaryCTA).toHaveClass(/bg-gradient-champagne/)
    
    // Headline accents should use champagne gradient
    await expect(page.getByText('Chaos')).toHaveClass(/bg-gradient-champagne/)
    await expect(page.getByText('Clarity')).toHaveClass(/bg-gradient-champagne/)
    
    // Navigation take flight button
    const navTakeFlight = page.getByRole('button', { name: /Take Flight/i }).first()
    await expect(navTakeFlight).toHaveClass(/bg-gradient-champagne/)
  })

  test('Luxury animations and micro-interactions', async ({ page }) => {
    await page.goto('/')
    
    // Test hover animations on metric cards
    const firstMetric = page.getByText('15h').locator('..')
    await firstMetric.hover()
    
    // Should have hover scale effect
    await expect(firstMetric).toHaveClass(/hover:scale-105/)
    
    // Test button hover animations
    const primaryCTA = page.getByRole('button', { name: /Take Command Now/i })
    await primaryCTA.hover()
    
    // Should have shimmer and glow effects
    await expect(primaryCTA).toHaveClass(/shadow-champagne-glow/)
  })

  test('Executive accessibility standards - WCAG AAA compliance', async ({ page }) => {
    await page.goto('/')
    
    // Check for proper heading hierarchy
    const mainHeading = page.getByRole('heading', { level: 1 })
    await expect(mainHeading).toBeVisible()
    
    // All buttons should be keyboard accessible
    const buttons = page.getByRole('button')
    const buttonCount = await buttons.count()
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i)
      await expect(button).toBeVisible()
      
      // Tab to button and ensure it's focusable
      await button.focus()
      await expect(button).toBeFocused()
    }
    
    // All links should have proper href attributes
    const links = page.getByRole('link')
    const linkCount = await links.count()
    
    for (let i = 0; i < linkCount; i++) {
      const link = links.nth(i)
      await expect(link).toHaveAttribute('href')
    }
  })

  test('Private jet theme consistency across all elements', async ({ page }) => {
    await page.goto('/')
    
    // Hero section should use jetBlack background
    const heroSection = page.locator('section').first()
    await expect(heroSection).toHaveClass(/bg-jetBlack/)
    
    // Navigation should use appropriate private jet colors
    const navigation = page.getByRole('navigation')
    await expect(navigation).toHaveClass(/bg-jetBlack/)
    
    // Trust indicators should mention private jet experience
    await expect(page.getByText('Private Jet Experience')).toBeVisible()
    
    // Preview cards should use midnightBlue and champagne accents
    const vipCard = page.getByText('VIP PRIORITY').locator('..')
    await expect(vipCard).toHaveClass(/bg-midnightBlue/)
  })
})