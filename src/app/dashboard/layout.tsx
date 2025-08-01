import { AuthWrapper } from "@/components/auth/auth-provider"
import { SessionTimeoutWarning, BiometricSetupPrompt } from "@/components/auth/auth-provider"
import { Crown } from "lucide-react"

// Disable static generation for dashboard
export const dynamic = 'force-dynamic'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Fallback for when Clerk is not available (build time)
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  
  if (!clerkPublishableKey || clerkPublishableKey.includes('placeholder')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Crown className="w-16 h-16 text-burgundy-600 mx-auto mb-4" />
          <h1 className="text-2xl font-serif font-bold text-gray-900 mb-2">
            Dashboard Loading
          </h1>
          <p className="text-gray-600">
            Authentication service is being configured...
          </p>
        </div>
      </div>
    )
  }

  return (
    <AuthWrapper>
      <div className="min-h-screen bg-gray-50">
        <SessionTimeoutWarning />
        <BiometricSetupPrompt />
        {children}
      </div>
    </AuthWrapper>
  )
}