"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Crown, Sparkles, Star, Shield, Mail, Clock, CheckCircle, TrendingUp, X } from "lucide-react"
import Link from "next/link"

interface PricingCardProps {
  className?: string
  showToggle?: boolean
  defaultAnnual?: boolean
}

export default function PricingCard({ className = "", showToggle = true, defaultAnnual = false }: PricingCardProps) {
  const [isAnnual, setIsAnnual] = useState(defaultAnnual)

  const features = [
    { 
      icon: <Crown className="w-5 h-5" />, 
      text: "Unlimited executive message processing across all platforms",
      highlight: true 
    },
    { 
      icon: <Sparkles className="w-5 h-5" />, 
      text: "AI-powered C-suite prioritization & strategic insights",
      highlight: true 
    },
    { 
      icon: <Star className="w-5 h-5" />, 
      text: "Board & investor relationship intelligence tracking",
      highlight: false 
    },
    { 
      icon: <Shield className="w-5 h-5" />, 
      text: "Dedicated executive success manager & white-glove support",
      highlight: false 
    },
    { 
      icon: <Mail className="w-5 h-5" />, 
      text: "Gmail, Slack & Teams unified in one command center",
      highlight: false 
    },
    { 
      icon: <Clock className="w-5 h-5" />, 
      text: "Real-time sync with sub-second message delivery",
      highlight: false 
    },
    { 
      icon: <CheckCircle className="w-5 h-5" />, 
      text: "Custom AI training on your communication style",
      highlight: false 
    },
    { 
      icon: <TrendingUp className="w-5 h-5" />, 
      text: "Executive performance analytics & time savings reports",
      highlight: false 
    }
  ]

  const monthlyPrice = 500
  const annualMonthlyPrice = 400
  const annualSavings = (monthlyPrice - annualMonthlyPrice) * 12

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className={`bg-gradient-to-br from-navy-900 to-navy-800 rounded-3xl p-12 shadow-2xl border border-gold/20 ${className}`}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Crown className="w-8 h-8 text-gold" />
          <h3 className="text-3xl font-serif font-bold text-white">Executive Plan</h3>
        </div>
        <p className="text-xl text-gold-200">One plan. Unlimited power.</p>
      </div>

      {/* Price toggle */}
      {showToggle && (
        <div className="flex justify-center mb-12">
          <div className="bg-white/10 p-1 rounded-full flex backdrop-blur">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                !isAnnual ? 'bg-gradient-gold text-navy-900 shadow-lg' : 'text-gold-200 hover:text-gold'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                isAnnual ? 'bg-gradient-gold text-navy-900 shadow-lg' : 'text-gold-200 hover:text-gold'
              }`}
            >
              Annual
              <span className="ml-2 text-sm opacity-80">(Save 20%)</span>
            </button>
          </div>
        </div>
      )}

      {/* Price display */}
      <div className="text-center mb-12">
        <motion.div 
          key={isAnnual ? 'annual' : 'monthly'}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex items-baseline justify-center gap-2"
        >
          <span className="text-7xl font-bold text-gold">
            ${isAnnual ? annualMonthlyPrice : monthlyPrice}
          </span>
          <span className="text-2xl text-gold-200">/month</span>
        </motion.div>
        
        {isAnnual && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <p className="text-emerald-400 mt-2 font-medium">
              Save ${annualSavings.toLocaleString()} annually
            </p>
            <p className="text-gold-100 text-sm mt-1">
              Billed ${(annualMonthlyPrice * 12).toLocaleString()} per year
            </p>
          </motion.div>
        )}
      </div>

      {/* Features list */}
      <div className="space-y-4 mb-12">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            viewport={{ once: true }}
            className={`flex items-start gap-4 ${
              feature.highlight ? 'bg-white/5 p-3 rounded-lg border border-gold/10' : ''
            }`}
          >
            <div className="text-gold mt-0.5 flex-shrink-0">{feature.icon}</div>
            <span className="text-lg text-gold-100 leading-relaxed">{feature.text}</span>
          </motion.div>
        ))}
      </div>

      {/* CTA Button */}
      <Link
        href="/auth/signup"
        className="group block w-full bg-gradient-gold text-navy-900 py-6 rounded-xl text-xl font-semibold hover:shadow-gold-xl transition-all duration-300 transform hover:scale-[1.02] text-center relative overflow-hidden"
      >
        <span className="relative z-10">Start Free Trial</span>
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-gold-600 to-gold-400"
          initial={{ x: "-100%" }}
          whileHover={{ x: 0 }}
          transition={{ duration: 0.3 }}
        />
      </Link>

      {/* Trial info */}
      <div className="mt-6 text-center">
        <p className="text-gold-100 text-sm">
          14-day free trial • No credit card required
        </p>
        <p className="text-gold-100/60 text-xs mt-2">
          * Usage above 10,000 messages/month may incur additional charges
        </p>
      </div>

      {/* Trust indicators */}
      <div className="mt-8 pt-8 border-t border-gold/10">
        <div className="flex justify-center gap-6 text-gold-100/60 text-sm">
          <div className="flex items-center gap-1">
            <Shield className="w-4 h-4" />
            <span>SOC 2</span>
          </div>
          <div className="flex items-center gap-1">
            <Shield className="w-4 h-4" />
            <span>GDPR</span>
          </div>
          <div className="flex items-center gap-1">
            <Shield className="w-4 h-4" />
            <span>HIPAA</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}