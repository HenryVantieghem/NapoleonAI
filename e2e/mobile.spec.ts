import { test, expect, devices } from '@playwright/test'

// Use iPhone and Android viewports
test.use({ ...devices['iPhone 13'] })

test.describe('Mobile Experience E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication for mobile
    await page.addInitScript(() => {
      window.localStorage.setItem('__clerk_db_jwt', 'mock-jwt-token')
    })
  })

  test.describe('Mobile Navigation', () => {
    test('displays bottom navigation on mobile', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Check for bottom nav
      const bottomNav = page.locator('[data-testid="bottom-nav"]')
      await expect(bottomNav).toBeVisible()
      
      // Verify nav items
      await expect(bottomNav.locator('text=Inbox')).toBeVisible()
      await expect(bottomNav.locator('text=VIP')).toBeVisible()
      await expect(bottomNav.locator('text=Digest')).toBeVisible()
      await expect(bottomNav.locator('text=Settings')).toBeVisible()
    })

    test('switches panels via bottom nav', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Click VIP tab
      await page.locator('[data-testid="bottom-nav"] text=VIP').click()
      await expect(page.locator('text=VIP Contacts')).toBeVisible()
      
      // Click Digest tab
      await page.locator('[data-testid="bottom-nav"] text=Digest').click()
      await expect(page.locator('text=Daily Digest')).toBeVisible()
      
      // Click Settings tab
      await page.locator('[data-testid="bottom-nav"] text=Settings').click()
      await expect(page.locator('text=Settings')).toBeVisible()
    })

    test('shows active state on navigation', async ({ page }) => {
      await page.goto('/dashboard')
      
      const inboxTab = page.locator('[data-testid="bottom-nav"] [data-tab="inbox"]')
      await expect(inboxTab).toHaveClass(/text-gold/)
      
      await page.locator('[data-testid="bottom-nav"] text=VIP').click()
      const vipTab = page.locator('[data-testid="bottom-nav"] [data-tab="vip"]')
      await expect(vipTab).toHaveClass(/text-gold/)
    })
  })

  test.describe('Touch Gestures', () => {
    test('swipe to navigate between panels', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Get initial panel
      await expect(page.locator('text=Unified Inbox')).toBeVisible()
      
      // Swipe left to go to VIP panel
      await page.locator('[data-testid="swipeable-panels"]').evaluate(el => {
        const touch = new Touch({
          identifier: 1,
          target: el,
          clientX: 300,
          clientY: 400,
        })
        
        el.dispatchEvent(new TouchEvent('touchstart', {
          touches: [touch],
          targetTouches: [touch],
          changedTouches: [touch],
        }))
        
        const moveTouch = new Touch({
          identifier: 1,
          target: el,
          clientX: 50,
          clientY: 400,
        })
        
        el.dispatchEvent(new TouchEvent('touchmove', {
          touches: [moveTouch],
          targetTouches: [moveTouch],
          changedTouches: [moveTouch],
        }))
        
        el.dispatchEvent(new TouchEvent('touchend', {
          touches: [],
          targetTouches: [],
          changedTouches: [moveTouch],
        }))
      })
      
      await page.waitForTimeout(300)
      await expect(page.locator('text=VIP Contacts')).toBeVisible()
    })

    test('long press on message shows quick actions', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Long press on first message
      const firstMessage = page.locator('[data-testid="message-card"]').first()
      
      await firstMessage.evaluate(el => {
        const touch = new Touch({
          identifier: 1,
          target: el,
          clientX: 150,
          clientY: 100,
        })
        
        el.dispatchEvent(new TouchEvent('touchstart', {
          touches: [touch],
          targetTouches: [touch],
          changedTouches: [touch],
        }))
        
        // Simulate long press (500ms)
        setTimeout(() => {
          el.dispatchEvent(new TouchEvent('touchend', {
            touches: [],
            targetTouches: [],
            changedTouches: [touch],
          }))
        }, 500)
      })
      
      await page.waitForTimeout(600)
      
      // Check for quick actions sheet
      const quickActions = page.locator('[data-testid="quick-actions-sheet"]')
      await expect(quickActions).toBeVisible()
      await expect(quickActions.locator('text=Archive')).toBeVisible()
      await expect(quickActions.locator('text=Snooze')).toBeVisible()
      await expect(quickActions.locator('text=Mark as Read')).toBeVisible()
    })

    test('pull to refresh updates messages', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Simulate pull to refresh
      await page.locator('[data-testid="message-list"]').evaluate(el => {
        const touch = new Touch({
          identifier: 1,
          target: el,
          clientX: 150,
          clientY: 100,
        })
        
        el.dispatchEvent(new TouchEvent('touchstart', {
          touches: [touch],
          targetTouches: [touch],
          changedTouches: [touch],
        }))
        
        // Pull down
        const pullTouch = new Touch({
          identifier: 1,
          target: el,
          clientX: 150,
          clientY: 250,
        })
        
        el.dispatchEvent(new TouchEvent('touchmove', {
          touches: [pullTouch],
          targetTouches: [pullTouch],
          changedTouches: [pullTouch],
        }))
        
        el.dispatchEvent(new TouchEvent('touchend', {
          touches: [],
          targetTouches: [],
          changedTouches: [pullTouch],
        }))
      })
      
      // Check for refresh indicator
      await expect(page.locator('[data-testid="refresh-indicator"]')).toBeVisible()
      await page.waitForTimeout(1000)
      await expect(page.locator('[data-testid="refresh-indicator"]')).not.toBeVisible()
    })
  })

  test.describe('Mobile-Specific Features', () => {
    test('displays offline banner when offline', async ({ page }) => {
      // Go offline
      await page.context().setOffline(true)
      await page.goto('/dashboard')
      
      const offlineBanner = page.locator('[data-testid="offline-banner"]')
      await expect(offlineBanner).toBeVisible()
      await expect(offlineBanner).toContainText('Offline Mode')
      
      // Go back online
      await page.context().setOffline(false)
      await page.waitForTimeout(500)
      await expect(offlineBanner).not.toBeVisible()
    })

    test('haptic feedback on actions', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Mock vibrate API
      await page.evaluate(() => {
        window.navigator.vibrate = jest.fn()
      })
      
      // Click action button
      await page.locator('[data-testid="message-card"]').first().click()
      
      // Verify haptic feedback was triggered
      const vibrateCall = await page.evaluate(() => {
        return (window.navigator.vibrate as jest.Mock).mock.calls.length > 0
      })
      expect(vibrateCall).toBe(true)
    })

    test('accessibility settings panel', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Navigate to settings
      await page.locator('[data-testid="bottom-nav"] text=Settings').click()
      
      // Open accessibility settings
      await page.locator('text=Accessibility').click()
      
      // Check for accessibility options
      await expect(page.locator('text=High Contrast Mode')).toBeVisible()
      await expect(page.locator('text=Larger Text')).toBeVisible()
      await expect(page.locator('text=Reduce Motion')).toBeVisible()
      await expect(page.locator('text=Haptic Feedback')).toBeVisible()
      
      // Toggle high contrast
      await page.locator('[data-testid="high-contrast-toggle"]').click()
      await expect(page.locator('body')).toHaveClass(/high-contrast/)
    })
  })

  test.describe('Performance', () => {
    test('virtualized list renders efficiently', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Check that virtualized list is present
      const virtualList = page.locator('[data-testid="virtualized-message-list"]')
      await expect(virtualList).toBeVisible()
      
      // Scroll to bottom
      await virtualList.evaluate(el => {
        el.scrollTop = el.scrollHeight
      })
      
      // Count rendered items (should be limited despite having many messages)
      const renderedItems = await page.locator('[data-testid="message-card"]:visible').count()
      expect(renderedItems).toBeLessThan(20) // Virtualization should limit rendered items
    })

    test('lazy loads images', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Check for lazy loading attribute
      const avatars = page.locator('[data-testid="sender-avatar"]')
      const firstAvatar = avatars.first()
      
      await expect(firstAvatar).toHaveAttribute('loading', 'lazy')
    })
  })

  test.describe('Responsive Behavior', () => {
    test('adapts layout for tablet (iPad)', async ({ page }) => {
      // Set iPad viewport
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.goto('/dashboard')
      
      // Should show split view on tablet
      await expect(page.locator('[data-testid="split-view"]')).toBeVisible()
      await expect(page.locator('text=Unified Inbox')).toBeVisible()
      await expect(page.locator('text=Context & Actions')).toBeVisible()
    })

    test('handles orientation change', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Portrait orientation
      await page.setViewportSize({ width: 390, height: 844 })
      await expect(page.locator('[data-testid="bottom-nav"]')).toBeVisible()
      
      // Landscape orientation
      await page.setViewportSize({ width: 844, height: 390 })
      await page.waitForTimeout(300)
      
      // Bottom nav should adapt or hide in landscape
      const bottomNav = page.locator('[data-testid="bottom-nav"]')
      const isCompact = await bottomNav.evaluate(el => 
        el.classList.contains('compact') || el.style.display === 'none'
      )
      expect(isCompact).toBe(true)
    })
  })

  test.describe('Android-specific', () => {
    test.use({ ...devices['Pixel 5'] })
    
    test('supports Android back button', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Navigate to VIP panel
      await page.locator('[data-testid="bottom-nav"] text=VIP').click()
      await expect(page.locator('text=VIP Contacts')).toBeVisible()
      
      // Simulate Android back button
      await page.goBack()
      
      // Should return to inbox
      await expect(page.locator('text=Unified Inbox')).toBeVisible()
    })
  })

  test.describe('iOS-specific', () => {
    test.use({ ...devices['iPhone 13 Pro Max'] })
    
    test('handles safe area insets', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Check for safe area padding
      const bottomNav = page.locator('[data-testid="bottom-nav"]')
      const paddingBottom = await bottomNav.evaluate(el => 
        window.getComputedStyle(el).paddingBottom
      )
      
      // Should have padding for iPhone notch/home indicator
      expect(parseInt(paddingBottom)).toBeGreaterThan(0)
    })
  })

  test.describe('Accessibility on Mobile', () => {
    test('supports screen reader navigation', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Check for ARIA labels
      await expect(page.locator('[aria-label="Main navigation"]')).toBeVisible()
      await expect(page.locator('[aria-label="Message list"]')).toBeVisible()
      
      // Check for proper heading hierarchy
      const h1 = await page.locator('h1').count()
      expect(h1).toBeGreaterThan(0)
      
      // Check for focus indicators
      await page.keyboard.press('Tab')
      const focusedElement = await page.evaluate(() => 
        document.activeElement?.classList.contains('focus-visible')
      )
      expect(focusedElement).toBe(true)
    })

    test('supports voice control labels', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Check for voice control labels on interactive elements
      const buttons = page.locator('button')
      const buttonCount = await buttons.count()
      
      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i)
        const hasLabel = await button.evaluate(el => 
          el.hasAttribute('aria-label') || el.textContent?.trim() !== ''
        )
        expect(hasLabel).toBe(true)
      }
    })
  })
})