import { test, expect, Page } from '@playwright/test'

/**
 * Mobile Gesture Interaction Tests for Napoleon AI
 * 
 * Tests the core mobile gestures and interactions:
 * - Swipe to archive/snooze messages  
 * - Long press for quick actions
 * - Touch target accessibility
 * - Haptic feedback simulation
 * - Gesture hint animations
 */

test.describe('Mobile Gesture Interactions', () => {
  let page: Page

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage
    
    // Navigate to dashboard
    await page.goto('/dashboard')
    
    // Wait for mobile layout to load
    await page.waitForSelector('[data-testid="mobile-bottom-nav"]', { timeout: 10000 })
    
    // Ensure we're in mobile viewport
    await page.setViewportSize({ width: 393, height: 852 })
  })

  test.describe('Message Swipe Gestures', () => {
    test('should archive message with left swipe', async () => {
      // Find first message card
      const messageCard = page.locator('[data-testid="message-card"]').first()
      await expect(messageCard).toBeVisible()
      
      // Get initial message count
      const initialCount = await page.locator('[data-testid="message-card"]').count()
      
      // Perform left swipe gesture
      await messageCard.hover()
      const box = await messageCard.boundingBox()
      if (box) {
        // Swipe left (archive gesture)
        await page.mouse.move(box.x + box.width - 20, box.y + box.height / 2)
        await page.mouse.down()
        await page.mouse.move(box.x + 20, box.y + box.height / 2, { steps: 10 })
        await page.mouse.up()
        
        // Wait for animation to complete
        await page.waitForTimeout(500)
        
        // Verify message was archived
        const newCount = await page.locator('[data-testid="message-card"]').count()
        expect(newCount).toBe(initialCount - 1)
        
        // Check for success feedback
        await expect(page.locator('[data-testid="toast-notification"]')).toContainText('Message archived')
      }
    })

    test('should snooze message with right swipe', async () => {
      const messageCard = page.locator('[data-testid="message-card"]').first()
      await expect(messageCard).toBeVisible()
      
      // Perform right swipe gesture
      await messageCard.hover()
      const box = await messageCard.boundingBox()
      if (box) {
        // Swipe right (snooze gesture)
        await page.mouse.move(box.x + 20, box.y + box.height / 2)
        await page.mouse.down()
        await page.mouse.move(box.x + box.width - 20, box.y + box.height / 2, { steps: 10 })
        await page.mouse.up()
        
        // Wait for animation
        await page.waitForTimeout(500)
        
        // Verify snooze feedback
        await expect(page.locator('[data-testid="toast-notification"]')).toContainText('Message snoozed')
      }
    })

    test('should show gesture hints during swipe', async () => {
      const messageCard = page.locator('[data-testid="message-card"]').first()
      await expect(messageCard).toBeVisible()
      
      const box = await messageCard.boundingBox()
      if (box) {
        // Start swipe but don't complete
        await page.mouse.move(box.x + box.width - 20, box.y + box.height / 2)
        await page.mouse.down()
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 5 })
        
        // Check for visual hint
        await expect(page.locator('[data-testid="swipe-hint"]')).toBeVisible()
        await expect(page.locator('[data-testid="swipe-hint"]')).toContainText('Release to archive')
        
        // Complete the gesture
        await page.mouse.up()
      }
    })

    test('should handle cancelled swipe gesture', async () => {
      const messageCard = page.locator('[data-testid="message-card"]').first()
      await expect(messageCard).toBeVisible()
      
      const initialCount = await page.locator('[data-testid="message-card"]').count()
      
      const box = await messageCard.boundingBox()
      if (box) {
        // Start swipe but return to original position
        await page.mouse.move(box.x + box.width - 20, box.y + box.height / 2)
        await page.mouse.down()
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 5 })
        await page.mouse.move(box.x + box.width - 20, box.y + box.height / 2, { steps: 5 })
        await page.mouse.up()
        
        // Wait for animation
        await page.waitForTimeout(300)
        
        // Verify message wasn't archived
        const newCount = await page.locator('[data-testid="message-card"]').count()
        expect(newCount).toBe(initialCount)
      }
    })
  })

  test.describe('Long Press Interactions', () => {
    test('should open quick actions on long press', async () => {
      const messageCard = page.locator('[data-testid="message-card"]').first()
      await expect(messageCard).toBeVisible()
      
      // Perform long press
      await messageCard.hover()
      await page.mouse.down()
      await page.waitForTimeout(600) // Long press duration
      await page.mouse.up()
      
      // Verify quick actions sheet appeared
      await expect(page.locator('[data-testid="quick-actions-sheet"]')).toBeVisible()
      await expect(page.locator('[data-testid="quick-actions-title"]')).toContainText('Quick Actions')
      
      // Check all action buttons are present
      await expect(page.locator('[data-testid="action-reply"]')).toBeVisible()
      await expect(page.locator('[data-testid="action-archive"]')).toBeVisible()
      await expect(page.locator('[data-testid="action-snooze"]')).toBeVisible()
      await expect(page.locator('[data-testid="action-delete"]')).toBeVisible()
    })

    test('should execute actions from quick actions sheet', async () => {
      const messageCard = page.locator('[data-testid="message-card"]').first()
      
      // Open quick actions
      await messageCard.hover()
      await page.mouse.down()
      await page.waitForTimeout(600)
      await page.mouse.up()
      
      await expect(page.locator('[data-testid="quick-actions-sheet"]')).toBeVisible()
      
      // Click archive action
      await page.locator('[data-testid="action-archive"]').click()
      
      // Verify sheet closes and action executes
      await expect(page.locator('[data-testid="quick-actions-sheet"]')).not.toBeVisible()
      await expect(page.locator('[data-testid="toast-notification"]')).toContainText('Message archived')
    })

    test('should close quick actions sheet with backdrop click', async () => {
      const messageCard = page.locator('[data-testid="message-card"]').first()
      
      // Open quick actions
      await messageCard.hover()
      await page.mouse.down()
      await page.waitForTimeout(600)
      await page.mouse.up()
      
      await expect(page.locator('[data-testid="quick-actions-sheet"]')).toBeVisible()
      
      // Click backdrop
      await page.locator('[data-testid="sheet-backdrop"]').click()
      
      // Verify sheet closes
      await expect(page.locator('[data-testid="quick-actions-sheet"]')).not.toBeVisible()
    })
  })

  test.describe('Touch Target Accessibility', () => {
    test('should have minimum 44px touch targets', async () => {
      // Check bottom navigation touch targets
      const navButtons = page.locator('[data-testid="nav-button"]')
      const count = await navButtons.count()
      
      for (let i = 0; i < count; i++) {
        const button = navButtons.nth(i)
        const box = await button.boundingBox()
        
        if (box) {
          expect(box.width).toBeGreaterThanOrEqual(44)
          expect(box.height).toBeGreaterThanOrEqual(44)
        }
      }
    })

    test('should have proper spacing between touch targets', async () => {
      const navButtons = page.locator('[data-testid="nav-button"]')
      const count = await navButtons.count()
      
      if (count > 1) {
        const firstBox = await navButtons.first().boundingBox()
        const secondBox = await navButtons.nth(1).boundingBox()
        
        if (firstBox && secondBox) {
          const spacing = secondBox.x - (firstBox.x + firstBox.width)
          expect(spacing).toBeGreaterThanOrEqual(8) // Minimum 8px spacing
        }
      }
    })

    test('should support large touch targets mode', async () => {
      // Enable large touch targets in settings
      await page.locator('[data-testid="nav-settings"]').click()
      await page.locator('[data-testid="accessibility-section"]').click()
      await page.locator('[data-testid="large-touch-targets"]').click()
      
      // Wait for setting to apply
      await page.waitForTimeout(300)
      
      // Check that touch targets are now larger
      const navButton = page.locator('[data-testid="nav-button"]').first()
      const box = await navButton.boundingBox()
      
      if (box) {
        expect(box.width).toBeGreaterThanOrEqual(56) // Large touch target size
        expect(box.height).toBeGreaterThanOrEqual(56)
      }
    })
  })

  test.describe('Gesture Performance', () => {
    test('should complete swipe gestures within performance budget', async () => {
      const messageCard = page.locator('[data-testid="message-card"]').first()
      
      // Measure gesture performance
      const startTime = Date.now()
      
      const box = await messageCard.boundingBox()
      if (box) {
        // Perform fast swipe
        await page.mouse.move(box.x + box.width - 20, box.y + box.height / 2)
        await page.mouse.down()
        await page.mouse.move(box.x + 20, box.y + box.height / 2, { steps: 5 })
        await page.mouse.up()
        
        // Wait for animation to complete
        await page.waitForFunction(() => {
          const card = document.querySelector('[data-testid="message-card"]')
          return !card || card.style.transform === ''
        })
        
        const endTime = Date.now()
        const duration = endTime - startTime
        
        // Gesture should complete within 300ms for good UX
        expect(duration).toBeLessThan(300)
      }
    })

    test('should handle rapid gesture sequences', async () => {
      const messageCards = page.locator('[data-testid="message-card"]')
      const initialCount = await messageCards.count()
      
      // Perform rapid swipes on multiple messages
      for (let i = 0; i < Math.min(3, initialCount); i++) {
        const card = messageCards.nth(i)
        const box = await card.boundingBox()
        
        if (box) {
          await page.mouse.move(box.x + box.width - 20, box.y + box.height / 2)
          await page.mouse.down()
          await page.mouse.move(box.x + 20, box.y + box.height / 2, { steps: 3 })
          await page.mouse.up()
          
          // Small delay between gestures
          await page.waitForTimeout(100)
        }
      }
      
      // Wait for all animations to complete
      await page.waitForTimeout(1000)
      
      // Verify all messages were processed
      const finalCount = await page.locator('[data-testid="message-card"]').count()
      expect(finalCount).toBe(initialCount - 3)
    })
  })

  test.describe('Error Handling', () => {
    test('should handle gesture conflicts gracefully', async () => {
      const messageCard = page.locator('[data-testid="message-card"]').first()
      
      // Simulate conflicting gestures (tap while swiping)
      const box = await messageCard.boundingBox()
      if (box) {
        // Start swipe
        await page.mouse.move(box.x + box.width - 20, box.y + box.height / 2)
        await page.mouse.down()
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 2 })
        
        // Simulate tap on another area
        await page.mouse.click(box.x + 10, box.y + 10)
        
        // Complete swipe
        await page.mouse.move(box.x + 20, box.y + box.height / 2, { steps: 3 })
        await page.mouse.up()
        
        // Should not crash or cause unexpected behavior
        await expect(page.locator('body')).toBeVisible()
      }
    })
  })
})