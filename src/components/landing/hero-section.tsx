"use client"

import { motion } from "framer-motion"
import { Crown, ArrowRight, Shield, Zap, Users, ChevronDown, Plane } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NapoleonLogo } from "@/components/ui/napoleon-logo"
import { luxuryAnimations, executiveMetrics } from "@/lib/utils"

export function HeroSection() {
  const handleCTAClick = () => {
    document.getElementById('cta-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToNext = () => {
    document.getElementById('value-proposition')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-jetBlack">
      {/* CSS for 3D Ripple Animation */}
      <style jsx>{`
        @keyframes executive-ripple {
          0% {
            transform: scale(0) rotateZ(0deg);
            opacity: 1;
          }
          50% {
            transform: scale(0.8) rotateZ(180deg);
            opacity: 0.8;
          }
          100% {
            transform: scale(2) rotateZ(360deg);
            opacity: 0;
          }
        }
        
        @keyframes micro-float {
          0%, 100% {
            transform: translateY(0px) rotateX(0deg);
          }
          50% {
            transform: translateY(-10px) rotateX(5deg);
          }
        }
      `}</style>
      
      {/* Jet-Black Background with Starfield */}
      <div className="absolute inset-0">
        {/* Luxury starfield pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="starfield-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="15" r="0.5" fill="#C7CAD1" />
                <circle cx="45" cy="30" r="0.8" fill="#D4AF37" />
                <circle cx="25" cy="50" r="0.3" fill="#C7CAD1" />
                <circle cx="50" cy="10" r="0.4" fill="#C7CAD1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#starfield-pattern)" />
          </svg>
        </div>
        
        {/* Central Sunset Gradient Orb */}
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.6, 0.8, 0.6]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full"
          style={{
            background: 'radial-gradient(circle, #D4AF37 0%, #E8BE35 30%, #8C5A3C 60%, transparent 100%)',
            filter: 'blur(60px)',
          }}
        />
        
        {/* Private Jet Elements */}
        <motion.div
          animate={{ 
            x: [0, 30, 0],
            y: [0, -15, 0]
          }}
          transition={{ 
            duration: 12, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute top-20 right-20 w-8 h-8 text-platinumSilver-600 opacity-30"
        >
          <Plane className="w-full h-full rotate-45" />
        </motion.div>
        
        {/* Floating Luxury Elements */}
        <motion.div
          animate={{ 
            y: [0, -25, 0],
            rotate: [0, 10, 0],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute bottom-32 left-16 w-24 h-24 rounded-full border border-champagneGold/20 backdrop-blur-glass"
        />
        
        <motion.div
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.05, 0.2, 0.05]
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 3
          }}
          className="absolute top-1/3 left-1/4 w-16 h-16 rounded-full bg-cognacLeather/10 backdrop-blur-luxury"
        />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-5xl mx-auto">
          {/* Napoleon Logo */}
          <motion.div
            {...luxuryAnimations.fadeInUp}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <NapoleonLogo variant="gold" size="xl" className="justify-center" />
          </motion.div>

          {/* Executive Badge - Glassmorphic */}
          <motion.div
            {...luxuryAnimations.fadeInUp}
            transition={{ delay: 0.4 }}
            className="inline-flex items-center mb-8"
          >
            <div className="relative backdrop-blur-executive bg-midnightBlue/20 border border-platinumSilver/30 rounded-full px-6 py-3 shadow-luxury-glass">
              <Crown className="w-4 h-4 mr-2 text-champagneGold inline" />
              <span className="text-warmIvory font-medium tracking-wide">Exclusive for C-Suite Executives</span>
              {/* Luxury glow effect */}
              <div className="absolute inset-0 rounded-full bg-champagneGold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          </motion.div>

          {/* Main Headline - Luxury Typography */}
          <motion.h1
            {...luxuryAnimations.fadeInUp}
            transition={{ delay: 0.6 }}
            className="text-6xl sm:text-7xl lg:text-8xl font-serif font-light text-warmIvory mb-8 leading-[0.9] tracking-tight"
          >
            Transform Communication{" "}
            <span className="bg-gradient-champagne bg-clip-text text-transparent font-medium">Chaos</span>
            <br />
            into Strategic{" "}
            <span className="bg-gradient-champagne bg-clip-text text-transparent font-medium">Clarity</span>
          </motion.h1>

          {/* Subheadline - Private Jet Styling */}
          <motion.p
            {...luxuryAnimations.fadeInUp}
            transition={{ delay: 0.8 }}
            className="text-xl sm:text-2xl text-platinumSilver-400 mb-12 max-w-4xl mx-auto leading-relaxed font-light"
          >
            The luxury AI command center for Fortune 500 executives. 
            <br className="hidden sm:block" />
            Unite Gmail, Slack, and Teams with intelligence that understands executive priorities.
          </motion.p>

          {/* Executive Metrics - Glass Cards */}
          <motion.div
            {...luxuryAnimations.fadeInUp}
            transition={{ delay: 1.0 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16 max-w-4xl mx-auto"
          >
            {[
              { value: `${executiveMetrics.timeSavedPerWeek}h`, label: "Saved Weekly", icon: Zap },
              { value: `${executiveMetrics.priorityAccuracy}%`, label: "AI Accuracy", icon: Shield },
              { value: `${executiveMetrics.vipResponseTime}m`, label: "VIP Response", icon: Crown },
              { value: `${executiveMetrics.communicationChannels}`, label: "Platforms", icon: Users }
            ].map((metric, index) => {
              const Icon = metric.icon;
              return (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0 + index * 0.1 }}
                  className="relative group"
                >
                  <div className="backdrop-blur-executive bg-midnightBlue/10 border border-platinumSilver/20 rounded-2xl p-6 text-center shadow-luxury-glass hover:shadow-champagne-lg transition-all duration-500 hover:scale-105">
                    <Icon className="w-6 h-6 text-champagneGold mx-auto mb-3 group-hover:animate-pulse" />
                    <div className="text-3xl font-light text-warmIvory mb-2 font-serif">
                      {metric.value}
                    </div>
                    <div className="text-sm text-platinumSilver-500 font-medium tracking-wide uppercase">
                      {metric.label}
                    </div>
                    {/* Glass reflection effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-champagneGold/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Gold Shimmer CTA Buttons */}
          <motion.div
            {...luxuryAnimations.fadeInUp}
            transition={{ delay: 1.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20"
          >
            {/* Primary CTA - 3D Ripple Effect */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="relative group"
            >
              <Button
                onClick={(e) => {
                  // 3D Ripple Effect
                  const button = e.currentTarget;
                  const rect = button.getBoundingClientRect();
                  const ripple = document.createElement('div');
                  const size = Math.max(rect.width, rect.height) * 2;
                  const x = e.clientX - rect.left - size / 2;
                  const y = e.clientY - rect.top - size / 2;
                  
                  ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(212,175,55,0.4) 0%, rgba(212,175,55,0.1) 50%, transparent 100%);
                    transform: scale(0);
                    animation: executive-ripple 0.8s cubic-bezier(0.4, 0, 0.2, 1);
                    pointer-events: none;
                    z-index: 5;
                  `;
                  
                  button.appendChild(ripple);
                  setTimeout(() => ripple.remove(), 800);
                  handleCTAClick();
                }}
                className="relative min-w-[320px] h-16 bg-gradient-champagne text-jetBlack font-semibold text-lg rounded-2xl border-0 shadow-champagne-glow overflow-hidden transition-all duration-500"
              >
                <Crown className="w-6 h-6 mr-3 group-hover:animate-pulse" />
                <span className="relative z-10">Take Command Now</span>
                <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform duration-300" />
                
                {/* Gold shimmer animation */}
                <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 translate-x-[-200%] group-hover:translate-x-[200%] transition-all duration-1000" />
                
                {/* 3D Depth layers */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-champagneGold/20 via-transparent to-cognacLeather/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute inset-0 rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] transition-shadow duration-300" />
                
                {/* Luxury glow pulse */}
                <div className="absolute inset-0 rounded-2xl bg-champagneGold opacity-20 animate-pulse" />
              </Button>
            </motion.div>

            {/* Secondary CTA - Glass */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative group"
            >
              <Button
                variant="outline"
                onClick={() => document.getElementById('demo-video')?.scrollIntoView({ behavior: 'smooth' })}
                className="min-w-[280px] h-16 bg-midnightBlue/20 backdrop-blur-executive border border-platinumSilver/30 text-warmIvory hover:bg-midnightBlue/30 rounded-2xl shadow-luxury-glass font-medium text-lg transition-all duration-500"
              >
                <Plane className="w-5 h-5 mr-3 group-hover:text-champagneGold transition-colors duration-300" />
                <span>Experience the Journey</span>
              </Button>
            </motion.div>
          </motion.div>

          {/* Trust Indicators - Private Jet Style */}
          <motion.div
            {...luxuryAnimations.fadeInUp}
            transition={{ delay: 1.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm"
          >
            <div className="flex items-center text-platinumSilver-400 hover:text-champagneGold transition-colors duration-300">
              <Shield className="w-4 h-4 mr-2" />
              <span className="font-medium tracking-wide">Executive Security</span>
            </div>
            <div className="flex items-center text-platinumSilver-400 hover:text-champagneGold transition-colors duration-300">
              <Users className="w-4 h-4 mr-2" />
              <span className="font-medium tracking-wide">500+ Fortune 500 Leaders</span>
            </div>
            <div className="flex items-center text-platinumSilver-400 hover:text-champagneGold transition-colors duration-300">
              <Plane className="w-4 h-4 mr-2" />
              <span className="font-medium tracking-wide">Private Jet Experience</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Runway Scroll Bar */}
      <motion.div
        {...luxuryAnimations.fadeInUp}
        transition={{ delay: 1.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer group"
        onClick={scrollToNext}
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center"
        >
          {/* Runway lights */}
          <div className="flex gap-1 mb-4">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                animate={{ 
                  opacity: [0.3, 1, 0.3],
                  scale: [0.8, 1, 0.8]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
                className="w-2 h-2 rounded-full bg-champagneGold"
              />
            ))}
          </div>
          
          <span className="text-sm font-medium mb-3 text-platinumSilver-500 group-hover:text-champagneGold transition-colors duration-300 tracking-wide">
            Begin Your Journey
          </span>
          
          {/* Animated arrow */}
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="text-champagneGold group-hover:text-champagneGold-700 transition-colors duration-300"
          >
            <ChevronDown className="w-8 h-8" />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Executive Preview Cards - Glass Floating */}
      <motion.div
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 2.0, duration: 1.2 }}
        className="absolute left-8 top-1/2 -translate-y-1/2 hidden xl:block"
      >
        <motion.div
          animate={{ 
            y: [0, -15, 0],
            rotate: [0, 2, 0]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="backdrop-blur-executive bg-midnightBlue/15 border border-cognacLeather/40 rounded-2xl p-5 w-72 shadow-luxury-glass"
        >
          <div className="flex items-center mb-4">
            <div className="w-3 h-3 bg-cognacLeather rounded-full mr-3 animate-pulse shadow-cognac" />
            <span className="text-sm font-semibold text-warmIvory tracking-wide">VIP PRIORITY</span>
          </div>
          <div className="text-sm text-platinumSilver-300 leading-relaxed">
            <strong className="text-champagneGold">Board Chairman</strong> requires immediate review of acquisition proposal
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 2.2, duration: 1.2 }}
        className="absolute right-8 top-1/3 hidden xl:block"
      >
        <motion.div
          animate={{ 
            y: [0, 20, 0],
            rotate: [0, -2, 0]
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 2
          }}
          className="backdrop-blur-executive bg-midnightBlue/15 border border-champagneGold/30 rounded-2xl p-5 w-72 shadow-luxury-glass"
        >
          <div className="flex items-center mb-4">
            <Crown className="w-4 h-4 text-champagneGold mr-3 animate-pulse" />
            <span className="text-sm font-semibold text-warmIvory tracking-wide">AI INTELLIGENCE</span>
          </div>
          <div className="text-sm text-platinumSilver-300 leading-relaxed">
            5 strategic action items identified from this week's investor communications
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}