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
    <div className="min-h-screen bg-gradient-jet-black relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-champagneGold/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-32 right-16 w-80 h-80 bg-midnightBlue/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-champagneGold/3 rounded-full blur-2xl animate-float" style={{ animationDelay: '6s' }} />
      </div>

      {/* Executive Glassmorphic Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-jetBlack/60 backdrop-blur-executive border-b border-champagneGold/20 px-6 py-4 relative z-50 shadow-private-jet-glass"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {/* Mobile menu button */}
            <button
              onClick={() => setActivePanel(activePanel === 'main' ? 'sidebar' : 'main')}
              className="lg:hidden p-3 text-champagneGold/80 hover:text-champagneGold transition-all duration-300 rounded-xl hover:bg-champagneGold/10"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Desktop sidebar toggle */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:block p-3 text-champagneGold/80 hover:text-champagneGold transition-all duration-300 rounded-xl hover:bg-champagneGold/10"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex items-center">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
                className="w-12 h-12 bg-gradient-champagne/20 backdrop-blur-luxury rounded-full flex items-center justify-center mr-4 shadow-champagne-glow border border-champagneGold/30"
              >
                <Crown className="w-6 h-6 text-champagneGold" />
              </motion.div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-serif font-bold text-text-primary">Command Center</h1>
                <p className="text-sm text-champagneGold/80 hidden lg:block font-medium">Executive Intelligence Platform</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-right">
                <div className="text-lg font-medium text-text-primary">Welcome, {user?.firstName || 'Executive'}</div>
                <div className="text-sm text-champagneGold/80">Ready for strategic clarity</div>
              </div>
            </div>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = '/'}
              className="flex items-center space-x-2 px-4 py-2 bg-jetBlack/40 backdrop-blur-glass border border-champagneGold/20 text-champagneGold hover:border-champagneGold/40 transition-all duration-300 rounded-xl"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden md:inline font-medium">Logout</span>
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Three-Panel Executive Command Center Layout */}
      <div 
        className="h-[calc(100vh-88px)] grid transition-all duration-500 ease-in-out relative z-10"
        style={{
          gridTemplateAreas,
          gridTemplateColumns,
          gap: '1px'
        }}
      >
        {/* Sidebar Panel - Strategic Digest & Intelligence */}
        <AnimatePresence mode="wait">
          {(!isMobile || activePanel === 'sidebar') && !sidebarCollapsed && (
            <motion.div
              key="sidebar"
              initial={{ x: isMobile ? -320 : 0, opacity: isMobile ? 0 : 1 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: isMobile ? -320 : 0, opacity: isMobile ? 0 : 1 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className={`
                bg-jetBlack/40 backdrop-blur-executive border-r border-champagneGold/20 overflow-y-auto shadow-private-jet-glass
                ${isMobile ? 'fixed inset-y-0 left-0 z-40 w-80' : ''}
              `}
              style={{ gridArea: 'sidebar' }}
            >
              {/* Mobile close button */}
              {isMobile && (
                <div className="flex justify-end p-6">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setActivePanel('main')}
                    className="p-3 text-champagneGold/80 hover:text-champagneGold rounded-xl hover:bg-champagneGold/10 transition-all duration-300"
                  >
                    <X className="w-6 h-6" />
                  </motion.button>
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

        {/* Main Panel - Executive Unified Inbox */}
        <div 
          className={`
            bg-jetBlack/30 backdrop-blur-executive overflow-hidden flex flex-col shadow-private-jet-glass
            ${(!isMobile || activePanel === 'main') ? 'block' : 'hidden'}
          `}
          style={{ gridArea: 'main' }}
        >
          {/* Executive Search & Filter Header */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-jetBlack/60 backdrop-blur-executive border-b border-champagneGold/20 p-6 shadow-luxury-glass"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
              {/* Executive Search */}
              <div className="relative flex-1 max-w-lg">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-champagneGold/60 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search messages, contacts, strategic insights..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    searchMessages(e.target.value)
                  }}
                  className="w-full pl-12 pr-4 py-4 bg-jetBlack/20 backdrop-blur-glass border border-champagneGold/20 rounded-2xl text-text-primary placeholder-text-secondary/60 focus:border-champagneGold/40 focus:ring-2 focus:ring-champagneGold/20 transition-all text-lg font-medium"
                />
              </div>
              
              {/* Executive Filter Chips */}
              <div className="flex items-center space-x-3 overflow-x-auto">
                {[
                  { id: 'all', label: 'All Messages', icon: Mail },
                  { id: 'vip', label: 'VIP Priority', icon: Crown },
                  { id: 'high-priority', label: 'Urgent', icon: AlertCircle },
                  { id: 'unread', label: 'Unread', icon: Eye },
                  { id: 'today', label: 'Today', icon: Clock }
                ].map(({ id, label, icon: Icon }) => (
                  <motion.button
                    key={id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleFilter(id)}
                    className={`
                      flex items-center space-x-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap border
                      ${activeFilters.includes(id)
                        ? id === 'vip' 
                          ? 'bg-gradient-champagne text-jetBlack shadow-champagne-glow border-champagneGold'
                          : id === 'high-priority'
                          ? 'bg-red-500/80 backdrop-blur-glass text-white shadow-lg border-red-400'
                          : 'bg-champagneGold/20 backdrop-blur-glass text-champagneGold shadow-champagne border-champagneGold/40'
                        : 'bg-jetBlack/20 backdrop-blur-glass text-text-secondary hover:text-champagneGold border-champagneGold/20 hover:border-champagneGold/40'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

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

        {/* Context Panel - Executive Intelligence & Actions */}
        <AnimatePresence mode="wait">
          {(!isMobile || activePanel === 'context') && (
            <motion.div
              key="context"
              initial={{ x: isMobile ? 360 : 0, opacity: isMobile ? 0 : 1 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: isMobile ? 360 : 0, opacity: isMobile ? 0 : 1 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className={`
                bg-jetBlack/40 backdrop-blur-executive border-l border-champagneGold/20 overflow-y-auto shadow-private-jet-glass
                ${isMobile ? 'fixed inset-y-0 right-0 z-40 w-80' : ''}
              `}
              style={{ gridArea: 'context' }}
            >
              {/* Mobile close button */}
              {isMobile && (
                <div className="flex justify-between items-center p-6 border-b border-champagneGold/20">
                  <h2 className="text-xl font-serif font-bold text-text-primary">Executive Intelligence</h2>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setActivePanel('main')}
                    className="p-3 text-champagneGold/80 hover:text-champagneGold rounded-xl hover:bg-champagneGold/10 transition-all duration-300"
                  >
                    <X className="w-6 h-6" />
                  </motion.button>
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

      {/* Executive Mobile Navigation */}
      {isMobile && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="fixed bottom-0 left-0 right-0 bg-jetBlack/80 backdrop-blur-executive border-t border-champagneGold/20 px-6 py-4 z-50 shadow-private-jet-glass"
        >
          <div className="flex justify-around">
            {[
              { id: 'sidebar', label: 'Strategic Digest', icon: Crown },
              { id: 'main', label: 'Unified Inbox', icon: Mail },
              { id: 'context', label: 'Intelligence', icon: Eye }
            ].map(({ id, label, icon: Icon }) => (
              <motion.button
                key={id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActivePanel(id as any)}
                className={`
                  flex flex-col items-center space-y-2 py-3 px-4 rounded-xl transition-all duration-300
                  ${activePanel === id 
                    ? 'text-champagneGold bg-champagneGold/10 shadow-champagne border border-champagneGold/30' 
                    : 'text-text-secondary hover:text-champagneGold hover:bg-champagneGold/5'
                  }
                `}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-medium">{label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Executive Mobile Overlay */}
      {isMobile && activePanel !== 'main' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-jetBlack/60 backdrop-blur-glass z-30"
          onClick={() => setActivePanel('main')}
        />
      )}
    </div>
  )
}