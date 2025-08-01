import { Analytics } from '@segment/analytics-node'

// Initialize Segment Analytics
const analytics = new Analytics({
  writeKey: process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY || '',
  flushAt: 20,
  flushInterval: 10000,
})

// User identification
export async function identifyUser(userId: string, traits?: {
  email?: string
  name?: string
  role?: string
  company?: string
  plan?: string
  createdAt?: Date
}) {
  if (!process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY) return

  analytics.identify({
    userId,
    traits: {
      ...traits,
      source: 'napoleon-ai',
    },
  })
}

// Track events
export async function track(
  userId: string,
  event: string,
  properties?: Record<string, any>
) {
  if (!process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY) return

  analytics.track({
    userId,
    event,
    properties: {
      ...properties,
      timestamp: new Date().toISOString(),
      platform: 'web',
    },
  })
}

// Page views
export async function page(
  userId: string,
  name: string,
  properties?: Record<string, any>
) {
  if (!process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY) return

  analytics.page({
    userId,
    name,
    properties,
  })
}

// Executive-specific events
export const ExecutiveEvents = {
  // Onboarding
  ONBOARDING_STARTED: 'Onboarding Started',
  ONBOARDING_COMPLETED: 'Onboarding Completed',
  ONBOARDING_SKIPPED: 'Onboarding Skipped',
  ROLE_SELECTED: 'Role Selected',
  PAIN_POINTS_SELECTED: 'Pain Points Selected',
  PLATFORMS_CONNECTED: 'Platforms Connected',
  VIP_CONTACTS_ADDED: 'VIP Contacts Added',

  // Authentication
  SIGNUP_STARTED: 'Signup Started',
  SIGNUP_COMPLETED: 'Signup Completed',
  LOGIN_SUCCESS: 'Login Success',
  LOGIN_FAILED: 'Login Failed',
  LOGOUT: 'Logout',
  SESSION_EXTENDED: 'Session Extended',

  // Dashboard Usage
  DASHBOARD_VIEWED: 'Dashboard Viewed',
  MESSAGE_VIEWED: 'Message Viewed',
  MESSAGE_ARCHIVED: 'Message Archived',
  MESSAGE_SNOOZED: 'Message Snoozed',
  MESSAGE_STARRED: 'Message Starred',
  MESSAGE_REPLIED: 'Message Replied',
  SEARCH_PERFORMED: 'Search Performed',
  FILTER_APPLIED: 'Filter Applied',
  
  // AI Features
  AI_SUMMARY_REQUESTED: 'AI Summary Requested',
  AI_SUMMARY_VIEWED: 'AI Summary Viewed',
  ACTION_ITEM_CREATED: 'Action Item Created',
  ACTION_ITEM_COMPLETED: 'Action Item Completed',
  PRIORITY_OVERRIDE: 'Priority Override',
  DIGEST_VIEWED: 'Daily Digest Viewed',
  
  // Integrations
  GMAIL_CONNECTED: 'Gmail Connected',
  SLACK_CONNECTED: 'Slack Connected',
  TEAMS_CONNECTED: 'Teams Connected',
  INTEGRATION_DISCONNECTED: 'Integration Disconnected',
  
  // Settings
  SETTINGS_UPDATED: 'Settings Updated',
  VIP_CONTACT_ADDED: 'VIP Contact Added',
  VIP_CONTACT_REMOVED: 'VIP Contact Removed',
  NOTIFICATION_PREFERENCES_UPDATED: 'Notification Preferences Updated',
  
  // Errors
  ERROR_OCCURRED: 'Error Occurred',
  API_ERROR: 'API Error',
  
  // Performance
  SLOW_LOAD: 'Slow Page Load',
  CRASH_DETECTED: 'App Crash Detected',
}

// Track executive metrics
export async function trackExecutiveMetric(
  userId: string,
  metric: keyof typeof ExecutiveMetrics,
  value: number,
  metadata?: Record<string, any>
) {
  await track(userId, 'Executive Metric', {
    metric,
    value,
    ...metadata,
  })
}

