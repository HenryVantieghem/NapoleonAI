// Monitoring thresholds and alerting configuration for Napoleon AI

export interface Threshold {
  metric: string
  warning: number
  critical: number
  unit: string
  comparison: 'gt' | 'lt' | 'eq'
  description: string
}

export interface AlertConfig {
  name: string
  severity: 'info' | 'warning' | 'critical'
  thresholds: Threshold[]
  notificationChannels: string[]
  cooldownMinutes: number
  enabled: boolean
}

// Performance thresholds
export const performanceThresholds: Threshold[] = [
  {
    metric: 'response_time_p95',
    warning: 500,
    critical: 1000,
    unit: 'ms',
    comparison: 'gt',
    description: '95th percentile response time'
  },
  {
    metric: 'response_time_avg',
    warning: 200,
    critical: 500,
    unit: 'ms',
    comparison: 'gt',
    description: 'Average response time'
  },
  {
    metric: 'error_rate',
    warning: 1,
    critical: 5,
    unit: '%',
    comparison: 'gt',
    description: 'Error rate percentage'
  },
  {
    metric: 'uptime',
    warning: 99.9,
    critical: 99.5,
    unit: '%',
    comparison: 'lt',
    description: 'Service uptime percentage'
  },
  {
    metric: 'lighthouse_performance',
    warning: 85,
    critical: 75,
    unit: 'score',
    comparison: 'lt',
    description: 'Lighthouse performance score'
  }
]

// AI processing thresholds
export const aiThresholds: Threshold[] = [
  {
    metric: 'ai_success_rate',
    warning: 95,
    critical: 90,
    unit: '%',
    comparison: 'lt',
    description: 'AI processing success rate'
  },
  {
    metric: 'ai_processing_time',
    warning: 5000,
    critical: 10000,
    unit: 'ms',
    comparison: 'gt',
    description: 'AI processing time'
  },
  {
    metric: 'ai_fallback_rate',
    warning: 10,
    critical: 25,
    unit: '%',
    comparison: 'gt',
    description: 'AI fallback usage rate'
  },
  {
    metric: 'ai_daily_cost',
    warning: 100,
    critical: 200,
    unit: 'USD',
    comparison: 'gt',
    description: 'Daily AI processing cost'
  },
  {
    metric: 'ai_token_usage_rate',
    warning: 80,
    critical: 95,
    unit: '%',
    comparison: 'gt',
    description: 'AI token quota usage'
  }
]

// Business metrics thresholds
export const businessThresholds: Threshold[] = [
  {
    metric: 'daily_active_users',
    warning: 100,
    critical: 50,
    unit: 'users',
    comparison: 'lt',
    description: 'Daily active users'
  },
  {
    metric: 'user_retention_7d',
    warning: 70,
    critical: 50,
    unit: '%',
    comparison: 'lt',
    description: '7-day user retention rate'
  },
  {
    metric: 'churn_rate',
    warning: 5,
    critical: 10,
    unit: '%',
    comparison: 'gt',
    description: 'Monthly churn rate'
  },
  {
    metric: 'messages_per_user_daily',
    warning: 10,
    critical: 5,
    unit: 'messages',
    comparison: 'lt',
    description: 'Messages processed per user daily'
  }
]

// Infrastructure thresholds
export const infrastructureThresholds: Threshold[] = [
  {
    metric: 'cpu_usage',
    warning: 70,
    critical: 90,
    unit: '%',
    comparison: 'gt',
    description: 'CPU usage percentage'
  },
  {
    metric: 'memory_usage',
    warning: 80,
    critical: 95,
    unit: '%',
    comparison: 'gt',
    description: 'Memory usage percentage'
  },
  {
    metric: 'database_connections',
    warning: 80,
    critical: 95,
    unit: '%',
    comparison: 'gt',
    description: 'Database connection pool usage'
  },
  {
    metric: 'storage_usage',
    warning: 75,
    critical: 90,
    unit: '%',
    comparison: 'gt',
    description: 'Storage usage percentage'
  },
  {
    metric: 'queue_depth',
    warning: 1000,
    critical: 5000,
    unit: 'items',
    comparison: 'gt',
    description: 'Message queue depth'
  }
]

// Alert configurations
export const alertConfigs: AlertConfig[] = [
  {
    name: 'Critical System Health',
    severity: 'critical',
    thresholds: [
      ...performanceThresholds.filter(t => ['uptime', 'error_rate'].includes(t.metric)),
      ...infrastructureThresholds.filter(t => ['cpu_usage', 'memory_usage'].includes(t.metric))
    ],
    notificationChannels: ['pagerduty', 'slack-ops', 'email-oncall'],
    cooldownMinutes: 5,
    enabled: true
  },
  {
    name: 'AI Pipeline Health',
    severity: 'warning',
    thresholds: aiThresholds,
    notificationChannels: ['slack-ai', 'email-team'],
    cooldownMinutes: 15,
    enabled: true
  },
  {
    name: 'Performance Degradation',
    severity: 'warning',
    thresholds: performanceThresholds.filter(t => t.metric.includes('response_time')),
    notificationChannels: ['slack-ops'],
    cooldownMinutes: 10,
    enabled: true
  },
  {
    name: 'Business Metrics',
    severity: 'info',
    thresholds: businessThresholds,
    notificationChannels: ['slack-business', 'email-leadership'],
    cooldownMinutes: 60,
    enabled: true
  }
]

