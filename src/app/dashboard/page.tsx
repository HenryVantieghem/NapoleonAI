import { CommandCenter } from "@/components/dashboard/command-center"

// Disable static generation for dashboard pages
export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  return <CommandCenter />
}