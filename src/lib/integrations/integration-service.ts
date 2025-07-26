import { createClient } from '@/lib/supabase/client'

export type IntegrationProvider = 'gmail' | 'slack' | 'teams'

export interface IntegrationAccount {
  id: string
  provider: IntegrationProvider
  account_email: string
  account_name?: string
  status: 'active' | 'inactive' | 'error'
  connected_at: string
}

export interface OAuthConfig {
  provider: IntegrationProvider
  clientId: string
  redirectUri: string
  scopes: string[]
  authUrl: string
  tokenUrl: string
}

// OAuth configurations for each provider
export const oauthConfigs: Record<IntegrationProvider, OAuthConfig> = {
  gmail: {
    provider: 'gmail',
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/callback/gmail`,
    scopes: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/gmail.labels'
    ],
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token'
  },
  slack: {
    provider: 'slack',
    clientId: process.env.NEXT_PUBLIC_SLACK_CLIENT_ID!,
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/callback/slack`,
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
      'team:read'
    ],
    authUrl: 'https://slack.com/oauth/v2/authorize',
    tokenUrl: 'https://slack.com/api/oauth.v2.access'
  },
  teams: {
    provider: 'teams',
    clientId: process.env.NEXT_PUBLIC_TEAMS_CLIENT_ID!,
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/callback/teams`,
    scopes: [
      'https://graph.microsoft.com/Mail.Read',
      'https://graph.microsoft.com/Mail.Send',
      'https://graph.microsoft.com/Mail.ReadWrite',
      'https://graph.microsoft.com/User.Read',
      'https://graph.microsoft.com/Calendars.Read',
      'https://graph.microsoft.com/Chat.Read',
      'https://graph.microsoft.com/Chat.ReadWrite',
      'https://graph.microsoft.com/ChannelMessage.Read.All',
      'https://graph.microsoft.com/Team.ReadBasic.All'
    ],
    authUrl: `https://login.microsoftonline.com/${process.env.TEAMS_TENANT_ID}/oauth2/v2.0/authorize`,
    tokenUrl: `https://login.microsoftonline.com/${process.env.TEAMS_TENANT_ID}/oauth2/v2.0/token`
  }
}

export class IntegrationService {
  // Generate OAuth URL for connecting a service
  static generateOAuthUrl(provider: IntegrationProvider, state?: string): string {
    const config = oauthConfigs[provider]
    
    const authParams = {
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      response_type: 'code',
      scope: config.scopes.join(' '),
      access_type: provider === 'gmail' ? 'offline' : undefined,
      prompt: provider === 'gmail' ? 'consent' : undefined,
      response_mode: provider === 'teams' ? 'query' : undefined,
      state: state || crypto.randomUUID()
    }
    
    // Filter out undefined values
    const filteredParams = Object.fromEntries(
      Object.entries(authParams).filter(([_, v]) => v !== undefined)
    ) as Record<string, string>
    
    const params = new URLSearchParams(filteredParams)
    
    return `${config.authUrl}?${params.toString()}`
  }
  
  // Get connected accounts for the current user
  static async getConnectedAccounts(userId?: string): Promise<IntegrationAccount[]> {
    if (!userId) return []
    
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('connected_accounts')
      .select('id, provider, account_email, account_name, status, created_at')
      .eq('user_id', userId)
      .eq('status', 'active')
    
    if (error) {
      console.error('Error fetching connected accounts:', error)
      return []
    }
    
    return data.map(account => ({
      id: account.id,
      provider: account.provider as IntegrationProvider,
      account_email: account.account_email || '',
      account_name: account.account_name || '',
      status: account.status,
      connected_at: account.created_at
    }))
  }
  
  // Store OAuth tokens after successful connection
  static async storeIntegrationTokens(
    provider: IntegrationProvider,
    tokens: {
      access_token: string
      refresh_token?: string
      expires_at?: number
      scope?: string
    },
    accountInfo: {
      account_id: string
      account_email: string
      account_name?: string
    },
    userId?: string
  ) {
    if (!userId) throw new Error('User not authenticated')
    
    const supabase = createClient()
    
    const { error } = await supabase
      .from('connected_accounts')
      .upsert({
        user_id: userId,
        provider,
        account_id: accountInfo.account_id,
        account_email: accountInfo.account_email,
        account_name: accountInfo.account_name,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: tokens.expires_at ? new Date(tokens.expires_at * 1000).toISOString() : null,
        scope: tokens.scope,
        status: 'active',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,provider,account_id'
      })
    
    if (error) {
      console.error('Error storing integration tokens:', error)
      throw error
    }
    
    return { success: true }
  }
  
  // Disconnect an integration
  static async disconnectIntegration(provider: IntegrationProvider, userId?: string) {
    if (!userId) throw new Error('User not authenticated')
    
    const supabase = createClient()
    
    const { error } = await supabase
      .from('connected_accounts')
      .update({ 
        status: 'inactive',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('provider', provider)
    
    if (error) {
      console.error('Error disconnecting integration:', error)
      throw error
    }
    
    return { success: true }
  }
  
  // Get tokens for API calls
  static async getIntegrationTokens(provider: IntegrationProvider, userId?: string) {
    if (!userId) return null
    
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('connected_accounts')
      .select('access_token, refresh_token, expires_at')
      .eq('user_id', userId)
      .eq('provider', provider)
      .eq('status', 'active')
      .single()
    
    if (error || !data) {
      console.error('Error fetching integration tokens:', error)
      return null
    }
    
    // Check if token is expired
    if (data.expires_at) {
      const expiresAt = new Date(data.expires_at).getTime()
      const now = Date.now()
      
      if (expiresAt < now) {
        console.warn(`Token for ${provider} has expired, attempting refresh...`)
        
        try {
          const refreshedTokens = await this.refreshToken(provider, data.refresh_token, userId)
          if (refreshedTokens) {
            return {
              accessToken: refreshedTokens.access_token,
              refreshToken: refreshedTokens.refresh_token || data.refresh_token,
              expiresAt: refreshedTokens.expires_at
            }
          }
        } catch (error) {
          console.error(`Failed to refresh token for ${provider}:`, error)
          return null
        }
      }
    }
    
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: data.expires_at
    }
  }
  
  // Refresh expired tokens
  static async refreshToken(
    provider: IntegrationProvider,
    refreshToken: string | null,
    userId?: string
  ): Promise<{
    access_token: string
    refresh_token?: string
    expires_at: string
  } | null> {
    if (!userId || !refreshToken) return null
    
    const config = oauthConfigs[provider]
    
    try {
      const params = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: config.clientId,
        client_secret: process.env[`${provider.toUpperCase()}_CLIENT_SECRET`] || ''
      })
      
      const response = await fetch(config.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params
      })
      
      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.statusText}`)
      }
      
      const tokens = await response.json()
      
      // Update tokens in database
      const supabase = createClient()
      const expiresAt = tokens.expires_in 
        ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
        : null
      
      await supabase
        .from('connected_accounts')
        .update({
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token || refreshToken,
          expires_at: expiresAt,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('provider', provider)
      
      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: expiresAt || ''
      }
    } catch (error) {
      console.error(`Failed to refresh ${provider} token:`, error)
      return null
    }
  }

  // Check if a specific integration is connected
  static async isIntegrationConnected(provider: IntegrationProvider, userId?: string): Promise<boolean> {
    const accounts = await this.getConnectedAccounts(userId)
    return accounts.some(account => account.provider === provider)
  }
}