// SLA definitions
export const slaTargets = {
  uptime: 99.99, // 99.99% uptime (4.32 minutes/month)
  response_time_p95: 200, // 95% of requests under 200ms
  ai_success_rate: 95, // 95% AI processing success
  support_response_time: 15, // 15 minutes first response
  resolution_time_critical: 4, // 4 hours for critical issues
  resolution_time_major: 24, // 24 hours for major issues
}

// Monitoring intervals
export const monitoringConfig = {
  healthCheckInterval: 30, // seconds
  metricsCollectionInterval: 60, // seconds
  alertEvaluationInterval: 60, // seconds
  reportGenerationInterval: 3600, // seconds (hourly)
  retentionPeriod: 90, // days
}

// Health check endpoints
export const healthChecks = [
  {
    name: 'API Health',
    endpoint: '/api/health',
    timeout: 5000,
    expectedStatus: 200,
    critical: true
  },
  {
    name: 'Database Health',
    endpoint: '/api/health/database',
    timeout: 10000,
    expectedStatus: 200,
    critical: true
  },
  {
    name: 'AI Service Health',
    endpoint: '/api/health/ai',
    timeout: 15000,
    expectedStatus: 200,
    critical: false
  },
  {
    name: 'Authentication Health',
    endpoint: '/api/health/auth',
    timeout: 5000,
    expectedStatus: 200,
    critical: true
  },
  {
    name: 'Integration Health',
    endpoint: '/api/health/integrations',
    timeout: 10000,
    expectedStatus: 200,
    critical: false
  }
]

// Notification channels configuration
export const notificationChannels = {
  'pagerduty': {
    type: 'webhook',
    url: process.env.PAGERDUTY_WEBHOOK_URL,
    severity: ['critical'],
    enabled: process.env.NODE_ENV === 'production'
  },
  'slack-ops': {
    type: 'slack',
    webhook: process.env.SLACK_OPS_WEBHOOK,
    channel: '#ops-alerts',
    severity: ['critical', 'warning'],
    enabled: true
  },
  'slack-ai': {
    type: 'slack',
    webhook: process.env.SLACK_AI_WEBHOOK,
    channel: '#ai-monitoring',
    severity: ['warning', 'info'],
    enabled: true
  },
  'slack-business': {
    type: 'slack',
    webhook: process.env.SLACK_BUSINESS_WEBHOOK,
    channel: '#business-metrics',
    severity: ['info'],
    enabled: true
  },
  'email-oncall': {
    type: 'email',
    recipients: ['oncall@napoleonai.com'],
    severity: ['critical'],
    enabled: process.env.NODE_ENV === 'production'
  },
  'email-team': {
    type: 'email',
    recipients: ['team@napoleonai.com'],
    severity: ['warning'],
    enabled: true
  },
  'email-leadership': {
    type: 'email',
    recipients: ['leadership@napoleonai.com'],
    severity: ['info'],
    enabled: true
  }
}

// Utility functions
export function evaluateThreshold(value: number, threshold: Threshold): 'ok' | 'warning' | 'critical' {
  const { warning, critical, comparison } = threshold
  
  if (comparison === 'gt') {
    if (value >= critical) return 'critical'
    if (value >= warning) return 'warning'
  } else if (comparison === 'lt') {
    if (value <= critical) return 'critical'
    if (value <= warning) return 'warning'
  } else if (comparison === 'eq') {
    if (value === critical) return 'critical'
    if (value === warning) return 'warning'
  }
  
  return 'ok'
}

export function getThresholdsByCategory(category: string): Threshold[] {
  switch (category) {
    case 'performance':
      return performanceThresholds
    case 'ai':
      return aiThresholds
    case 'business':
      return businessThresholds
    case 'infrastructure':
      return infrastructureThresholds
    default:
      return []
  }
}

export function getAlertConfig(name: string): AlertConfig | undefined {
  return alertConfigs.find(config => config.name === name)
}

// Export all configurations
export default {
  performanceThresholds,
  aiThresholds,
  businessThresholds,
  infrastructureThresholds,
  alertConfigs,
  slaTargets,
  monitoringConfig,
  healthChecks,
  notificationChannels,
  evaluateThreshold,
  getThresholdsByCategory,
  getAlertConfig
}