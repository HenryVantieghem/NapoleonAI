'use client'

import { motion } from 'framer-motion'
import { Crown, Check } from 'lucide-react'
import { Card } from '@/components/ui/luxury-card'
import { Typography } from '@/components/ui/typography'

interface VipContact {
  email: string
  name: string
  relationshipType: 'Board Member' | 'Investor' | 'Executive' | 'Client' | 'Partner' | 'VIP' | 'Other'
  source: 'suggested' | 'manual' | 'imported'
  priority?: number
  lastContact?: string
  company?: string
}

export interface VipCardProps {
  contact: VipContact
  selected: boolean
  onToggle: () => void
}

export default function VipCard({ contact, selected, onToggle }: VipCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        className={`p-4 cursor-pointer transition-all border-2 ${
          selected 
            ? 'border-gold bg-gold/5 shadow-lg' 
            : 'border-gray-200 hover:border-navy/30'
        }`}
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              selected ? 'bg-gold text-white' : 'bg-navy text-white'
            }`}>
              {contact.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <Typography variant="body" className="font-medium text-gray-900">
                {contact.name}
              </Typography>
              <Typography variant="body-sm" className="text-gray-600">
                {contact.email}
              </Typography>
              <Typography variant="body-sm" className="text-gray-500">
                {contact.relationshipType}
              </Typography>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {(contact.priority || 0) >= 8 && (
              <Crown className="w-4 h-4 text-gold" />
            )}
            {selected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-6 h-6 bg-gold rounded-full flex items-center justify-center"
              >
                <Check className="w-4 h-4 text-white" />
              </motion.div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}