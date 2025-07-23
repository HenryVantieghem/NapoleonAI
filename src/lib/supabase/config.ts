// Supabase configuration and validation

export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
}

// Validate required environment variables
export function validateSupabaseConfig() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
  ]

  const missing = required.filter(key => !process.env[key])

  if (missing.length > 0) {
    throw new Error(
      `Missing required Supabase environment variables: ${missing.join(', ')}\n` +
      'Please check your .env.local file and ensure all Supabase variables are set.'
    )
  }
}

// Auth configuration for OAuth providers
export const authConfig = {
  google: {
    enabled: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },
  microsoft: {
    enabled: !!(process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET),
    clientId: process.env.MICROSOFT_CLIENT_ID,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
  },
  slack: {
    enabled: !!(process.env.SLACK_CLIENT_ID && process.env.SLACK_CLIENT_SECRET),
    clientId: process.env.SLACK_CLIENT_ID,
    clientSecret: process.env.SLACK_CLIENT_SECRET,
  },
}

// Real-time configuration
export const realtimeConfig = {
  enableRealtime: true,
  channels: {
    messages: 'messages',
    actionItems: 'action_items',
    vipContacts: 'vip_contacts',
  },
}

// Database table names (for type safety)
export const tables = {
  users: 'users',
  userProfiles: 'user_profiles',
  connectedAccounts: 'connected_accounts',
  messages: 'messages',
  actionItems: 'action_items',
  vipContacts: 'vip_contacts',
  relationshipInsights: 'relationship_insights',
} as const

// RLS policy names (for reference)
export const policies = {
  users: {
    select: 'Users can view own data',
    update: 'Users can update own data',
  },
  userProfiles: {
    all: 'Users can manage own profiles',
  },
  connectedAccounts: {
    all: 'Users can manage own accounts',
  },
  messages: {
    all: 'Users can manage own messages',
  },
  actionItems: {
    all: 'Users can manage own action items',
  },
  vipContacts: {
    all: 'Users can manage own vip contacts',
  },
  relationshipInsights: {
    all: 'Users can manage own insights',
  },
} as const