export const ExecutiveMetrics = {
  TIME_SAVED_MINUTES: 'time_saved_minutes',
  MESSAGES_PROCESSED: 'messages_processed',
  VIP_RESPONSE_TIME: 'vip_response_time_minutes',
  ACTION_ITEMS_COMPLETED: 'action_items_completed',
  PRIORITY_ACCURACY: 'priority_accuracy_percent',
  DAILY_ACTIVE_TIME: 'daily_active_minutes',
}

// Group analytics for company tracking
export async function group(
  userId: string,
  groupId: string,
  traits?: {
    name?: string
    industry?: string
    employees?: number
    plan?: string
  }
) {
  if (!process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY) return

  analytics.group({
    userId,
    groupId,
    traits,
  })
}

// Alias for user ID changes
export async function alias(userId: string, previousId: string) {
  if (!process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY) return

  analytics.alias({
    userId,
    previousId,
  })
}

// Flush events (for server-side)
export async function flush() {
  if (!process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY) return

  await analytics.closeAndFlush()
}

// Privacy controls
export function optOut(userId: string) {
  // Store opt-out preference
  if (typeof window !== 'undefined') {
    localStorage.setItem(`analytics_optout_${userId}`, 'true')
  }
}

export function optIn(userId: string) {
  // Remove opt-out preference
  if (typeof window !== 'undefined') {
    localStorage.removeItem(`analytics_optout_${userId}`)
  }
}

export function isOptedOut(userId: string): boolean {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(`analytics_optout_${userId}`) === 'true'
  }
  return false
}

// Wrapper that respects opt-out
export async function trackSafely(
  userId: string,
  event: string,
  properties?: Record<string, any>
) {
  if (!isOptedOut(userId)) {
    await track(userId, event, properties)
  }
}

// Client-side analytics instance
let clientAnalytics: any = null

export function getClientAnalytics() {
  if (typeof window === 'undefined') return null

  if (!clientAnalytics && window.analytics) {
    clientAnalytics = window.analytics
  }

  return clientAnalytics
}

// Initialize client-side analytics
export function initializeAnalytics() {
  if (typeof window === 'undefined') return

  // Load Segment snippet
  const script = document.createElement('script')
  script.innerHTML = `
    !function(){var analytics=window.analytics=window.analytics||[];if(!analytics.initialize)if(analytics.invoked)window.console&&console.error&&console.error("Segment snippet included twice.");else{analytics.invoked=!0;analytics.methods=["trackSubmit","trackClick","trackLink","trackForm","pageview","identify","reset","group","track","ready","alias","debug","page","once","off","on","addSourceMiddleware","addIntegrationMiddleware","setAnonymousId","addDestinationMiddleware"];analytics.factory=function(e){return function(){var t=Array.prototype.slice.call(arguments);t.unshift(e);analytics.push(t);return analytics}};for(var e=0;e<analytics.methods.length;e++){var key=analytics.methods[e];analytics[key]=analytics.factory(key)}analytics.load=function(key,e){var t=document.createElement("script");t.type="text/javascript";t.async=!0;t.src="https://cdn.segment.com/analytics.js/v1/" + key + "/analytics.min.js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(t,n);analytics._loadOptions=e};analytics._writeKey="${process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY}";;analytics.SNIPPET_VERSION="4.15.3";
    analytics.load("${process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY}");
    }}();
  `
  document.head.appendChild(script)
}

// Export singleton instance
export default {
  identify: identifyUser,
  track,
  page,
  group,
  alias,
  flush,
  trackExecutiveMetric,
  optOut,
  optIn,
  isOptedOut,
  trackSafely,
  initializeAnalytics,
  getClientAnalytics,
  events: ExecutiveEvents,
  metrics: ExecutiveMetrics,
}