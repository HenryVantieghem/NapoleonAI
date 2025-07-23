import { createClient } from '@/lib/supabase/client'
import { createServiceClient } from '@/lib/supabase/server'
import type { ConnectedAccountInsert } from '@/types/database'

// OAuth Provider Configurations
export const OAUTH_CONFIGS = {
  google: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scopes: [
      'openid',
      'email',
      'profile',
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.modify',
    ],
    redirectUri: process.env.NEXT_PUBLIC_SITE_URL + '/api/auth/callback/google',
  },
  microsoft: {
    authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    scopes: [
      'openid',
      'email',
      'profile',
      'https://graph.microsoft.com/Mail.Read',
      'https://graph.microsoft.com/Mail.Send',
      'https://graph.microsoft.com/User.Read',
    ],
    redirectUri: process.env.NEXT_PUBLIC_SITE_URL + '/api/auth/callback/microsoft',
  },
  slack: {
    authUrl: 'https://slack.com/oauth/v2/authorize',
    tokenUrl: 'https://slack.com/api/oauth.v2.access',
    scopes: [
      'channels:read',
      'groups:read',
      'im:read',
      'mpim:read',
      'channels:history',
      'groups:history',
      'im:history',
      'mpim:history',
      'chat:write',
      'users:read',
      'users:read.email',
    ],
    redirectUri: process.env.NEXT_PUBLIC_SITE_URL + '/api/auth/callback/slack',
  },
}

// Generate OAuth authorization URL
export function generateAuthUrl(provider: keyof typeof OAUTH_CONFIGS, userId: string) {
  const config = OAUTH_CONFIGS[provider]
  const params = new URLSearchParams({
    client_id: getClientId(provider),
    redirect_uri: config.redirectUri,
    scope: config.scopes.join(' '),
    response_type: 'code',
    state: generateState(userId, provider),
    access_type: 'offline', // For Google to get refresh token
    prompt: 'consent', // For Google to always show consent screen
  })

  return `${config.authUrl}?${params.toString()}`
}

// Generate secure state parameter
function generateState(userId: string, provider: string): string {
  const state = {
    userId,
    provider,
    timestamp: Date.now(),
    nonce: Math.random().toString(36).substring(2),
  }
  return Buffer.from(JSON.stringify(state)).toString('base64')
}

// Verify and parse state parameter
export function verifyState(stateParam: string): {
  userId: string
  provider: string
  timestamp: number
  nonce: string
} | null {
  try {
    const decoded = Buffer.from(stateParam, 'base64').toString('utf-8')
    const state = JSON.parse(decoded)
    
    // Verify timestamp (state expires after 10 minutes)
    if (Date.now() - state.timestamp > 10 * 60 * 1000) {
      throw new Error('State expired')
    }
    
    return state
  } catch (error) {
    console.error('Invalid state parameter:', error)
    return null
  }
}

// Exchange authorization code for access token
export async function exchangeCodeForToken(
  provider: keyof typeof OAUTH_CONFIGS,
  code: string
): Promise<{
  access_token: string
  refresh_token?: string
  expires_in?: number
  scope?: string
} | null> {
  const config = OAUTH_CONFIGS[provider]
  const clientId = getClientId(provider)
  const clientSecret = getClientSecret(provider)

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    redirect_uri: config.redirectUri,
    grant_type: 'authorization_code',
  })

  try {
    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: params.toString(),
    })

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error(`Error exchanging code for token (${provider}):`, error)
    return null
  }
}

// Refresh access token
export async function refreshAccessToken(
  provider: keyof typeof OAUTH_CONFIGS,
  refreshToken: string
): Promise<{
  access_token: string
  refresh_token?: string
  expires_in?: number
} | null> {
  const config = OAUTH_CONFIGS[provider]
  const clientId = getClientId(provider)
  const clientSecret = getClientSecret(provider)

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  })

  try {
    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: params.toString(),
    })

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error(`Error refreshing token (${provider}):`, error)
    return null
  }
}

// Save connected account to database
export async function saveConnectedAccount(
  userId: string,
  provider: keyof typeof OAUTH_CONFIGS,
  tokenData: any,
  accountInfo: {
    account_id: string
    account_email?: string
    account_name?: string
  }
): Promise<boolean> {
  const supabase = createServiceClient()

  const expiresAt = tokenData.expires_in 
    ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
    : null

  const accountData: ConnectedAccountInsert = {
    user_id: userId,
    provider,
    account_id: accountInfo.account_id,
    account_email: accountInfo.account_email,
    account_name: accountInfo.account_name,
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    expires_at: expiresAt,
    scope: tokenData.scope,
    status: 'active',
  }

  const { error } = await supabase
    .from('connected_accounts')
    .upsert(accountData, {
      onConflict: 'user_id,provider,account_id',
    })

  if (error) {
    console.error('Error saving connected account:', error)
    return false
  }

  return true
}

// Get account info from provider
export async function getAccountInfo(
  provider: keyof typeof OAUTH_CONFIGS,
  accessToken: string
): Promise<{
  account_id: string
  account_email?: string
  account_name?: string
} | null> {
  try {
    switch (provider) {
      case 'google':
        return await getGoogleAccountInfo(accessToken)
      case 'microsoft':
        return await getMicrosoftAccountInfo(accessToken)
      case 'slack':
        return await getSlackAccountInfo(accessToken)
      default:
        return null
    }
  } catch (error) {
    console.error(`Error getting account info (${provider}):`, error)
    return null
  }
}

async function getGoogleAccountInfo(accessToken: string) {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to get Google account info')
  }

  const data = await response.json()
  return {
    account_id: data.id,
    account_email: data.email,
    account_name: data.name,
  }
}

async function getMicrosoftAccountInfo(accessToken: string) {
  const response = await fetch('https://graph.microsoft.com/v1.0/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to get Microsoft account info')
  }

  const data = await response.json()
  return {
    account_id: data.id,
    account_email: data.mail || data.userPrincipalName,
    account_name: data.displayName,
  }
}

async function getSlackAccountInfo(accessToken: string) {
  const response = await fetch('https://slack.com/api/auth.test', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to get Slack account info')
  }

  const data = await response.json()
  
  if (!data.ok) {
    throw new Error('Slack auth test failed')
  }

  return {
    account_id: data.user_id,
    account_email: data.user,
    account_name: data.user,
  }
}

// Helper functions to get client credentials
function getClientId(provider: keyof typeof OAUTH_CONFIGS): string {
  switch (provider) {
    case 'google':
      return process.env.GOOGLE_CLIENT_ID!
    case 'microsoft':
      return process.env.MICROSOFT_CLIENT_ID!
    case 'slack':
      return process.env.SLACK_CLIENT_ID!
    default:
      throw new Error(`Unknown provider: ${provider}`)
  }
}

function getClientSecret(provider: keyof typeof OAUTH_CONFIGS): string {
  switch (provider) {
    case 'google':
      return process.env.GOOGLE_CLIENT_SECRET!
    case 'microsoft':
      return process.env.MICROSOFT_CLIENT_SECRET!
    case 'slack':
      return process.env.SLACK_CLIENT_SECRET!
    default:
      throw new Error(`Unknown provider: ${provider}`)
  }
}