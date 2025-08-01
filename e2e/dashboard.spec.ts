import { test, expect } from '@playwright/test'

test.describe('Dashboard E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.addInitScript(() => {
      window.localStorage.setItem('__clerk_db_jwt', 'mock-jwt-token')
    })
    
    await page.goto('/dashboard')
  })

  test('displays dashboard layout with three panels', async ({ page }) => {
    // Wait for dashboard to load
    await page.waitForSelector('text=Command Center')
    
    // Verify three-panel layout
    await expect(page.locator('text=Strategic Digest')).toBeVisible()
    await expect(page.locator('text=Unified Inbox')).toBeVisible()
    await expect(page.locator('text=Context & Actions')).toBeVisible()
  })

  test('shows user profile in navigation panel', async ({ page }) => {
    // Check for user info
    await expect(page.getByRole('button', { name: /Profile/i })).toBeVisible()
    
    // Check for navigation items
    await expect(page.locator('text=Dashboard')).toBeVisible()
    await expect(page.locator('text=Integrations')).toBeVisible()
    await expect(page.locator('text=Settings')).toBeVisible()
  })

  test('displays message metrics', async ({ page }) => {
    // Wait for metrics to load
    await page.waitForSelector('[data-testid="metrics-container"]')
    
    // Check for metric cards
    await expect(page.locator('text=Total Messages')).toBeVisible()
    await expect(page.locator('text=VIP Messages')).toBeVisible()
    await expect(page.locator('text=Unread')).toBeVisible()
    await expect(page.locator('text=Today')).toBeVisible()
  })

  test('search functionality works', async ({ page }) => {
    // Find search input
    const searchInput = page.getByPlaceholder(/Search messages/i)
    await expect(searchInput).toBeVisible()
    
    // Type search query
    await searchInput.fill('financial report')
    await searchInput.press('Enter')
    
    // Wait for search results
    await page.waitForTimeout(500)
    
    // Verify search is active
    await expect(searchInput).toHaveValue('financial report')
  })

  test('filter buttons are functional', async ({ page }) => {
    // Test filter buttons
    const vipFilter = page.getByRole('button', { name: /VIP/i })
    const highPriorityFilter = page.getByRole('button', { name: /High Priority/i })
    const unreadFilter = page.getByRole('button', { name: /Unread/i })
    
    // Click VIP filter
    await vipFilter.click()
    await expect(vipFilter).toHaveClass(/bg-navy/)
    
    // Click High Priority filter
    await highPriorityFilter.click()
    await expect(highPriorityFilter).toHaveClass(/bg-navy/)
    
    // Click Unread filter
    await unreadFilter.click()
    await expect(unreadFilter).toHaveClass(/bg-navy/)
    
    // Click All to reset
    const allFilter = page.getByRole('button', { name: /All/i })
    await allFilter.click()
    await expect(allFilter).toHaveClass(/bg-navy/)
  })

  test('message selection updates context panel', async ({ page }) => {
    // Wait for messages to load
    await page.waitForSelector('[data-testid="message-card"]')
    
    // Click first message
    const firstMessage = page.locator('[data-testid="message-card"]').first()
    await firstMessage.click()
    
    // Verify context panel updates
    await expect(page.locator('[data-testid="context-panel"]')).toContainText(/From:/i)
    await expect(page.locator('[data-testid="context-panel"]')).toContainText(/Subject:/i)
    
    // Check for action buttons
    await expect(page.getByRole('button', { name: /Archive/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Snooze/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Reply/i })).toBeVisible()
  })

  test('AI summary button triggers summarization', async ({ page }) => {
    // Select a message
    await page.locator('[data-testid="message-card"]').first().click()
    
    // Find and click summarize button
    const summarizeButton = page.getByRole('button', { name: /Summarize/i })
    await expect(summarizeButton).toBeVisible()
    
    await summarizeButton.click()
    
    // Wait for loading state
    await expect(summarizeButton).toContainText(/Summarizing/i)
    
    // Wait for completion (mocked)
    await page.waitForTimeout(2000)
  })

  test('archive action removes message from inbox', async ({ page }) => {
    // Select a message
    await page.locator('[data-testid="message-card"]').first().click()
    
    // Get message count before archive
    const messageCountBefore = await page.locator('[data-testid="message-card"]').count()
    
    // Click archive button
    await page.getByRole('button', { name: /Archive/i }).click()
    
    // Wait for action to complete
    await page.waitForTimeout(500)
    
    // Verify message count decreased
    const messageCountAfter = await page.locator('[data-testid="message-card"]').count()
    expect(messageCountAfter).toBeLessThan(messageCountBefore)
  })

  test('daily digest panel shows summary', async ({ page }) => {
    // Check digest panel
    const digestPanel = page.locator('[data-testid="daily-digest"]')
    await expect(digestPanel).toBeVisible()
    
    // Verify digest content
    await expect(digestPanel).toContainText(/Executive Summary/i)
    await expect(digestPanel).toContainText(/Key Insights/i)
    await expect(digestPanel).toContainText(/Action Items/i)
  })

  test('responsive layout on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Verify mobile layout
    await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible()
    
    // Open mobile menu
    await page.locator('[data-testid="mobile-menu-button"]').click()
    
    // Verify navigation items in mobile menu
    await expect(page.locator('text=Dashboard')).toBeVisible()
    await expect(page.locator('text=Integrations')).toBeVisible()
    await expect(page.locator('text=Settings')).toBeVisible()
  })

  test('keyboard navigation works', async ({ page }) => {
    // Tab to first message
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    
    // Press Enter to select
    await page.keyboard.press('Enter')
    
    // Verify message is selected
    await expect(page.locator('[data-testid="context-panel"]')).toContainText(/From:/i)
    
    // Tab to action buttons
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    
    // Verify focus on archive button
    const archiveButton = page.getByRole('button', { name: /Archive/i })
    await expect(archiveButton).toBeFocused()
  })

  test('real-time updates when new message arrives', async ({ page }) => {
    // Get initial message count
    const initialCount = await page.locator('[data-testid="message-card"]').count()
    
    // Simulate new message (in real app, this would be from WebSocket)
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('new-message', {
        detail: {
          id: 'new-1',
          subject: 'New Urgent Message',
          sender: { name: 'Board Member' },
          priority: 'high',
          isVip: true
        }
      }))
    })
    
    // Wait for update
    await page.waitForTimeout(500)
    
    // Verify new message appears
    await expect(page.locator('text=New Urgent Message')).toBeVisible()
  })

  test('error state handling', async ({ page }) => {
    // Navigate to dashboard with network error simulation
    await page.route('/api/messages*', route => route.abort())
    await page.reload()
    
    // Verify error message
    await expect(page.locator('text=/error|failed|try again/i')).toBeVisible()
    
    // Check for retry button
    await expect(page.getByRole('button', { name: /Retry/i })).toBeVisible()
  })
})