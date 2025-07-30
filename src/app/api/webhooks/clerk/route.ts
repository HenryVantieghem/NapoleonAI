import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = headers()
  const svix_id = headerPayload.get("svix-id")
  const svix_timestamp = headerPayload.get("svix-timestamp")
  const svix_signature = headerPayload.get("svix-signature")

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '')

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occured', {
      status: 400
    })
  }

  // Get Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Handle the webhook
  const eventType = evt.type

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url, public_metadata } = evt.data

    const email = email_addresses[0]?.email_address
    if (!email) {
      return new Response('No email found', { status: 400 })
    }

    // Get profile data from public_metadata (stored during sign-up process)
    const profileData = public_metadata?.profileData as any || {}
    const name = profileData.fullName || (first_name && last_name ? `${first_name} ${last_name}` : first_name || last_name || '')
    const role = profileData.role || public_metadata?.role as string || ''
    const companySize = profileData.companySize || ''

    try {
      // Upsert user record with enhanced profile data
      const { error: userError } = await supabase
        .from('users')
        .upsert({
          id,
          email,
          name,
          role,
          avatar_url: image_url || '',
          company_size: companySize,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        })

      if (userError) {
        console.error('Error upserting user:', userError)
        return new Response('Error upserting user', { status: 500 })
      }

      // Create or update user profile with executive-specific settings
      const executiveSettings = {
        autoArchive: 7,
        priorityThreshold: role === 'ceo' || role === 'founder' ? 80 : 70,
        vipAlerts: true,
        boardMemberPriority: role === 'ceo' || role === 'founder' ? 95 : 85,
        investorPriority: 90,
        executiveDigest: 'morning',
        crossPlatformSync: true
      }

      const executivePreferences = {
        theme: 'executive', // Navy & Gold theme
        notifications: {
          email: true,
          push: true,
          digest: role === 'ceo' || role === 'founder' ? 'hourly' : 'daily',
          vipInstant: true,
          boardAlerts: true
        },
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        displayDensity: 'comfortable',
        aiSuggestions: true
      }

      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: id,
          preferences: executivePreferences,
          settings: executiveSettings,
          onboarding_completed: public_metadata?.onboardingCompleted === true,
          subscription_status: public_metadata?.subscriptionStatus || 'trial',
          profile_data: {
            role: role,
            companySize: companySize,
            executiveLevel: ['ceo', 'coo', 'cfo', 'cto', 'founder'].includes(role) ? 'c-suite' : 'executive',
            signupSource: 'direct',
            profileCompletedAt: new Date().toISOString()
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        })

      if (profileError) {
        console.error('Error upserting profile:', profileError)
        return new Response('Error upserting profile', { status: 500 })
      }

      console.log(`User ${id} (${role}) synced to Supabase with executive profile`)
    } catch (error) {
      console.error('Error in webhook handler:', error)
      return new Response('Internal server error', { status: 500 })
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data

    try {
      // Delete user and profile (cascade will handle profile deletion)
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting user:', error)
        return new Response('Error deleting user', { status: 500 })
      }

      console.log(`User ${id} deleted from Supabase`)
    } catch (error) {
      console.error('Error in webhook handler:', error)
      return new Response('Internal server error', { status: 500 })
    }
  }

  return new Response('Webhook processed', { status: 200 })
}