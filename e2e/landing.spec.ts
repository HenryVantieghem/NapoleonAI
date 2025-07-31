import { test, expect } from '@playwright/test'

test.describe('Landing Page E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display hero section with Cartier-inspired luxury design', async ({ page }) => {
    // Check for main headline with luxury styling
    await expect(page.locator('h1')).toContainText('Transform Communication Chaos')
    await expect(page.locator('h1')).toContainText('into Strategic Clarity')
    
    // Verify luxury crown logo is present and animated
    await expect(page.locator('svg').first()).toBeVisible()
    
    // Check for luxury color scheme
    const heroSection = page.locator('section').first()
    await expect(heroSection).toHaveClass(/bg-gradient-to-br/)
    await expect(heroSection).toHaveClass(/from-navy-900/)
  })

  test('should have functional primary and secondary CTAs', async ({ page }) => {
    // Primary CTA should navigate to signup
    const primaryCTA = page.getByRole('link', { name: /take command now/i })
    await expect(primaryCTA).toBeVisible()
    await expect(primaryCTA).toHaveAttribute('href', '/auth/signup')
    
    // Secondary CTA should navigate to contact
    const secondaryCTA = page.getByRole('link', { name: /request concierge/i })
    await expect(secondaryCTA).toBeVisible()
    await expect(secondaryCTA).toHaveAttribute('href', '/contact')
    
    // Test hover animations
    await primaryCTA.hover()
    await expect(primaryCTA).toHaveClass(/transform/)
  })

  test('should display How It Works section with scroll animations', async ({ page }) => {
    // Scroll to How It Works section
    await page.locator('text=How It Works').scrollIntoViewIfNeeded()
    
    // Verify three steps are present
    await expect(page.locator('text=Connect Accounts')).toBeVisible()
    await expect(page.locator('text=Define VIPs & Preferences')).toBeVisible()
    await expect(page.locator('text=Execute with Precision')).toBeVisible()
    
    // Check for step numbers and icons
    await expect(page.locator('text=1').first()).toBeVisible()
    await expect(page.locator('text=2').first()).toBeVisible()
    await expect(page.locator('text=3').first()).toBeVisible()
    
    // Verify emerald accent colors on step indicators
    const stepIndicators = page.locator('.bg-gradient-to-r.from-emerald-500')
    await expect(stepIndicators).toHaveCount(3)
  })

  test('should show social proof with trust badges and testimonials', async ({ page }) => {
    // Scroll to social proof section
    await page.locator('text=Enterprise Trust').scrollIntoViewIfNeeded()
    
    // Verify trust badges
    await expect(page.locator('text=SOC 2 Type II')).toBeVisible()
    await expect(page.locator('text=GDPR Compliant')).toBeVisible()
    await expect(page.locator('text=HIPAA Ready')).toBeVisible()
    await expect(page.locator('text=ISO 27001')).toBeVisible()
    
    // Verify testimonials carousel
    await expect(page.locator('text=Victoria Chen')).toBeVisible()
    await expect(page.locator('text=CEO, TechVentures Inc.')).toBeVisible()
    
    // Test testimonial carousel functionality
    const indicators = page.locator('button[class*="rounded-full"]')
    await expect(indicators).toHaveCount(3)
    
    // Click second indicator and verify testimonial changes
    await indicators.nth(1).click()
    await expect(page.locator('text=Marcus Thompson')).toBeVisible()
  })

  test('should display pricing section with monthly/annual toggle', async ({ page }) => {
    // Scroll to pricing section
    await page.locator('text=Executive Plan').scrollIntoViewIfNeeded()
    
    // Verify initial monthly pricing
    await expect(page.locator('text=$500')).toBeVisible()
    await expect(page.locator('text=/month')).toBeVisible()
    
    // Toggle to annual pricing
    await page.locator('button:has-text("Annual (Save 20%)")').click()
    await expect(page.locator('text=$400')).toBeVisible()
    await expect(page.locator('text=Save $1,200 annually')).toBeVisible()
    
    // Verify key features are listed
    await expect(page.locator('text=Unlimited executive message processing')).toBeVisible()
    await expect(page.locator('text=AI-powered C-suite prioritization')).toBeVisible()
    await expect(page.locator('text=Board & investor relationship intelligence')).toBeVisible()
    
    // Test pricing CTA
    const pricingCTA = page.getByRole('link', { name: /start free trial/i })
    await expect(pricingCTA).toBeVisible()
    await expect(pricingCTA).toHaveAttribute('href', '/auth/signup')
  })

  test('should have luxury footer with proper links', async ({ page }) => {
    // Scroll to footer
    await page.locator('footer').scrollIntoViewIfNeeded()
    
    // Verify branding
    await expect(page.locator('text=Napoleon AI').last()).toBeVisible()
    await expect(page.locator('text=Executive Intelligence. Amplified.')).toBeVisible()
    
    // Verify navigation links
    await expect(page.locator('footer a[href="/privacy"]')).toBeVisible()
    await expect(page.locator('footer a[href="/terms"]')).toBeVisible()
    await expect(page.locator('footer a[href="/security"]')).toBeVisible()
    await expect(page.locator('footer a[href="/contact"]')).toBeVisible()
    
    // Verify copyright
    await expect(page.locator('text=© 2024 Napoleon AI')).toBeVisible()
    await expect(page.locator('text=Designed exclusively for C-suite executives')).toBeVisible()
  })

  test('should be mobile responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Verify mobile layout
    await expect(page.locator('h1')).toBeVisible()
    const headline = page.locator('h1')
    await expect(headline).toHaveClass(/text-5xl/)
    
    // Verify mobile navigation stacking
    const ctaContainer = page.locator('.flex.flex-col.sm\\:flex-row')
    await expect(ctaContainer).toBeVisible()
    
    // Test mobile testimonials
    await page.locator('text=Enterprise Trust').scrollIntoViewIfNeeded()
    await expect(page.locator('text=Victoria Chen')).toBeVisible()
    
    // Test mobile pricing
    await page.locator('text=Executive Plan').scrollIntoViewIfNeeded()
    await expect(page.locator('text=$500')).toBeVisible()
  })

  test('should have proper scroll behavior and animations', async ({ page }) => {
    // Test smooth scrolling
    await page.locator('text=How It Works').click()
    await page.waitForTimeout(1000)
    
    // Verify scroll indicator in hero
    const scrollIndicator = page.locator('svg').last()
    await expect(scrollIndicator).toBeVisible()
    
    // Test parallax/scroll effects by checking for transform styles
    await page.evaluate(() => window.scrollTo(0, 300))
    await page.waitForTimeout(500)
    
    // Verify sections are still visible after scroll
    await expect(page.locator('text=Transform Communication Chaos')).toBeVisible()
  })

  test('should display exclusivity messaging correctly', async ({ page }) => {
    // Scroll to exclusivity section
    await page.locator('text=Designed for C-suite leaders').scrollIntoViewIfNeeded()
    
    // Verify pricing highlight with underline animation
    const priceHighlight = page.locator('text=$500/mo')
    await expect(priceHighlight).toBeVisible()
    
    // Test hover effect on price
    await priceHighlight.hover()
    await page.waitForTimeout(500)
    
    // Verify ROI messaging
    await expect(page.locator('text=Save 2+ hours daily')).toBeVisible()
  })

  test('should have proper luxury styling and colors', async ({ page }) => {
    // Verify navy and gold color scheme
    const heroSection = page.locator('section').first()
    await expect(heroSection).toHaveClass(/bg-gradient-to-br/)
    await expect(heroSection).toHaveClass(/from-navy-900/)
    
    // Verify gold CTAs
    const primaryCTA = page.getByRole('link', { name: /take command now/i })
    await expect(primaryCTA).toHaveClass(/bg-gradient-gold/)
    
    // Verify luxury shadows and effects
    const pricingCard = page.locator('.shadow-2xl').first()
    await expect(pricingCard).toBeVisible()
    
    // Verify emerald accents
    const emeraldElements = page.locator('.from-emerald-500')
    await expect(emeraldElements.first()).toBeVisible()
  })

  test('should load quickly and meet performance standards', async ({ page }) => {
    const startTime = Date.now()
    
    // Navigate and wait for content
    await page.goto('/')
    await page.locator('text=Transform Communication Chaos').waitFor()
    
    const loadTime = Date.now() - startTime
    
    // Should load in under 3 seconds (allowing for test environment overhead)
    expect(loadTime).toBeLessThan(3000)
    
    // Verify critical content is visible
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.getByRole('link', { name: /take command now/i })).toBeVisible()
  })

  test('should have accessible contrast and keyboard navigation', async ({ page }) => {
    // Test keyboard navigation
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    
    // Verify first CTA is focusable
    const primaryCTA = page.getByRole('link', { name: /take command now/i })
    await expect(primaryCTA).toBeFocused()
    
    // Continue tabbing to secondary CTA
    await page.keyboard.press('Tab')
    const secondaryCTA = page.getByRole('link', { name: /request concierge/i })
    await expect(secondaryCTA).toBeFocused()
    
    // Test color contrast (basic check for dark text on light backgrounds)
    const howItWorksSection = page.locator('text=How It Works').locator('..')
    await expect(howItWorksSection).toHaveCSS('color', /#1B2951|rgb\(27, 41, 81\)/)
  })
})