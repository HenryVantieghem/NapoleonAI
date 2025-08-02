"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Mail, Check, X, Loader2, Crown, Link2, Unlink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/hooks/use-auth"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase/client"

// Disable static generation for dashboard pages
export const dynamic = 'force-dynamic'

export default function IntegrationsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isConnecting, setIsConnecting] = useState(false)
  const [gmailConnected, setGmailConnected] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkGmailConnection()
  }, [user])

  const checkGmailConnection = async () => {
    if (!user) return
    
    try {
      const { data } = await supabase
        .from('connected_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('provider', 'gmail')
        .single()
      
      setGmailConnected(data?.status === 'active')
    } catch (error) {
      console.error('Error checking Gmail connection:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async () => {
    setIsConnecting(true)
    // Redirect to Gmail OAuth flow
    window.location.href = `/api/integrations/callback/gmail?state=${user?.id}`
  }

  const handleDisconnect = async () => {
    setIsConnecting(true)
    try {
      await supabase
        .from('connected_accounts')
        .update({ status: 'inactive' })
        .eq('user_id', user?.id)
        .eq('provider', 'gmail')
      
      setGmailConnected(false)
    } catch (error) {
      console.error('Error disconnecting Gmail:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-display text-white mb-2">Email Integration</h1>
          <p className="text-gray-400">Connect your Gmail account to enable AI-powered email prioritization</p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className={cn(
            "relative p-6 rounded-xl border bg-gradient-to-br",
            gmailConnected 
              ? "from-green-900/10 to-green-800/5 border-green-800/30" 
              : "from-gray-900/50 to-gray-800/30 border-gray-700/50"
          )}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className={cn(
                "p-3 rounded-lg",
                gmailConnected ? "bg-red-50 dark:bg-red-900/20" : "bg-gray-50 dark:bg-gray-800/50"
              )}>
                <Mail className={cn("w-6 h-6", gmailConnected ? "text-red-600" : "text-gray-400")} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  Gmail
                  {gmailConnected && (
                    <span className="text-sm font-normal text-green-400 flex items-center gap-1">
                      <Check className="w-4 h-4" />
                      Connected
                    </span>
                  )}
                </h3>
                <p className="text-gray-400 mt-1">
                  Connect your Gmail account to manage emails with AI intelligence
                </p>
              </div>
            </div>
            
            <Button
              onClick={gmailConnected ? handleDisconnect : handleConnect}
              disabled={isConnecting}
              variant={gmailConnected ? "outline" : "primary"}
              className={cn(
                "min-w-[120px]",
                gmailConnected && "border-red-600/50 hover:bg-red-600/10"
              )}
            >
              {isConnecting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : gmailConnected ? (
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

          {gmailConnected && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ delay: 0.2 }}
              className="mt-4 pt-4 border-t border-gray-700/50"
            >
              <div className="text-sm text-gray-400">
                <Crown className="w-4 h-4 inline-block mr-1 text-gold" />
                Your Gmail is now connected. Napoleon AI will analyze and prioritize your emails automatically.
              </div>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 p-6 rounded-lg bg-navy/20 border border-navy/30"
        >
          <h3 className="text-lg font-semibold text-white mb-3">What happens when you connect Gmail?</h3>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-start">
              <Check className="w-5 h-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
              <span>AI analyzes your emails to identify priority messages</span>
            </li>
            <li className="flex items-start">
              <Check className="w-5 h-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
              <span>Automatic VIP detection for important contacts</span>
            </li>
            <li className="flex items-start">
              <Check className="w-5 h-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
              <span>Smart action item extraction from email content</span>
            </li>
            <li className="flex items-start">
              <Check className="w-5 h-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
              <span>Executive-grade security with encrypted token storage</span>
            </li>
          </ul>
        </motion.div>
      </motion.div>
    </div>
  )
}