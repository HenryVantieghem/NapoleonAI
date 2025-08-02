"use client"

import { useState, useEffect } from "react"
import { Crown, LogOut, Mail, Clock, RefreshCw, AlertCircle } from "lucide-react"
import { useUser } from "@clerk/nextjs"

// Disable static generation for dashboard pages
export const dynamic = 'force-dynamic'

type Message = {
  id: string
  from: string
  subject: string
  snippet: string
  timestamp: string
  isRead: boolean
}

export default function GmailInbox() {
  const { user } = useUser()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch Gmail messages
  const fetchMessages = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/gmail/messages?max=10')
      const data = await response.json()
      
      if (data.needsAuth) {
        setError('Please connect your Gmail account')
        return
      }
      
      if (data.error) {
        setError(data.error)
        return
      }
      
      setMessages(data.messages || [])
      setError(null)
    } catch (err) {
      setError('Failed to load messages')
      console.error('Failed to fetch messages:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [])

  return (
    <div className="min-h-screen bg-[#0B0D11]">
      {/* Header */}
      <header className="bg-[#0B0D11]/80 backdrop-blur-sm border-b border-[#D4AF37]/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#D4AF37] to-[#B8941F] rounded-full flex items-center justify-center">
              <Crown className="w-6 h-6 text-[#0B0D11]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Gmail Smart Inbox</h1>
              <p className="text-sm text-[#D4AF37]/80">Transform chaos into clarity</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:block text-right">
              <div className="text-lg font-medium text-white">Welcome, {user?.firstName || 'User'}</div>
              <div className="text-sm text-gray-400">Your messages await</div>
            </div>
            <button 
              onClick={() => window.location.href = '/'}
              className="flex items-center space-x-2 px-4 py-2 bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/30 transition-all duration-300 rounded-lg"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Action Bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Mail className="w-5 h-5 text-[#D4AF37]" />
              <h2 className="text-xl font-semibold text-white">Recent Messages</h2>
              <span className="text-sm text-gray-400">({messages.length})</span>
            </div>
            <button
              onClick={fetchMessages}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-[#D4AF37] text-[#0B0D11] rounded-lg hover:bg-[#F4C842] transition-all duration-300 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Messages List */}
          <div className="space-y-4">
            {loading && (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 text-[#D4AF37] animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Loading your messages...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 text-center">
                <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-4" />
                <p className="text-red-300 mb-4">{error}</p>
                {error.includes('connect') && (
                  <button
                    onClick={() => window.location.href = '/auth/signup'}
                    className="px-6 py-2 bg-[#D4AF37] text-[#0B0D11] rounded-lg hover:bg-[#F4C842] transition-all duration-300"
                  >
                    Connect Gmail
                  </button>
                )}
              </div>
            )}

            {!loading && !error && messages.length === 0 && (
              <div className="text-center py-12">
                <Mail className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">Your inbox is empty</p>
                <p className="text-gray-500 text-sm">New messages will appear here</p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`
                  bg-gray-900/40 backdrop-blur-sm border border-gray-800 rounded-lg p-6 hover:bg-gray-900/60 transition-all duration-300 cursor-pointer
                  ${!message.isRead ? 'border-[#D4AF37]/30 bg-[#D4AF37]/5' : ''}
                `}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-white truncate">{message.from}</h3>
                      {!message.isRead && (
                        <div className="w-2 h-2 bg-[#D4AF37] rounded-full"></div>
                      )}
                    </div>
                    <h4 className="text-lg text-gray-200 mb-2 line-clamp-1">{message.subject}</h4>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(message.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
                <p className="text-gray-400 text-sm line-clamp-2">{message.snippet}</p>
              </div>
            ))}
          </div>

          {/* Connect Gmail CTA */}
          {!loading && !error && messages.length === 0 && (
            <div className="text-center mt-12">
              <button
                onClick={() => window.location.href = '/auth/signup'}
                className="inline-flex items-center space-x-3 bg-[#D4AF37] text-[#0B0D11] px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#F4C842] transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Mail className="w-6 h-6" />
                <span>Connect Gmail</span>
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}