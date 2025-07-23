"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Crown, ArrowRight, Shield, Clock, Zap, CheckCircle, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { luxuryAnimations } from "@/lib/utils"

export function CTASection() {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 })

  const urgencyFactors = [
    {
      icon: Clock,
      text: "Limited to 100 C-Suite Executives",
      urgency: "high"
    },
    {
      icon: Crown,
      text: "Exclusive Executive Access",
      urgency: "medium"
    },
    {
      icon: Shield,
      text: "30-Day Luxury Guarantee",
      urgency: "low"
    }
  ]

  const ctaFeatures = [
    "AI Strategic Commander setup",
    "VIP contact prioritization", 
    "Cross-platform integration",
    "Executive onboarding",
    "Luxury user experience",
    "24/7 C-suite support"
  ]

  const handleCTAClick = () => {
    // In real app, this would navigate to signup/demo
    window.open('https://calendly.com/napoleon-ai-demo', '_blank')
  }

  return (
    <section 
      ref={sectionRef}
      id="cta-section"
      className="section-padding-lg cta-bg relative overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0">
        {/* Luxury geometric patterns */}
        <div className="absolute top-10 left-10 w-20 h-20 border-2 border-burgundy-200 rounded-full opacity-30 animate-pulse" />
        <div className="absolute bottom-20 right-20 w-16 h-16 border-2 border-gold-200 rounded-full opacity-30" />
        <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-burgundy-100 rounded-full opacity-20" />
        <div className="absolute top-1/3 right-1/3 w-8 h-8 bg-gold-100 rounded-full opacity-30" />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-burgundy-50/50 via-transparent to-cream/50" />
      </div>

      <div className="container-luxury relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Urgency Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center mb-8"
          >
            <div className="bg-red-50 text-red-700 border border-red-200 rounded-full px-4 py-2 text-sm font-medium">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse" />
                <span>Executive Preview - Limited Access</span>
              </div>
            </div>
          </motion.div>

          {/* Main CTA Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-responsive-display font-serif font-bold text-gray-900 mb-6"
          >
            Ready to Transform Your
            <br />
            <span className="gradient-text">Executive Communication?</span>
          </motion.h2>

          {/* Supporting Text */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            Join the exclusive circle of C-suite executives who have mastered 
            communication intelligence with Napoleon AI's luxury platform.
          </motion.p>

          {/* CTA Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10 max-w-2xl mx-auto"
          >
            {ctaFeatures.map((feature, index) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 * index + 0.7 }}
                className="flex items-center text-left"
              >
                <CheckCircle className="w-5 h-5 text-burgundy-600 mr-3 flex-shrink-0" />
                <span className="text-gray-700 font-medium text-sm">{feature}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Primary CTA Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mb-8"
          >
            <Button
              variant="luxury"
              size="xl"
              onClick={handleCTAClick}
              className="group min-w-[320px] h-18 text-xl font-semibold relative overflow-hidden transform hover:scale-105 transition-all duration-300"
            >
              {/* Button content */}
              <Crown className="w-6 h-6 mr-4 group-hover:animate-pulse" />
              <span className="relative z-10">Take Command Now</span>
              <ArrowRight className="w-6 h-6 ml-4 group-hover:translate-x-1 transition-transform" />
              
              {/* Luxury shine effect */}
              <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 group-hover:translate-x-full transform -translate-x-full" />
              
              {/* Glow effect */}
              <div className="absolute inset-0 bg-burgundy-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl" />
            </Button>
          </motion.div>

          {/* Secondary CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="mb-12"
          >
            <p className="text-gray-600 mb-4">
              Or schedule your executive briefing
            </p>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => window.open('https://calendly.com/napoleon-ai-briefing', '_blank')}
              className="group"
            >
              <Zap className="w-5 h-5 mr-2 group-hover:text-burgundy-600 transition-colors" />
              <span>Book Executive Demo</span>
            </Button>
          </motion.div>

          {/* Urgency & Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="grid md:grid-cols-3 gap-6 max-w-2xl mx-auto"
          >
            {urgencyFactors.map((factor, index) => (
              <motion.div
                key={factor.text}
                whileHover={{ scale: 1.05 }}
                className={`text-center p-4 rounded-xl border ${
                  factor.urgency === 'high' 
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : factor.urgency === 'medium'
                    ? 'bg-burgundy-50 border-burgundy-200 text-burgundy-700'
                    : 'bg-gray-50 border-gray-200 text-gray-700'
                }`}
              >
                <factor.icon className={`w-6 h-6 mx-auto mb-2 ${
                  factor.urgency === 'high' 
                    ? 'text-red-600'
                    : factor.urgency === 'medium'
                    ? 'text-burgundy-600'
                    : 'text-gray-600'
                }`} />
                <span className="text-sm font-medium">{factor.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Floating testimonial preview */}
        <motion.div
          initial={{ opacity: 0, x: -50, rotate: -5 }}
          animate={isInView ? { opacity: 1, x: 0, rotate: 0 } : {}}
          transition={{ duration: 1, delay: 1.4 }}
          className="absolute left-8 bottom-20 hidden lg:block"
        >
          <div className="bg-white rounded-2xl shadow-luxury p-6 max-w-xs border border-burgundy-100 transform hover:scale-105 transition-transform">
            <div className="flex items-center mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-gold-400 text-gold-400" />
              ))}
            </div>
            <p className="text-sm text-gray-700 mb-3">
              "Finally, a communication tool worthy of the C-suite. Revolutionary."
            </p>
            <div className="flex items-center">
              <Crown className="w-4 h-4 text-burgundy-600 mr-2" />
              <span className="text-xs font-medium text-gray-600">Fortune 500 CEO</span>
            </div>
          </div>
        </motion.div>

        {/* Floating metrics preview */}
        <motion.div
          initial={{ opacity: 0, x: 50, rotate: 5 }}
          animate={isInView ? { opacity: 1, x: 0, rotate: 0 } : {}}
          transition={{ duration: 1, delay: 1.6 }}
          className="absolute right-8 bottom-32 hidden lg:block"
        >
          <div className="bg-white rounded-2xl shadow-luxury p-6 border border-burgundy-100 transform hover:scale-105 transition-transform">
            <div className="text-center">
              <div className="text-2xl font-bold text-burgundy-600 mb-2">8 hrs</div>
              <div className="text-sm text-gray-600 mb-2">Saved Weekly</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={isInView ? { width: '94%' } : {}}
                  transition={{ duration: 2, delay: 2 }}
                  className="bg-burgundy-600 h-2 rounded-full"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Executive guarantee */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1.8 }}
          className="text-center mt-16"
        >
          <div className="inline-flex items-center bg-white rounded-full px-6 py-3 shadow-lg border border-burgundy-100">
            <Shield className="w-5 h-5 text-burgundy-600 mr-3" />
            <span className="text-sm font-medium text-gray-700">
              30-Day Executive Satisfaction Guarantee
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}