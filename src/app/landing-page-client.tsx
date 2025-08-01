"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Crown, ChevronDown, CheckCircle, Star, Users, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function LandingPageClient() {
  const [isAnnual, setIsAnnual] = useState(false)

  // Testimonials data - Optimized without avatars
  const testimonials = [
    {
      quote: "Napoleon AI transformed how I handle communications. I never miss critical board messages, and I've reclaimed 3+ hours daily for strategic thinking.",
      name: "Victoria Chen",
      title: "CEO, TechVentures Inc.",
      company: "Fortune 500"
    },
    {
      quote: "It's like having a world-class Chief of Staff managing my inbox. The AI prioritization is uncannily accurate - it knows what matters to me.",
      name: "Marcus Thompson",
      title: "CFO, Global Finance Corp",
      company: "S&P 500"
    },
    {
      quote: "The ROI is immediate. Within a week, I was saving 2+ hours daily. The VIP tracking ensures I never miss investor communications.",
      name: "Sarah Williams",
      title: "Founder & CEO, InnovateTech",
      company: "Series C Unicorn"
    }
  ]

  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [testimonials.length])

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section - Optimized for Performance */}
      <section className="min-h-screen relative flex items-center justify-center px-4 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700">
        <div className="relative z-10 text-center max-w-5xl mx-auto">
          {/* Simple Crown logo */}
          <div className="mb-16">
            <div className="w-24 h-24 bg-gradient-gold rounded-full flex items-center justify-center mx-auto mb-8 shadow-gold-lg">
              <Crown className="w-12 h-12 text-navy-900" />
            </div>
          </div>

          {/* Hero headline - Static for better performance */}
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-serif font-bold text-white mb-6 tracking-tight leading-[0.95]">
            Transform Communication Chaos
            <br />
            <span className="text-gold">into Strategic Clarity</span>
          </h1>

          <p className="text-2xl text-gold-200 mb-12 font-light max-w-3xl mx-auto">
            The luxury AI platform that unifies Gmail, Slack & Teams for C-suite executives. 
            Save 2+ hours daily with intelligence amplification.
          </p>

          {/* CTA Buttons - Simplified */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/auth/signup"
              className="px-12 py-6 bg-gradient-gold text-navy-900 rounded-xl text-lg font-semibold shadow-gold-lg hover:shadow-gold-xl transition-shadow duration-300"
            >
              Take Command Now
            </Link>
            
            <Link
              href="/contact"
              className="px-12 py-6 border-2 border-gold text-gold rounded-xl text-lg font-semibold hover:bg-gold hover:text-navy-900 transition-colors duration-300"
            >
              Request Concierge
              <ArrowRight className="inline-block ml-2 w-5 h-5" />
            </Link>
          </div>

          {/* Scroll indicator - Static */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
            <ChevronDown className="w-8 h-8 text-gold-400" />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-32 px-4 bg-white relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full" 
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, #D4AF37 0, #D4AF37 1px, transparent 1px, transparent 15px)`,
              backgroundSize: '20px 20px'
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-6xl font-serif font-bold text-navy-900 mb-6">How It Works</h2>
            <p className="text-2xl text-navy-600 font-light">Executive simplicity in three steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: 1,
                icon: <Users className="w-8 h-8 text-white" />,
                title: "Connect Accounts",
                description: "One-click OAuth integration with Gmail, Slack, and Teams. Enterprise-grade security with zero data retention.",
                color: "from-emerald-500 to-emerald-600"
              },
              {
                step: 2,
                icon: <Star className="w-8 h-8 text-white" />,
                title: "Define VIPs & Preferences",
                description: "Mark board members, investors, and key stakeholders. Set your executive priorities and communication preferences.",
                color: "from-emerald-500 to-emerald-600"
              },
              {
                step: 3,
                icon: <TrendingUp className="w-8 h-8 text-white" />,
                title: "Execute with Precision",
                description: "Access your unified command center. AI prioritizes, summarizes, and surfaces what matters most to you.",
                color: "from-emerald-500 to-emerald-600"
              }
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="bg-white rounded-2xl p-10 shadow-luxury hover:shadow-2xl transition-all duration-300 border border-gold-200/20 h-full">
                  <div className={`w-20 h-20 bg-gradient-to-r ${item.color} rounded-2xl flex items-center justify-center mb-8 shadow-lg`}>
                    <span className="text-3xl font-bold text-white">{item.step}</span>
                  </div>
                  <h3 className="text-2xl font-serif font-semibold text-navy-900 mb-4">{item.title}</h3>
                  <p className="text-lg text-navy-600 leading-relaxed">{item.description}</p>
                  
                  {/* Connection line */}
                  {index < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-6 w-12 h-0.5 bg-gold-200" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof & Exclusivity */}
      <section className="py-32 px-4 bg-gradient-to-br from-navy-900 to-navy-800 relative">
        <div className="max-w-7xl mx-auto">
          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-serif font-bold text-white mb-8">Enterprise Trust</h2>
            <div className="flex flex-wrap justify-center gap-8">
              {[
                { icon: <Shield className="w-6 h-6" />, label: "SOC 2 Type II" },
                { icon: <Shield className="w-6 h-6" />, label: "GDPR Compliant" },
                { icon: <Shield className="w-6 h-6" />, label: "HIPAA Ready" },
                { icon: <Shield className="w-6 h-6" />, label: "ISO 27001" }
              ].map((badge, index) => (
                <motion.div
                  key={badge.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-2 bg-white/10 backdrop-blur-luxury px-6 py-3 rounded-full border border-gold/20"
                >
                  <div className="text-gold">{badge.icon}</div>
                  <span className="text-gold-100 font-medium">{badge.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Testimonials Carousel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-white/5 backdrop-blur-luxury rounded-3xl p-12 border border-gold/20 max-w-4xl mx-auto"
          >
            <div className="relative h-64">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{
                    opacity: currentTestimonial === index ? 1 : 0,
                    x: currentTestimonial === index ? 0 : -100
                  }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                >
                  <blockquote className="text-2xl font-light text-white mb-8 italic font-serif leading-relaxed">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-gold rounded-full" />
                    <div>
                      <p className="font-semibold text-gold">{testimonial.name}</p>
                      <p className="text-gold-200">{testimonial.title}</p>
                      <p className="text-sm text-gold-100">{testimonial.company}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Carousel indicators */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    currentTestimonial === index ? 'w-8 bg-gold' : 'bg-gold/30'
                  }`}
                />
              ))}
            </div>
          </motion.div>

          {/* Exclusivity Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mt-20"
          >
            <p className="text-2xl text-gold-200 mb-4">
              Designed for C-suite leaders – only{" "}
              <span className="text-gold font-semibold group relative inline-block">
                $500/mo
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gold transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              </span>
            </p>
            <div className="flex items-center justify-center gap-2 text-gold-100">
              <Clock className="w-5 h-5" />
              <span className="text-lg">Save 2+ hours daily</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-32 px-4 bg-cream relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        
        <div className="relative z-10 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-serif font-bold text-navy-900 mb-6">Executive Plan</h2>
            <p className="text-2xl text-navy-600 font-light">One plan. Unlimited power.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-navy-900 to-navy-800 rounded-3xl p-12 shadow-2xl border border-gold/20"
          >
            {/* Price toggle */}
            <div className="flex justify-center mb-12">
              <div className="bg-white/10 p-1 rounded-full flex">
                <button
                  onClick={() => setIsAnnual(false)}
                  className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                    !isAnnual ? 'bg-gradient-gold text-navy-900' : 'text-gold-200'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setIsAnnual(true)}
                  className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                    isAnnual ? 'bg-gradient-gold text-navy-900' : 'text-gold-200'
                  }`}
                >
                  Annual (Save 20%)
                </button>
              </div>
            </div>

            <div className="text-center mb-12">
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-7xl font-bold text-gold">
                  ${isAnnual ? '400' : '500'}
                </span>
                <span className="text-2xl text-gold-200">/month</span>
              </div>
              {isAnnual && (
                <p className="text-emerald-400 mt-2">Save $1,200 annually</p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {[
                { icon: <Crown />, text: "Unlimited executive message processing across all platforms" },
                { icon: <Sparkles />, text: "AI-powered C-suite prioritization & strategic insights" },
                { icon: <Star />, text: "Board & investor relationship intelligence tracking" },
                { icon: <Shield />, text: "Dedicated executive success manager & white-glove support" },
                { icon: <Mail />, text: "Gmail, Slack & Teams unified in one command center" },
                { icon: <Clock />, text: "Real-time sync with sub-second message delivery" },
                { icon: <CheckCircle />, text: "Custom AI training on your communication style" },
                { icon: <TrendingUp />, text: "Executive performance analytics & time savings reports" }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-4"
                >
                  <div className="text-gold mt-1">{feature.icon}</div>
                  <span className="text-lg text-gold-100 leading-relaxed">{feature.text}</span>
                </motion.div>
              ))}
            </div>

            <Link
              href="/auth/signup"
              className="block w-full bg-gradient-gold text-navy-900 py-6 rounded-xl text-xl font-semibold hover:shadow-gold-xl transition-all duration-300 transform hover:scale-[1.02] text-center"
            >
              Start Free Trial
            </Link>
            
            <p className="text-center text-gold-100 mt-6 text-sm">
              * Usage above 10,000 messages/month may incur additional charges
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-4 bg-navy-900 border-t border-gold/20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Crown className="w-8 h-8 text-gold" />
              <span className="text-3xl font-serif font-bold text-white">Napoleon AI</span>
            </div>
            <p className="text-xl text-gold-200 font-light">Executive Intelligence. Amplified.</p>
          </div>
          
          <div className="flex justify-center gap-8 text-gold-100 mb-12">
            <Link href="/privacy" className="hover:text-gold transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-gold transition-colors">Terms</Link>
            <Link href="/security" className="hover:text-gold transition-colors">Security</Link>
            <Link href="/contact" className="hover:text-gold transition-colors">Contact</Link>
          </div>
          
          <p className="text-center text-gold-100/60 text-sm">
            © 2024 Napoleon AI. All rights reserved. Designed exclusively for C-suite executives.
          </p>
        </div>
      </footer>
    </div>
  )
}