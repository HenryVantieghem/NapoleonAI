import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORGANIZATION_ID,
})

export { openai }

// AI Models configuration for different use cases
export const AI_MODELS = {
  analysis: 'gpt-4-turbo-preview', // For complex message analysis
  summarization: 'gpt-4', // For executive summaries
  extraction: 'gpt-3.5-turbo', // For action item extraction
  insights: 'gpt-4', // For strategic insights
} as const

// AI Processing configuration
export const AI_CONFIG = {
  maxTokens: {
    analysis: 1000,
    summarization: 300,
    extraction: 500,
    insights: 800,
  },
  temperature: {
    analysis: 0.1, // More deterministic for consistent analysis
    summarization: 0.2, // Slightly creative for natural summaries
    extraction: 0.0, // Completely deterministic for structured extraction
    insights: 0.3, // More creative for strategic insights
  },
  timeouts: {
    standard: 30000, // 30 seconds
    complex: 60000, // 60 seconds for complex analysis
  }
} as const

// Executive priorities and business context
export const EXECUTIVE_CONTEXT = {
  priorities: [
    'Strategic planning and M&A activities',
    'Board meeting preparations and governance',
    'Revenue and financial performance',
    'Customer escalations and relationship management',
    'Legal and compliance matters',
    'Organizational leadership and HR decisions',
    'Technology and innovation initiatives',
    'Partnership and business development',
  ],
  decisionThresholds: {
    critical: {
      financial: 10000000, // $10M+
      timeToDecision: 24, // Less than 24 hours
      stakeholderLevel: ['CEO', 'Board', 'C-Suite'],
      legalCompliance: true,
    },
    high: {
      financial: 1000000, // $1M+
      timeToDecision: 72, // Less than 72 hours
      stakeholderLevel: ['VP', 'Director', 'Executive'],
      customerImpact: 'Enterprise',
    },
    medium: {
      financial: 100000, // $100K+
      timeToDecision: 168, // Less than 1 week
      stakeholderLevel: ['Manager', 'Senior'],
      customerImpact: 'Standard',
    }
  },
  executiveRoles: [
    'CEO', 'Chief Executive Officer',
    'CFO', 'Chief Financial Officer', 
    'COO', 'Chief Operating Officer',
    'CTO', 'Chief Technology Officer',
    'CMO', 'Chief Marketing Officer',
    'CHRO', 'Chief Human Resources Officer',
    'General Counsel', 'Chief Legal Officer',
    'President', 'Vice President', 'VP',
    'Director', 'Managing Director',
    'Board Member', 'Chairman', 'Chairwoman'
  ]
} as const

// Error handling for AI operations
export class AIError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: Error
  ) {
    super(message)
    this.name = 'AIError'
  }
}

// Rate limiting and retry configuration
export const RATE_LIMIT_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second base delay
  backoffMultiplier: 2,
  rateLimitWindow: 60000, // 1 minute
  maxRequestsPerWindow: 100,
} as const