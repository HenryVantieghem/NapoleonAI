"use client"

import { motion } from "framer-motion"
import { Crown, ArrowRight, Shield, Zap, Users, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { luxuryAnimations, executiveMetrics } from "@/lib/utils"

export function HeroSection() {
  const handleCTAClick = () => {
    document.getElementById('cta-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToNext = () => {
    document.getElementById('value-proposition')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-luxury">
      {/* Background Elements */}
      <div className="absolute inset-0">
        {/* Luxury Pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="luxury-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="2" fill="#801B2B" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#luxury-pattern)" />
          </svg>
        </div>
        
        {/* Floating Elements */}
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute top-20 left-10 w-20 h-20 bg-burgundy-100 rounded-full opacity-20"
        />
        
        <motion.div
          animate={{ 
            y: [0, 20, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute bottom-20 right-16 w-16 h-16 bg-gold-200 rounded-full opacity-20"
        />
        
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute top-1/2 right-20 w-12 h-12 bg-burgundy-200 rounded-full"
        />
      </div>

      <div className="container-luxury relative z-10">
        <div className="text-center max-w-5xl mx-auto">
          {/* Executive Badge */}
          <motion.div
            {...luxuryAnimations.fadeInUp}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center mb-8"
          >
            <div className="executive-badge">
              <Crown className="w-4 h-4 mr-2 text-burgundy-600" />
              <span>Exclusive for C-Suite Executives</span>
            </div>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            {...luxuryAnimations.fadeInUp}
            transition={{ delay: 0.4 }}
            className="text-responsive-hero font-serif font-bold text-gray-900 mb-6 leading-tight"
          >
            Transform Communication{" "}
            <span className="gradient-text">Chaos</span>
            <br />
            into Strategic{" "}
            <span className="gradient-text">Clarity</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            {...luxuryAnimations.fadeInUp}
            transition={{ delay: 0.6 }}
            className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Napoleon AI is the luxury communication command center designed exclusively for 
            C-suite executives. Unite Gmail, Slack, and Teams with AI-powered prioritization 
            that understands what truly matters to leadership.
          </motion.p>

          {/* Executive Metrics */}
          <motion.div
            {...luxuryAnimations.fadeInUp}
            transition={{ delay: 0.8 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-12 max-w-2xl mx-auto"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-burgundy-600 mb-1">
                {executiveMetrics.timeSavedPerWeek}h
              </div>
              <div className="text-sm text-gray-600">Saved Weekly</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-burgundy-600 mb-1">
                {executiveMetrics.priorityAccuracy}%
              </div>
              <div className="text-sm text-gray-600">AI Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-burgundy-600 mb-1">
                {executiveMetrics.vipResponseTime}m
              </div>
              <div className="text-sm text-gray-600">VIP Response</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-burgundy-600 mb-1">
                {executiveMetrics.communicationChannels}
              </div>
              <div className="text-sm text-gray-600">Platforms</div>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            {...luxuryAnimations.fadeInUp}
            transition={{ delay: 1.0 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            <Button
              variant="luxury"
              size="xl"
              onClick={handleCTAClick}
              className="group min-w-[280px] relative overflow-hidden"
            >
              <Crown className="w-5 h-5 mr-3 group-hover:animate-pulse" />
              <span className="font-semibold">Take Command Now</span>
              <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
              
              {/* Luxury shine effect */}
              <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-500" />
            </Button>

            <Button
              variant="secondary"
              size="xl"
              onClick={() => document.getElementById('demo-video')?.scrollIntoView({ behavior: 'smooth' })}
              className="min-w-[240px] group"
            >
              <Zap className="w-5 h-5 mr-2 group-hover:text-burgundy-600 transition-colors" />
              <span>Watch Demo</span>
            </Button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            {...luxuryAnimations.fadeInUp}
            transition={{ delay: 1.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-500"
          >
            <div className="flex items-center">
              <Shield className="w-4 h-4 mr-2 text-burgundy-600" />
              <span>Enterprise Security</span>
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2 text-burgundy-600" />
              <span>500+ C-Suite Leaders</span>
            </div>
            <div className="flex items-center">
              <Crown className="w-4 h-4 mr-2 text-burgundy-600" />
              <span>Luxury Experience</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        {...luxuryAnimations.fadeInUp}
        transition={{ delay: 1.4 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer"
        onClick={scrollToNext}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center text-gray-400 hover:text-burgundy-600 transition-colors"
        >
          <span className="text-sm font-medium mb-2">Discover More</span>
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </motion.div>

      {/* Executive Preview Cards - Floating */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.6, duration: 1 }}
        className="absolute left-8 top-1/2 -translate-y-1/2 hidden xl:block"
      >
        <div className="card-luxury p-4 w-64 float">
          <div className="flex items-center mb-3">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse" />
            <span className="text-sm font-medium text-gray-700">VIP Alert</span>
          </div>
          <div className="text-sm text-gray-600">
            <strong>Board Member</strong> sent urgent message about Q4 review
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.8, duration: 1 }}
        className="absolute right-8 top-1/3 hidden xl:block"
      >
        <div className="card-luxury p-4 w-64 float-delay-1">
          <div className="flex items-center mb-3">
            <Crown className="w-4 h-4 text-burgundy-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">AI Insight</span>
          </div>
          <div className="text-sm text-gray-600">
            3 action items extracted from investor calls
          </div>
        </div>
      </motion.div>
    </section>
  )
}