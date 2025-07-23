import { AuthWrapper } from "@/components/auth/auth-provider"
import { SessionTimeoutWarning, BiometricSetupPrompt } from "@/components/auth/auth-provider"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthWrapper requireAuth requireExecutive>
      <div className="min-h-screen bg-gray-50">
        <SessionTimeoutWarning />
        <BiometricSetupPrompt />
        {children}
      </div>
    </AuthWrapper>
  )
}