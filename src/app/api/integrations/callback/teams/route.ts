import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { IntegrationService } from '@/lib/integrations/integration-service'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    // Handle OAuth errors
    if (error) {
      console.error('Teams OAuth error:', error)
      return NextResponse.redirect(
        new URL('/dashboard/integrations?error=oauth_denied', request.url)
      )
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/dashboard/integrations?error=missing_code', request.url)
      )
    }

    // Exchange code for tokens
    const tokenUrl = `https://login.microsoftonline.com/${process.env.TEAMS_TENANT_ID}/oauth2/v2.0/token`
    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.TEAMS_CLIENT_ID!,
        client_secret: process.env.TEAMS_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/callback/teams`,
        grant_type: 'authorization_code',
        scope: 'https://graph.microsoft.com/.default',
      }),
    })

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text()
      console.error('Token exchange failed:', error)
      return NextResponse.redirect(
        new URL('/dashboard/integrations?error=token_exchange_failed', request.url)
      )
    }

    const tokens = await tokenResponse.json()

    // Get user info from Microsoft Graph
    const userInfoResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    })

    if (!userInfoResponse.ok) {
      console.error('Failed to get user info')
      return NextResponse.redirect(
        new URL('/dashboard/integrations?error=user_info_failed', request.url)
      )
    }

    const userInfo = await userInfoResponse.json()

    // Store tokens in database
    await IntegrationService.storeIntegrationTokens(
      'teams',
      {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: Math.floor(Date.now() / 1000) + tokens.expires_in,
        scope: tokens.scope,
      },
      {
        account_id: userInfo.id,
        account_email: userInfo.mail || userInfo.userPrincipalName,
        account_name: userInfo.displayName,
      },
      userId
    )

    // Redirect back to integrations page with success
    return NextResponse.redirect(
      new URL('/dashboard/integrations?success=teams_connected', request.url)
    )
  } catch (error) {
    console.error('Teams OAuth callback error:', error)
    return NextResponse.redirect(
      new URL('/dashboard/integrations?error=unexpected_error', request.url)
    )
  }
}