import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'

export const dynamic = 'force-dynamic'

// POST /api/auth/biometric/setup - Setup biometric authentication
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { credentialId, publicKey, challenge } = body

    // In a production app, you would:
    // 1. Verify the credential challenge
    // 2. Store the credential ID and public key
    // 3. Associate it with the user account
    
    // For now, just update the user metadata
    try {
      const { clerkClient } = await import('@clerk/nextjs/server')
      const client = await clerkClient()
      await client.users.updateUserMetadata(userId, {
        publicMetadata: {
          ...user.publicMetadata,
          biometricEnabled: true,
          biometricSetupDate: new Date().toISOString(),
          // Note: In production, never store actual keys in metadata
          credentialId: credentialId
        }
      })

      return NextResponse.json({ 
        success: true,
        message: 'Biometric authentication setup successfully'
      })
    } catch (clerkError) {
      console.error('Error updating Clerk metadata:', clerkError)
      return NextResponse.json({ error: 'Failed to setup biometric authentication' }, { status: 500 })
    }
  } catch (error) {
    console.error('Biometric setup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/auth/biometric/disable - Disable biometric authentication
export async function DELETE() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    try {
      const { clerkClient } = await import('@clerk/nextjs/server')
      const client = await clerkClient()
      await client.users.updateUserMetadata(userId, {
        publicMetadata: {
          ...user.publicMetadata,
          biometricEnabled: false,
          biometricDisabledDate: new Date().toISOString(),
          credentialId: null
        }
      })

      return NextResponse.json({ 
        success: true,
        message: 'Biometric authentication disabled successfully'
      })
    } catch (clerkError) {
      console.error('Error updating Clerk metadata:', clerkError)
      return NextResponse.json({ error: 'Failed to disable biometric authentication' }, { status: 500 })
    }
  } catch (error) {
    console.error('Biometric disable error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/auth/biometric/status - Get biometric authentication status
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

    const biometricEnabled = user.publicMetadata?.biometricEnabled || false
    const setupDate = user.publicMetadata?.biometricSetupDate
    
    return NextResponse.json({ 
      enabled: biometricEnabled,
      setupDate,
      hasCredential: !!user.publicMetadata?.credentialId
    })
  } catch (error) {
    console.error('Biometric status error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}