import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await currentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { 
      role, 
      painPoints, 
      companySize, 
      vipContacts, 
      connectedAccounts 
    } = body

    const supabase = createClient()

    // Save VIP contacts to database with priority levels
    if (vipContacts && vipContacts.length > 0) {
      const vipContactsToInsert = vipContacts.map((contact: any) => ({
        user_id: user.id,
        email: contact.email,
        name: contact.name,
        relationship_type: contact.relationshipType || 'Other',
        priority_level: getPriorityLevel(contact.relationshipType),
        source: contact.source || 'onboarding',
        company: contact.company || '',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))

      const { error: vipError } = await supabase
        .from('vip_contacts')
        .upsert(vipContactsToInsert, {
          onConflict: 'user_id,email',
          ignoreDuplicates: false
        })

      if (vipError) {
        console.error('Error saving VIP contacts:', vipError)
        return NextResponse.json(
          { error: 'Failed to save VIP contacts' },
          { status: 500 }
        )
      }

      console.log(`Saved ${vipContacts.length} VIP contacts for user ${user.id}`)
    }

    // Update user profile with onboarding completion
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: user.id,
        onboarding_completed: true,
        profile_data: {
          role: role,
          companySize: companySize,
          painPoints: painPoints || [],
          onboardingCompletedAt: new Date().toISOString(),
          vipContactsCount: vipContacts?.length || 0,
          connectedAccountsCount: connectedAccounts?.length || 0
        },
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      })

    if (profileError) {
      console.error('Error updating profile:', profileError)
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    // Note: Clerk metadata updates would need to be handled via Clerk Admin API
    // For now, we'll track onboarding status in our database
    console.log('Onboarding completed for user:', user.id)

    return NextResponse.json({
      success: true,
      message: 'Onboarding completed successfully',
      vipContactsSaved: vipContacts?.length || 0,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Onboarding completion error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to complete onboarding',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Convert relationship type to priority level for VIP scoring
 */
function getPriorityLevel(relationshipType: string): number {
  switch (relationshipType?.toLowerCase()) {
    case 'board member':
      return 10 // Highest priority
    case 'investor':
      return 9
    case 'executive':
      return 8
    case 'client':
      return 7
    case 'partner':
      return 6
    case 'vip':
      return 8
    default:
      return 5 // Default priority
  }
}