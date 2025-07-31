"use client"

import { motion } from "framer-motion"
import { Star, Crown, Mail, Building } from "lucide-react"

interface VipCardProps {
  contact: {
    email: string
    name: string
    relationshipType: string
    source?: 'suggested' | 'manual' | 'imported'
  }
  selected: boolean
  onClick: () => void
  variant?: 'default' | 'compact'
  showSource?: boolean
}

const relationshipIcons = {
  'Board Member': Crown,
  'Investor': Star,
  'Executive': Building,
  'Client': Mail,
  'Partner': Building,
  'VIP': Star,
  'Other': Star
}

const relationshipColors = {
  'Board Member': 'from-purple-500 to-purple-600',
  'Investor': 'from-emerald-500 to-emerald-600', 
  'Executive': 'from-navy-500 to-navy-600',
  'Client': 'from-blue-500 to-blue-600',
  'Partner': 'from-gold-500 to-gold-600',
  'VIP': 'from-gold-500 to-gold-600',
  'Other': 'from-gray-500 to-gray-600'
}

export default function VipCard({
  contact,
  selected,
  onClick,
  variant = 'default',
  showSource = false
}: VipCardProps) {
  const IconComponent = relationshipIcons[contact.relationshipType as keyof typeof relationshipIcons] || Star
  const iconGradient = relationshipColors[contact.relationshipType as keyof typeof relationshipColors] || relationshipColors.Other
  
  // Extract initials for avatar
  const initials = contact.name
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={`relative w-full p-4 rounded-xl border-2 transition-all duration-300 text-left ${
        selected
          ? 'border-gold bg-gold-50 shadow-lg ring-2 ring-gold/20'
          : 'border-gray-200 hover:border-gold-300 hover:bg-gold-50/30 hover:shadow-md'
      } ${variant === 'compact' ? 'p-3' : ''}`}
    >
      {/* Selection indicator */}
      {selected && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="absolute top-3 right-3"
        >
          <div className="w-6 h-6 bg-gold rounded-full flex items-center justify-center">
            <Star className="w-3 h-3 text-white fill-current" />
          </div>
        </motion.div>
      )}
      
      <div className="flex items-center space-x-4">
        {/* Avatar */}
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-to-br from-navy-100 to-navy-200 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold text-navy-700">
              {initials}
            </span>
          </div>
          
          {/* Relationship type indicator */}
          <div className={`absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br ${iconGradient} rounded-full flex items-center justify-center shadow-sm`}>
            <IconComponent className="w-3 h-3 text-white" />
          </div>
        </div>
        
        {/* Contact info */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-navy-900 truncate">
            {contact.name}
          </div>
          <div className="text-sm text-navy-600 truncate">
            {contact.relationshipType}
          </div>
          <div className="text-xs text-navy-500 truncate">
            {contact.email}
          </div>
        </div>
        
        {/* Source indicator */}
        {showSource && contact.source && (
          <div className="text-xs text-gray-500">
            {contact.source === 'suggested' && (
              <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                AI Suggested
              </div>
            )}
            {contact.source === 'imported' && (
              <div className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                Imported
              </div>
            )}
            {contact.source === 'manual' && (
              <div className="bg-gold-100 text-gold-700 px-2 py-1 rounded-full">
                Manual
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Hover shimmer effect */}
      <motion.div
        className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-gold/5 to-transparent"
        initial={{ x: '-100%', opacity: 0 }}
        whileHover={{ x: '100%', opacity: 1 }}
        transition={{ duration: 0.8 }}
        style={{ pointerEvents: 'none' }}
      />
    </motion.button>
  )
}