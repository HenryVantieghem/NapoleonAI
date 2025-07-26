"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Mail, MessageSquare, Building, Check, X, Loader2, Crown, Link2, Unlink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { IntegrationService, type IntegrationAccount, type IntegrationProvider } from "@/lib/integrations/integration-service"
import { useAuth } from "@/lib/hooks/use-auth"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface IntegrationConfig {
  provider: IntegrationProvider
  name: string
  description: string
  icon: React.ElementType
  color: string
  bgColor: string
  borderColor: string
}

const integrations: IntegrationConfig[] = [
  {
    provider: 'gmail',
    name: 'Gmail',
    description: 'Connect your Gmail account to manage emails',
    icon: Mail,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  {
    provider: 'slack',
    name: 'Slack',
    description: 'Connect your Slack workspace for team communication',
    icon: MessageSquare,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  },
  {
    provider: 'teams',
    name: 'Microsoft Teams',
    description: 'Connect Teams for enterprise collaboration',
    icon: Building,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  }
]

export default function IntegrationsPage() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth()
  const router = useRouter()
  const [connectedAccounts, setConnectedAccounts] = useState<IntegrationAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [connectingProvider, setConnectingProvider] = useState<IntegrationProvider | null>(null)

  const loadConnectedAccounts = useCallback(async () => {
    try {
      if (user?.id) {
        const accounts = await IntegrationService.getConnectedAccounts(user.id)
        setConnectedAccounts(accounts)
      }
    } catch (error) {
      console.error('Error loading connected accounts:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login')
      return
    }

    loadConnectedAccounts()
  }, [authLoading, isAuthenticated, router, loadConnectedAccounts])


  const handleConnect = async (provider: IntegrationProvider) => {
    setConnectingProvider(provider)
    
    try {
      // Generate OAuth URL and redirect
      const oauthUrl = IntegrationService.generateOAuthUrl(provider)
      window.location.href = oauthUrl
    } catch (error) {
      console.error('Error connecting integration:', error)
      setConnectingProvider(null)
    }
  }

  const handleDisconnect = async (provider: IntegrationProvider) => {
    if (!confirm(`Are you sure you want to disconnect ${provider}?`)) return
    
    setConnectingProvider(provider)
    
    try {
      if (user?.id) {
        await IntegrationService.disconnectIntegration(provider, user.id)
        await loadConnectedAccounts()
      }
    } catch (error) {
      console.error('Error disconnecting integration:', error)
    } finally {
      setConnectingProvider(null)
    }
  }

  const isConnected = (provider: IntegrationProvider) => {
    return connectedAccounts.some(account => account.provider === provider)
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-luxury flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-burgundy-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-luxury">
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-burgundy rounded-full shadow-burgundy-lg mb-6">
            <Link2 className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">
            Connect Your Accounts
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Integrate your communication platforms to unlock the full power of Napoleon AI's executive command center
          </p>
        </motion.div>

        {/* Integration Cards */}
        <div className="space-y-6">
          {integrations.map((integration, index) => {
            const Icon = integration.icon
            const connected = isConnected(integration.provider)
            const isConnecting = connectingProvider === integration.provider
            
            return (
              <motion.div
                key={integration.provider}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "bg-white rounded-2xl shadow-luxury border-2 p-6 transition-all duration-300",
                  connected ? "border-green-200" : "border-gray-100",
                  "hover:shadow-luxury-lg"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      integration.bgColor
                    )}>
                      <Icon className={cn("w-6 h-6", integration.color)} />
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {integration.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {integration.description}
                      </p>
                      {connected && (
                        <div className="flex items-center mt-1">
                          <Check className="w-4 h-4 text-green-600 mr-1" />
                          <span className="text-sm text-green-600">Connected</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={() => connected 
                      ? handleDisconnect(integration.provider)
                      : handleConnect(integration.provider)
                    }
                    disabled={isConnecting}
                    variant={connected ? "outline" : "luxury"}
                    className={cn(
                      "min-w-[120px]",
                      connected && "border-red-200 text-red-600 hover:bg-red-50"
                    )}
                  >
                    {isConnecting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : connected ? (
                      <>
                        <Unlink className="w-4 h-4 mr-2" />
                        Disconnect
                      </>
                    ) : (
                      <>
                        <Link2 className="w-4 h-4 mr-2" />
                        Connect
                      </>
                    )}
                  </Button>
                </div>

                {/* Connected Account Info */}
                {connected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 pt-4 border-t border-gray-100"
                  >
                    {connectedAccounts
                      .filter(account => account.provider === integration.provider)
                      .map(account => (
                        <div key={account.id} className="flex items-center justify-between text-sm">
                          <div className="text-gray-600">
                            <span className="font-medium">{account.account_email}</span>
                            {account.account_name && (
                              <span className="text-gray-500"> • {account.account_name}</span>
                            )}
                          </div>
                          <div className="text-gray-500">
                            Connected {new Date(account.connected_at).toLocaleDateString()}
                          </div>
                        </div>
                      ))
                    }
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Executive Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 bg-gradient-to-r from-burgundy-50 to-burgundy-100 rounded-2xl p-8 border border-burgundy-200"
        >
          <div className="flex items-center mb-4">
            <Crown className="w-6 h-6 text-burgundy-600 mr-3" />
            <h3 className="text-xl font-semibold text-gray-900">
              Executive Integration Benefits
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Unified Inbox</h4>
              <p className="text-gray-600">All your communications in one command center</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">AI Prioritization</h4>
              <p className="text-gray-600">Focus on what matters most to your business</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Time Savings</h4>
              <p className="text-gray-600">Save 8+ hours weekly on communication management</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}