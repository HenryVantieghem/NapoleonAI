import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { createServiceClient } from '@/lib/supabase/server'
import { validateExecutiveRole } from '@/lib/auth/clerk-auth'

export const dynamic = 'force-dynamic'

// GET /api/auth/profile - Get user profile with executive status
export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const supabase = createServiceClient()
    
    // Get or create user profile in Supabase
    let { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code === 'PGRST116') {
      // Profile doesn't exist, create it
      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: userId,
          preferences: {},
          onboarding_completed: false
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating profile:', createError)
        return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
      }
      profile = newProfile
    } else if (error) {
      console.error('Error fetching profile:', error)
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
    }

    // Get connected accounts
    const { data: connectedAccounts } = await supabase
      .from('connected_accounts')
      .select('provider, status, account_email, created_at')
      .eq('user_id', userId)
      .eq('status', 'active')

    // Check executive status
    const role = (user.publicMetadata?.role as string) || ''
    const isExecutive = validateExecutiveRole(role)
    
    const profileData = {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress || '',
      name: user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : user.username || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      imageUrl: user.imageUrl,
      role,
      isExecutive,
      biometricEnabled: user.publicMetadata?.biometricEnabled || false,
      preferences: profile?.preferences || {},
      onboardingCompleted: profile?.onboarding_completed || false,
      connectedAccounts: connectedAccounts || [],
      metadata: {
        createdAt: user.createdAt,
        lastActiveAt: user.lastActiveAt,
        lastSignInAt: user.lastSignInAt,
        emailVerified: user.emailAddresses[0]?.verification?.status === 'verified'
      }
    }

    return NextResponse.json({ profile: profileData })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/auth/profile - Update user profile
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { preferences, role, company, onboardingCompleted } = body

    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const supabase = createServiceClient()
    
    // Update Supabase profile
    const updates: any = {
      updated_at: new Date().toISOString()
    }
    
    if (preferences !== undefined) updates.preferences = preferences
    if (onboardingCompleted !== undefined) updates.onboarding_completed = onboardingCompleted
    
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', userId)

    if (profileError) {
      console.error('Error updating profile:', profileError)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    // Update Clerk metadata if role or company provided
    if (role || company) {
      const metadataUpdates: any = {
        ...user.publicMetadata
      }
      
      if (role) {
        metadataUpdates.role = role
        metadataUpdates.isExecutive = validateExecutiveRole(role)
      }
      if (company) {
        metadataUpdates.company = company
      }
      
      try {
        const { clerkClient } = await import('@clerk/nextjs/server')
        const client = await clerkClient()
        await client.users.updateUserMetadata(userId, {
          publicMetadata: metadataUpdates
        })
      } catch (clerkError) {
        console.error('Error updating Clerk metadata:', clerkError)
        // Don't fail the request for metadata update errors
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}