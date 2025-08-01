import { defineConfig, devices } from '@playwright/test'

/**
 * Napoleon AI Mobile Testing Configuration
 * 
 * This configuration focuses on mobile device testing with:
 * - Executive-grade performance budgets
 * - Accessibility compliance (WCAG AA)
 * - Gesture interaction testing
 * - Offline functionality validation
 * - Cross-device compatibility
 */

export default defineConfig({
  testDir: './mobile',
  outputDir: '../test-results/mobile',
  timeout: 30 * 1000, // 30 seconds per test
  expect: {
    timeout: 5000, // 5 seconds for assertions
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['html', { outputFolder: '../test-results/mobile-report' }],
    ['json', { outputFile: '../test-results/mobile-results.json' }],
    ['junit', { outputFile: '../test-results/mobile-junit.xml' }]
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Mobile-specific settings
    actionTimeout: 3000,
    navigationTimeout: 10000,
    
    // Accessibility testing
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9'
    }
  },

  projects: [
    // iPhone Testing
    {
      name: 'iPhone 14 Pro',
      use: {
        ...devices['iPhone 14 Pro'],
        viewport: { width: 393, height: 852 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
      },
    },
    
    {
      name: 'iPhone SE',
      use: {
        ...devices['iPhone SE'],
        viewport: { width: 375, height: 667 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
      },
    },

    // Android Testing  
    {
      name: 'Samsung Galaxy S21',
      use: {
        ...devices['Galaxy S21'],
        viewport: { width: 384, height: 854 },
        deviceScaleFactor: 2.75,
        isMobile: true,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
      },
    },

    {
      name: 'Pixel 7',
      use: {
        ...devices['Pixel 7'],
        viewport: { width: 412, height: 915 },
        deviceScaleFactor: 2.625,
        isMobile: true,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Mobile Safari/537.36',
      },
    },

    // Tablet Testing
    {
      name: 'iPad Pro',
      use: {
        ...devices['iPad Pro'],
        viewport: { width: 1024, height: 1366 },
        deviceScaleFactor: 2,
        isMobile: false,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
      },
    },

    // Low-end device simulation
    {
      name: 'Budget Android',
      use: {
        viewport: { width: 360, height: 640 },
        deviceScaleFactor: 1.5,
        isMobile: true,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (Linux; Android 9; SM-A105F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
        // Simulate low-end device performance
        launchOptions: {
          args: [
            '--memory-pressure-off',
            '--max_old_space_size=512',
            '--disable-dev-shm-usage',
            '--no-sandbox'
          ]
        }
      },
    },

    // Network condition testing
    {
      name: 'Slow 3G iPhone',
      use: {
        ...devices['iPhone 14 Pro'],
        viewport: { width: 393, height: 852 },
        // Simulate slow 3G connection
        contextOptions: {
          offline: false,
          // Slow 3G simulation
          bypassCSP: true,
        },
        launchOptions: {
          args: [
            '--simulate-outdated-no-au',
            '--force-effective-connection-type=3g'
          ]
        }
      },
    },

    // High contrast mode testing
    {
      name: 'High Contrast Mode',
      use: {
        ...devices['iPhone 14 Pro'],
        viewport: { width: 393, height: 852 },
        colorScheme: 'light',
        forcedColors: 'active', // Simulate high contrast mode
        reducedMotion: 'reduce', // Test with reduced motion
      },
    },

    // Reduced motion testing
    {
      name: 'Reduced Motion',
      use: {
        ...devices['Galaxy S21'],
        viewport: { width: 384, height: 854 },
        reducedMotion: 'reduce',
        colorScheme: 'light',
      },
    }
  ],

  // Global test setup
  globalSetup: require.resolve('./global-setup'),
  globalTeardown: require.resolve('./global-teardown'),
  
  // Test configuration
  webServer: process.env.CI ? undefined : {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
})