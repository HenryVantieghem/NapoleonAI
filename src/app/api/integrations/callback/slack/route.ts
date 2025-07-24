import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { IntegrationService } from '@/lib/integrations/integration-service'

export const dynamic = 'force-dynamic'

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
      console.error('Slack OAuth error:', error)
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
    const tokenUrl = 'https://slack.com/api/oauth.v2.access'
    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.SLACK_CLIENT_ID!,
        client_secret: process.env.SLACK_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/callback/slack`,
      }),
    })

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text()
      console.error('Token exchange failed:', error)
      return NextResponse.redirect(
        new URL('/dashboard/integrations?error=token_exchange_failed', request.url)
      )
    }

    const tokenData = await tokenResponse.json()

    if (!tokenData.ok) {
      console.error('Slack OAuth error:', tokenData.error)
      return NextResponse.redirect(
        new URL('/dashboard/integrations?error=slack_oauth_failed', request.url)
      )
    }

    // Get user info
    const userInfoResponse = await fetch('https://slack.com/api/users.identity', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    const userInfo = await userInfoResponse.json()

    // Store tokens in database
    await IntegrationService.storeIntegrationTokens(
      'slack',
      {
        access_token: tokenData.access_token,
        scope: tokenData.scope,
      },
      {
        account_id: tokenData.team.id,
        account_email: userInfo.ok ? userInfo.user.email : tokenData.authed_user.id,
        account_name: tokenData.team.name,
      },
      userId
    )

    // Redirect back to integrations page with success
    return NextResponse.redirect(
      new URL('/dashboard/integrations?success=slack_connected', request.url)
    )
  } catch (error) {
    console.error('Slack OAuth callback error:', error)
    return NextResponse.redirect(
      new URL('/dashboard/integrations?error=unexpected_error', request.url)
    )
  }
}