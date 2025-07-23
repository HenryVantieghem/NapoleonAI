"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { 
  Crown, 
  Brain, 
  Shield, 
  Zap, 
  Users, 
  Target, 
  Clock,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Mail,
  MessageSquare,
  Calendar
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { luxuryAnimations, executiveContent } from "@/lib/utils"

export function ValueProposition() {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 })

  const features = [
    {
      icon: Brain,
      title: "AI Strategic Commander",
      description: "Advanced AI that understands C-suite priorities and automatically surfaces mission-critical communications.",
      benefits: ["Priority scoring algorithm", "VIP relationship tracking", "Strategic insight generation"]
    },
    {
      icon: Crown,
      title: "Executive Unified Inbox",
      description: "Seamlessly integrate Gmail, Slack, and Teams into one luxury command center designed for executive workflows.",
      benefits: ["Cross-platform unification", "Luxury user experience", "Executive-focused design"]
    },
    {
      icon: Target,
      title: "VIP Relationship Management",
      description: "Never miss important communications from investors, board members, key clients, and strategic partners.",
      benefits: ["VIP contact prioritization", "Relationship insights", "Follow-up recommendations"]
    },
    {
      icon: Zap,
      title: "Intelligent Action Items",
      description: "AI automatically extracts and organizes action items from your communications with smart due date prediction.",
      benefits: ["Automated task extraction", "Priority classification", "Strategic follow-up alerts"]
    }
  ]

  const painPoints = [
    "Missing critical investor updates buried in email",
    "Juggling multiple communication platforms daily",
    "Spending hours on low-priority messages",
    "Losing track of strategic action items",
    "Unable to maintain executive-level relationships"
  ]

  const solutions = [
    "AI-powered priority intelligence system",
    "Unified luxury communication command center",
    "Smart filtering for executive attention",
    "Automated action item extraction",
    "VIP relationship tracking & insights"
  ]

  return (
    <section 
      ref={sectionRef}
      id="value-proposition"
      className="section-padding-lg bg-white relative overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute top-10 left-10 w-32 h-32 border border-burgundy-300 rounded-full" />
        <div className="absolute bottom-20 right-20 w-24 h-24 border border-gold-300 rounded-full" />
        <div className="absolute top-1/2 left-1/4 w-16 h-16 border border-burgundy-300 rounded-full" />
      </div>

      <div className="container-luxury relative">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center mb-6">
            <div className="executive-badge">
              <Brain className="w-4 h-4 mr-2 text-burgundy-600" />
              <span>AI Strategic Commander</span>
            </div>
          </div>
          
          <h2 className="text-responsive-display font-serif font-bold text-gray-900 mb-6">
            Communication Intelligence
            <br />
            <span className="gradient-text">Designed for Leaders</span>
          </h2>
          
          <p className="text-xl text-gray-600 leading-relaxed">
            Napoleon AI transforms chaotic communication into strategic clarity. 
            Built exclusively for C-suite executives who demand luxury experiences 
            and mission-critical intelligence.
          </p>
        </motion.div>

        {/* Before/After Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid md:grid-cols-2 gap-8 mb-20"
        >
          {/* Pain Points */}
          <div className="bg-gray-50 rounded-2xl p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <Clock className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Executive Challenges</h3>
            </div>
            
            <div className="space-y-4">
              {painPoints.map((pain, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.1 * index + 0.3 }}
                  className="flex items-start"
                >
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">{pain}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Solutions */}
          <div className="bg-gradient-to-br from-burgundy-50 to-cream rounded-2xl p-8 border border-burgundy-100">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-burgundy-100 rounded-full flex items-center justify-center mr-4">
                <Crown className="w-6 h-6 text-burgundy-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Napoleon AI Solutions</h3>
            </div>
            
            <div className="space-y-4">
              {solutions.map((solution, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.1 * index + 0.5 }}
                  className="flex items-start"
                >
                  <CheckCircle className="w-5 h-5 text-burgundy-600 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">{solution}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Core Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.1 * index + 0.4 }}
              className="card-luxury p-8 group hover-lift hover-glow"
            >
              <div className="flex items-start mb-6">
                <div className="w-14 h-14 bg-burgundy-100 rounded-2xl flex items-center justify-center mr-4 group-hover:bg-burgundy-200 transition-colors">
                  <feature.icon className="w-7 h-7 text-burgundy-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {feature.benefits.map((benefit, benefitIndex) => (
                  <div key={benefitIndex} className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-burgundy-500 rounded-full mr-3" />
                    <span className="text-sm text-gray-700 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Platform Integration Visual */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mb-16"
        >
          <h3 className="text-2xl font-serif font-semibold text-gray-900 mb-8">
            Unified Command Center
          </h3>
          
          <div className="flex items-center justify-center space-x-8 max-w-2xl mx-auto">
            {/* Gmail */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-3">
                <Mail className="w-8 h-8 text-red-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Gmail</span>
            </motion.div>

            <ArrowRight className="w-6 h-6 text-gray-400" />

            {/* Slack */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-3">
                <MessageSquare className="w-8 h-8 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Slack</span>
            </motion.div>

            <ArrowRight className="w-6 h-6 text-gray-400" />

            {/* Teams */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-3">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Teams</span>
            </motion.div>

            <ArrowRight className="w-6 h-6 text-gray-400" />

            {/* Napoleon AI */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex flex-col items-center"
            >
              <div className="w-20 h-20 bg-gradient-burgundy rounded-2xl flex items-center justify-center mb-3 shadow-burgundy">
                <Crown className="w-10 h-10 text-white" />
              </div>
              <span className="text-sm font-bold text-burgundy-700">Napoleon AI</span>
            </motion.div>
          </div>
        </motion.div>

        {/* ROI Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="bg-gradient-to-r from-burgundy-50 to-cream rounded-2xl p-8 border border-burgundy-100"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-serif font-semibold text-gray-900 mb-3">
              Executive ROI Impact
            </h3>
            <p className="text-gray-600">
              Measurable results for C-suite productivity and strategic focus
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-3">
                <TrendingUp className="w-6 h-6 text-burgundy-600 mr-2" />
                <span className="text-3xl font-bold text-burgundy-600">300%</span>
              </div>
              <span className="text-sm text-gray-700">Productivity Increase</span>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-3">
                <Clock className="w-6 h-6 text-burgundy-600 mr-2" />
                <span className="text-3xl font-bold text-burgundy-600">8</span>
              </div>
              <span className="text-sm text-gray-700">Hours Saved Weekly</span>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-3">
                <Target className="w-6 h-6 text-burgundy-600 mr-2" />
                <span className="text-3xl font-bold text-burgundy-600">94%</span>
              </div>
              <span className="text-sm text-gray-700">Priority Accuracy</span>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-3">
                <Shield className="w-6 h-6 text-burgundy-600 mr-2" />
                <span className="text-3xl font-bold text-burgundy-600">0</span>
              </div>
              <span className="text-sm text-gray-700">Missed VIP Messages</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}