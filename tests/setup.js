// Jest setup file for Napoleon AI tests

// Set test timeout for Puppeteer tests
jest.setTimeout(30000)

// Mock environment variables for testing
process.env.NODE_ENV = 'test'
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_placeholder'
process.env.CLERK_SECRET_KEY = 'sk_test_placeholder'

// Console log formatting for test output
const originalLog = console.log
console.log = (...args) => {
  const timestamp = new Date().toISOString()
  originalLog(`[${timestamp}]`, ...args)
}

// Global test helpers
global.testUtils = {
  // Helper to wait for element with retry
  waitForElement: async (page, selector, timeout = 5000) => {
    const element = await page.waitForSelector(selector, { timeout })
    return element
  },

  // Helper to check if element exists
  elementExists: async (page, selector) => {
    try {
      await page.waitForSelector(selector, { timeout: 1000 })
      return true
    } catch {
      return false
    }
  },

  // Helper to get element text
  getElementText: async (page, selector) => {
    return await page.$eval(selector, el => el.textContent)
  },

  // Helper to check luxury styling
  hasLuxuryColors: async (page, selector) => {
    const element = await page.$(selector)
    if (!element) return false
    
    const styles = await page.evaluate((el) => {
      const computed = window.getComputedStyle(el)
      return {
        backgroundColor: computed.backgroundColor,
        color: computed.color,
        borderColor: computed.borderColor
      }
    }, element)
    
    // Check for navy or gold colors
    const luxuryColors = [
      'rgb(27, 41, 81)',    // Navy
      'rgb(212, 175, 55)',  // Gold
      'rgb(255, 255, 255)', // White
    ]
    
    return luxuryColors.some(color => 
      Object.values(styles).some(style => style.includes(color))
    )
  }
}

// Quality gate reporting
global.qualityGateResults = {
  performance: [],
  accessibility: [],
  security: [],
  functionality: []
}

// Cleanup after all tests
afterAll(async () => {
  // Report quality gate results
  console.log('\\n🏆 Napoleon AI Quality Gate Results:')
  
  Object.entries(global.qualityGateResults).forEach(([category, results]) => {
    if (results.length > 0) {
      console.log(`\\n${category.toUpperCase()}:`)
      results.forEach(result => {
        const status = result.passed ? '✅' : '❌'
        console.log(`  ${status} ${result.test}: ${result.message}`)
      })
    }
  })
})