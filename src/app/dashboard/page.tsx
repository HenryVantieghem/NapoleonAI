"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Crown, Search, LogOut, Mail, MessageSquare, Users, Clock, AlertCircle, 
  CheckCircle, Menu, X, Zap, Calendar, Star, Filter, MoreHorizontal,
  Archive, Reply, Trash2, Eye, ChevronRight, Settings
} from "lucide-react"
import { useUser } from "@clerk/nextjs"
import DailyDigestPanel from "@/components/dashboard/DailyDigestPanel"
import UnifiedInbox from "@/components/dashboard/UnifiedInbox"
import ContextPanel from "@/components/dashboard/ContextPanel"
import { useMessages } from "@/hooks/useMessages"

// Disable static generation for dashboard pages
export const dynamic = 'force-dynamic'

export default function CommandCenter() {
  const { user } = useUser()
  const [activePanel, setActivePanel] = useState<'sidebar' | 'main' | 'context'>('main')
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  // Filters and search state
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  
  // Custom hook for message management
  const { 
    messages, 
    loading, 
    error, 
    searchMessages, 
    filterMessages,
    selectedMessage,
    selectMessage,
    archiveMessage,
    snoozeMessage
  } = useMessages()

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Handle message selection
  const handleMessageSelect = (messageId: string) => {
    setSelectedMessageId(messageId)
    selectMessage(messageId)
    if (isMobile) {
      setActivePanel('context')
    }
  }

  // Handle filter toggle
  const toggleFilter = (filter: string) => {
    setActiveFilters(prev => 
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    )
  }

  // Grid template areas for different layouts
  const gridTemplateAreas = isMobile 
    ? '"main"'
    : sidebarCollapsed 
      ? '"main context"'
      : '"sidebar main context"'
  
  const gridTemplateColumns = isMobile
    ? '1fr'
    : sidebarCollapsed
      ? '1fr 340px'
      : '280px 1fr 340px'

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700">
      {/* Executive Header */}
      <header className="bg-navy-900 border-b border-gold/20 px-6 py-4 relative z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setActivePanel(activePanel === 'main' ? 'sidebar' : 'main')}
              className="lg:hidden p-2 text-gold-200 hover:text-gold transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop sidebar toggle */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:block p-2 text-gold-200 hover:text-gold transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-gold rounded-full flex items-center justify-center mr-3 shadow-gold">
                <Crown className="w-5 h-5 text-navy-900" />
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-serif font-bold text-white">Command Center</h1>
                <p className="text-xs text-gold-200 hidden lg:block">Executive Intelligence Platform</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:block text-sm text-gold-200">
              Welcome, {user?.firstName || 'Executive'}
            </div>
            <button 
              onClick={() => window.location.href = '/'}
              className="flex items-center space-x-2 text-gold-200 hover:text-gold transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Three-Column Command Center Layout */}
      <div 
        className="h-[calc(100vh-80px)] grid transition-all duration-300 ease-in-out"
        style={{
          gridTemplateAreas,
          gridTemplateColumns,
          gap: '0'
        }}
      >
        {/* Sidebar Panel - Daily Digest & Filters */}
        <AnimatePresence mode="wait">
          {(!isMobile || activePanel === 'sidebar') && !sidebarCollapsed && (
            <motion.div
              key="sidebar"
              initial={{ x: isMobile ? -280 : 0, opacity: isMobile ? 0 : 1 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: isMobile ? -280 : 0, opacity: isMobile ? 0 : 1 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className={`
                bg-white/95 backdrop-blur-luxury border-r border-gold/20 overflow-y-auto
                ${isMobile ? 'fixed inset-y-0 left-0 z-40 w-80' : ''}
              `}
              style={{ gridArea: 'sidebar' }}
            >
              {/* Mobile close button */}
              {isMobile && (
                <div className="flex justify-end p-4">
                  <button
                    onClick={() => setActivePanel('main')}
                    className="p-2 text-navy-600 hover:text-navy-900"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
              
              <DailyDigestPanel 
                messages={messages}
                loading={loading}
                activeFilters={activeFilters}
                onFilterToggle={toggleFilter}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Panel - Unified Inbox */}
        <div 
          className={`
            bg-cream/50 backdrop-blur-luxury overflow-hidden flex flex-col
            ${(!isMobile || activePanel === 'main') ? 'block' : 'hidden'}
          `}
          style={{ gridArea: 'main' }}
        >
          {/* Search Header */}
          <div className="bg-white/95 backdrop-blur-luxury border-b border-gold/20 p-4 lg:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-navy-600 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search messages, contacts, content..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    searchMessages(e.target.value)
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gold/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent bg-white/80 transition-all"
                />
              </div>
              
              {/* Filter Chips */}
              <div className="flex items-center space-x-2 overflow-x-auto">
                {[
                  { id: 'all', label: 'All', icon: Mail },
                  { id: 'vip', label: 'VIP', icon: Crown },
                  { id: 'high-priority', label: 'Urgent', icon: AlertCircle },
                  { id: 'unread', label: 'Unread', icon: Eye },
                  { id: 'today', label: 'Today', icon: Clock }
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => toggleFilter(id)}
                    className={`
                      flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                      ${activeFilters.includes(id)
                        ? id === 'vip' 
                          ? 'bg-gradient-gold text-navy-900 shadow-gold'
                          : id === 'high-priority'
                          ? 'bg-red-500 text-white shadow-lg'
                          : 'bg-navy-900 text-white shadow-lg'
                        : 'bg-white/80 text-navy-700 hover:bg-white border border-gold/20'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <UnifiedInbox
            messages={messages}
            loading={loading}
            error={error}
            selectedMessageId={selectedMessageId}
            onMessageSelect={handleMessageSelect}
            onArchive={archiveMessage}
            onSnooze={snoozeMessage}
            searchQuery={searchQuery}
            activeFilters={activeFilters}
          />
        </div>

        {/* Context Panel - Message Details & Actions */}
        <AnimatePresence mode="wait">
          {(!isMobile || activePanel === 'context') && (
            <motion.div
              key="context"
              initial={{ x: isMobile ? 340 : 0, opacity: isMobile ? 0 : 1 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: isMobile ? 340 : 0, opacity: isMobile ? 0 : 1 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className={`
                bg-white/95 backdrop-blur-luxury border-l border-gold/20 overflow-y-auto
                ${isMobile ? 'fixed inset-y-0 right-0 z-40 w-80' : ''}
              `}
              style={{ gridArea: 'context' }}
            >
              {/* Mobile close button */}
              {isMobile && (
                <div className="flex justify-between items-center p-4 border-b border-gold/20">
                  <h2 className="text-lg font-serif font-bold text-navy-900">Message Details</h2>
                  <button
                    onClick={() => setActivePanel('main')}
                    className="p-2 text-navy-600 hover:text-navy-900"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}

              <ContextPanel
                selectedMessage={selectedMessage}
                onReply={() => console.log('Reply clicked')}
                onArchive={() => selectedMessage && archiveMessage(selectedMessage.id)}
                onSnooze={() => selectedMessage && snoozeMessage(selectedMessage.id)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-navy-900 border-t border-gold/20 px-4 py-2 z-50">
          <div className="flex justify-around">
            {[
              { id: 'sidebar', label: 'Digest', icon: Crown },
              { id: 'main', label: 'Inbox', icon: Mail },
              { id: 'context', label: 'Details', icon: Eye }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActivePanel(id as any)}
                className={`
                  flex flex-col items-center space-y-1 py-2 px-3 rounded-lg transition-all
                  ${activePanel === id 
                    ? 'text-gold bg-gold/10' 
                    : 'text-gold-200 hover:text-gold'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mobile overlay */}
      {isMobile && activePanel !== 'main' && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setActivePanel('main')}
        />
      )}
    </div>
  )
}