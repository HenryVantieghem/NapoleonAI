import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { gmailAPI } from '@/lib/integrations/gmail-api'
import { createClient } from '@/lib/supabase/server'

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
      console.error('Gmail OAuth error:', error)
      return NextResponse.redirect(
        new URL('/dashboard/integrations?error=oauth_denied', request.url)
      )
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/dashboard/integrations?error=missing_code', request.url)
      )
    }

    try {
      // Exchange code for tokens
      const tokens = await gmailAPI.exchangeCodeForTokens(code)
      
      // Get user info from Gmail
      gmailAPI.setAccessToken(tokens.access_token, tokens.refresh_token)
      const userInfo = await gmailAPI.getUserInfo()

      // Store the connection in database
      const supabase = createClient()
      const { error: dbError } = await supabase
        .from('connected_accounts')
        .upsert({
          user_id: userId,
          provider: 'gmail' as const,
          account_id: userInfo.email,
          account_email: userInfo.email,
          account_name: userInfo.name,
          status: 'active' as const,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString()
        }, {
          onConflict: 'user_id,provider'
        })

      if (dbError) {
        console.error('Database error storing Gmail connection:', dbError)
        return NextResponse.redirect(
          new URL('/dashboard/integrations?error=storage_failed', request.url)
        )
      }

      // Success - redirect to integrations page
      return NextResponse.redirect(
        new URL('/dashboard/integrations?success=gmail_connected', request.url)
      )
    } catch (error) {
      console.error('Error exchanging Gmail code:', error)
      return NextResponse.redirect(
        new URL('/dashboard/integrations?error=exchange_failed', request.url)
      )
    }
  } catch (error) {
    console.error('Gmail callback error:', error)
    return NextResponse.redirect(
      new URL('/dashboard/integrations?error=unknown', request.url)
    )
  }
}