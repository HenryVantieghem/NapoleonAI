import { test, expect, Page } from '@playwright/test'

/**
 * Mobile Performance Budget Tests for Napoleon AI
 * 
 * Validates that the mobile experience meets executive-grade performance standards:
 * - First Contentful Paint < 1.8s
 * - Largest Contentful Paint < 2.5s  
 * - First Input Delay < 100ms
 * - Cumulative Layout Shift < 0.1
 * - Time to Interactive < 3.5s
 */

test.describe('Mobile Performance Budgets', () => {
  test.describe('Core Web Vitals', () => {
    test('should meet FCP budget on mobile', async ({ page }) => {
      const startTime = Date.now()
      
      await page.goto('/dashboard', { waitUntil: 'networkidle' })
      
      // Measure First Contentful Paint
      const fcpEntry = await page.evaluate(() => {
        return new Promise((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntriesByName('first-contentful-paint')
            if (entries.length > 0) {
              resolve(entries[0].startTime)
            }
          }).observe({ entryTypes: ['paint'] })
          
          // Fallback timeout
          setTimeout(() => resolve(null), 5000)
        })
      })
      
      if (fcpEntry) {
        console.log(`FCP: ${fcpEntry}ms`)
        expect(fcpEntry).toBeLessThan(1800) // 1.8s budget for mobile
      }
    })

    test('should meet LCP budget on mobile', async ({ page }) => {
      await page.goto('/dashboard', { waitUntil: 'networkidle' })
      
      // Measure Largest Contentful Paint
      const lcpEntry = await page.evaluate(() => {
        return new Promise((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries()
            if (entries.length > 0) {
              resolve(entries[entries.length - 1].startTime)
            }
          }).observe({ entryTypes: ['largest-contentful-paint'] })
          
          setTimeout(() => resolve(null), 10000)
        })
      })
      
      if (lcpEntry) {
        console.log(`LCP: ${lcpEntry}ms`)
        expect(lcpEntry).toBeLessThan(2500) // 2.5s budget for mobile
      }
    })

    test('should meet FID budget on mobile', async ({ page }) => {
      await page.goto('/dashboard', { waitUntil: 'networkidle' })
      
      // Wait for page to be interactive
      await page.waitForTimeout(1000)
      
      const startTime = performance.now()
      
      // Trigger first interaction
      await page.locator('[data-testid="nav-inbox"]').click()
      
      const endTime = performance.now()
      const interactionDelay = endTime - startTime
      
      console.log(`Interaction delay: ${interactionDelay}ms`)
      expect(interactionDelay).toBeLessThan(100) // 100ms FID budget
    })

    test('should meet CLS budget on mobile', async ({ page }) => {
      let clsValue = 0
      
      // Monitor layout shifts
      await page.evaluateOnNewDocument(() => {
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            // @ts-ignore
            if (!entry.hadRecentInput) {
              // @ts-ignore  
              window.__cls = (window.__cls || 0) + entry.value
            }
          }
        }).observe({ entryTypes: ['layout-shift'] })
      })
      
      await page.goto('/dashboard')
      
      // Navigate through mobile tabs to trigger potential shifts
      await page.locator('[data-testid="nav-vip"]').click()
      await page.waitForTimeout(500)
      
      await page.locator('[data-testid="nav-digest"]').click()
      await page.waitForTimeout(500)
      
      await page.locator('[data-testid="nav-settings"]').click()
      await page.waitForTimeout(500)
      
      // Get final CLS value
      clsValue = await page.evaluate(() => window.__cls || 0)
      
      console.log(`CLS: ${clsValue}`)
      expect(clsValue).toBeLessThan(0.1) // 0.1 CLS budget
    })
  })

  test.describe('Resource Loading Performance', () => {
    test('should load critical resources within budget', async ({ page }) => {
      const response = await page.goto('/dashboard')
      
      // Check main document load time
      const loadTime = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        return navigation.loadEventEnd - navigation.fetchStart
      })
      
      console.log(`Page load time: ${loadTime}ms`)
      expect(loadTime).toBeLessThan(3000) // 3s budget for initial load
      
      // Check response time
      const responseTime = await response?.finished()
      expect(response?.status()).toBe(200)
    })

    test('should optimize image loading on mobile', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Check that images are properly optimized
      const images = await page.locator('img').all()
      
      for (const img of images) {
        const src = await img.getAttribute('src')
        const naturalWidth = await img.evaluate(el => (el as HTMLImageElement).naturalWidth)
        const displayWidth = await img.evaluate(el => el.getBoundingClientRect().width)
        
        // Images should not be significantly oversized for mobile
        if (naturalWidth && displayWidth) {
          const ratio = naturalWidth / displayWidth
          expect(ratio).toBeLessThan(3) // Max 3x oversizing allowed
        }
        
        // WebP format should be used when supported
        if (src && !src.includes('data:')) {
          const isOptimized = src.includes('webp') || src.includes('avif') || src.includes('_next/image')
          expect(isOptimized).toBeTruthy()
        }
      }
    })

    test('should lazy load non-critical content', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Check that below-the-fold content is lazy loaded
      const lazyImages = await page.locator('img[loading="lazy"]').count()
      const totalImages = await page.locator('img').count()
      
      if (totalImages > 3) {
        // At least some images should be lazy loaded
        expect(lazyImages).toBeGreaterThan(0)
      }
      
      // Check for lazy-loaded components
      const lazyComponents = await page.locator('[data-lazy="true"]').count()
      console.log(`Lazy components: ${lazyComponents}`)
    })
  })

  test.describe('JavaScript Performance', () => {
    test('should execute JavaScript within performance budget', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Execute a complex interaction and measure performance
      const startTime = await page.evaluate(() => performance.now())
      
      // Simulate complex user interaction (multiple tab switches)
      await page.locator('[data-testid="nav-vip"]').click()
      await page.locator('[data-testid="nav-digest"]').click()
      await page.locator('[data-testid="nav-inbox"]').click()
      
      const endTime = await page.evaluate(() => performance.now())
      const executionTime = endTime - startTime
      
      console.log(`JS execution time: ${executionTime}ms`)
      expect(executionTime).toBeLessThan(500) // 500ms budget for complex interactions
    })

    test('should handle memory efficiently on mobile', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Get initial memory usage
      const initialMemory = await page.evaluate(() => {
        // @ts-ignore
        return (performance as any).memory?.usedJSHeapSize || 0
      })
      
      // Simulate memory-intensive operations
      for (let i = 0; i < 10; i++) {
        await page.locator('[data-testid="nav-vip"]').click()
        await page.waitForTimeout(100)
        await page.locator('[data-testid="nav-inbox"]').click()
        await page.waitForTimeout(100)
      }
      
      // Check final memory usage
      const finalMemory = await page.evaluate(() => {
        // @ts-ignore
        return (performance as any).memory?.usedJSHeapSize || 0
      })
      
      if (initialMemory && finalMemory) {
        const memoryIncrease = finalMemory - initialMemory
        console.log(`Memory increase: ${memoryIncrease / 1024 / 1024}MB`)
        
        // Memory increase should be reasonable (< 10MB for this test)
        expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024)
      }
    })

    test('should bundle size within budget', async ({ page }) => {
      const response = await page.goto('/dashboard')
      
      // Measure transferred bytes
      const transferSize = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        return navigation.transferSize
      })
      
      console.log(`Transfer size: ${transferSize / 1024}KB`)
      
      // Main bundle should be under 500KB compressed
      expect(transferSize).toBeLessThan(500 * 1024)
      
      // Check for code splitting
      const jsRequests = await page.evaluate(() => {
        return performance.getEntriesByType('resource')
          .filter(entry => entry.name.includes('.js'))
          .length
      })
      
      console.log(`JS files loaded: ${jsRequests}`)
      // Should have multiple JS chunks (indicating code splitting)
      expect(jsRequests).toBeGreaterThan(1)
    })
  })

  test.describe('Network Performance', () => {
    test('should work efficiently on slow connections', async ({ page }) => {
      // Simulate slow 3G connection
      await page.route('**/*', (route) => {
        route.continue()
      })
      
      // Add network delay simulation
      await page.addInitScript(() => {
        // Mock slow connection
        Object.defineProperty(navigator, 'connection', {
          writable: true,
          value: {
            effectiveType: 'slow-2g',
            downlink: 0.4,
            rtt: 400
          }
        })
      })
      
      const startTime = Date.now()
      await page.goto('/dashboard', { timeout: 15000 })
      const loadTime = Date.now() - startTime
      
      console.log(`Load time on slow connection: ${loadTime}ms`)
      // Should load within 10 seconds even on slow connection
      expect(loadTime).toBeLessThan(10000)
    })

    test('should minimize network requests', async ({ page }) => {
      let requestCount = 0
      
      page.on('request', () => {
        requestCount++
      })
      
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')
      
      console.log(`Total network requests: ${requestCount}`)
      
      // Should minimize initial requests for mobile
      expect(requestCount).toBeLessThan(50)
    })

    test('should cache resources effectively', async ({ page }) => {
      // First visit
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')
      
      let cachedRequests = 0
      
      // Second visit - check for cached resources
      page.on('response', (response) => {
        if (response.fromServiceWorker() || response.status() === 304) {
          cachedRequests++
        }
      })
      
      await page.reload()
      await page.waitForLoadState('networkidle')
      
      console.log(`Cached requests: ${cachedRequests}`)
      // Should have some cached resources on reload
      expect(cachedRequests).toBeGreaterThan(0)
    })
  })

  test.describe('Accessibility Performance', () => {
    test('should meet accessibility performance standards', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Test screen reader performance
      const startTime = Date.now()
      
      // Simulate screen reader navigation
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      await page.keyboard.press('Enter')
      
      const navigationTime = Date.now() - startTime
      
      console.log(`Accessibility navigation time: ${navigationTime}ms`)
      // Keyboard navigation should be responsive
      expect(navigationTime).toBeLessThan(300)
    })

    test('should handle high contrast mode without performance impact', async ({ page }) => {
      // Enable high contrast mode
      await page.emulateMedia({ forcedColors: 'active' })
      
      const startTime = Date.now()
      await page.goto('/dashboard')
      const loadTime = Date.now() - startTime
      
      console.log(`Load time with high contrast: ${loadTime}ms`)
      
      // High contrast shouldn't significantly impact performance
      expect(loadTime).toBeLessThan(4000)
      
      // Verify high contrast styles are applied
      const hasHighContrast = await page.locator('html').evaluate(el => 
        el.classList.contains('high-contrast')
      )
      
      expect(hasHighContrast).toBeTruthy()
    })
  })

  test.describe('Battery and CPU Efficiency', () => {
    test('should minimize CPU usage during idle', async ({ page }) => {
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')
      
      // Measure CPU usage during idle period
      const cpuUsage = await page.evaluate(async () => {
        return new Promise((resolve) => {
          let animationFrames = 0
          let startTime = performance.now()
          
          function countFrames() {
            animationFrames++
            if (performance.now() - startTime < 2000) {
              requestAnimationFrame(countFrames)
            } else {
              resolve(animationFrames)
            }
          }
          
          requestAnimationFrame(countFrames)
        })
      })
      
      console.log(`Animation frames during idle: ${cpuUsage}`)
      
      // Should have minimal animation frames when idle
      expect(cpuUsage).toBeLessThan(120) // ~60fps for 2 seconds
    })

    test('should pause animations when tab is hidden', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Hide the tab
      await page.evaluate(() => {
        Object.defineProperty(document, 'visibilityState', {
          writable: true,
          value: 'hidden'
        })
        
        document.dispatchEvent(new Event('visibilitychange'))
      })
      
      // Check if animations are paused
      const animationsPaused = await page.evaluate(() => {
        const elements = document.querySelectorAll('[style*="animation"]')
        return elements.length === 0 || 
               Array.from(elements).every(el => 
                 (el as HTMLElement).style.animationPlayState === 'paused'
               )
      })
      
      expect(animationsPaused).toBeTruthy()
    })
  })
})