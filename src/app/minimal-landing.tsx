"use client"

import { useEffect, useState } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import Link from "next/link"
import { 
  Crown, ArrowRight, ChevronDown, Star, Users, TrendingUp, 
  Shield, Clock, Sparkles, Mail, CheckCircle, Zap, Target,
  Globe, Lock, Award, Briefcase
} from "lucide-react"

export default function MinimalLanding() {
  const [mounted, setMounted] = useState(false)
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 500], [0, 200])
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.8])

  useEffect(() => {
    setMounted(true)
  }, [])

  // Fortune 500 testimonials data
  const testimonials = [
    {
      quote: "Napoleon AI transformed how I handle communications. I never miss critical board messages, and I've reclaimed 3+ hours daily for strategic thinking.",
      name: "Victoria Chen",
      title: "CEO, TechVentures Inc.",
      company: "Fortune 500",
      avatar: "VC"
    },
    {
      quote: "It's like having a world-class Chief of Staff managing my inbox. The AI prioritization is uncannily accurate - it knows what matters to me.",
      name: "Marcus Thompson", 
      title: "CFO, Global Finance Corp",
      company: "S&P 500",
      avatar: "MT"
    },
    {
      quote: "The ROI is immediate. Within a week, I was saving 2+ hours daily. The VIP tracking ensures I never miss investor communications.",
      name: "Sarah Williams",
      title: "Founder & CEO, InnovateTech", 
      company: "Series C Unicorn",
      avatar: "SW"
    }
  ]

  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [testimonials.length])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Hero Section - Glassmorphic Luxury */}
      <section className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-gradient-jet-black">
          <div className="absolute top-20 left-10 w-72 h-72 bg-champagneGold/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-32 right-16 w-96 h-96 bg-midnightBlue/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-champagneGold/5 rounded-full blur-2xl animate-float" style={{ animationDelay: '4s' }} />
        </div>

        <motion.div 
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 text-center max-w-6xl mx-auto"
        >
          {/* Glassmorphic Crown Logo */}
          <motion.div 
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="mb-12"
          >
            <div className="w-32 h-32 bg-gradient-champagne/20 backdrop-blur-luxury rounded-full flex items-center justify-center mx-auto mb-8 shadow-private-jet-glass border border-champagneGold/30">
              <Crown className="w-16 h-16 text-champagneGold" />
            </div>
          </motion.div>

          {/* Hero Headline with Staggered Animation */}
          <motion.h1 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-6xl sm:text-8xl md:text-9xl font-serif font-bold text-text-primary mb-8 tracking-tight leading-[0.9]"
          >
            Transform Communication Chaos
            <br />
            <motion.span 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="text-champagneGold bg-gradient-champagne bg-clip-text text-transparent"
            >
              into Strategic Clarity
            </motion.span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="text-2xl md:text-3xl text-text-secondary mb-16 font-light max-w-4xl mx-auto leading-relaxed"
          >
            The luxury AI platform that unifies Gmail, Slack & Teams for C-suite executives. 
            <span className="text-champagneGold font-medium"> Save 2+ hours daily</span> with intelligence amplification.
          </motion.p>

          {/* Glassmorphic CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20"
          >
            <Link
              href="/auth/signup"
              className="group px-12 py-6 bg-gradient-champagne text-jetBlack rounded-2xl text-xl font-semibold shadow-champagne-glow hover:shadow-champagne-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
            >
              Take Command Now
              <Crown className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
            </Link>
            
            <Link
              href="/contact"
              className="group px-12 py-6 bg-jetBlack/20 backdrop-blur-luxury border-2 border-champagneGold/50 text-champagneGold rounded-2xl text-xl font-semibold hover:bg-champagneGold/10 hover:border-champagneGold transition-all duration-300 flex items-center gap-2"
            >
              Request Concierge
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.6 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <ChevronDown className="w-8 h-8 text-champagneGold/60" />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section - Glass Cards */}
      <section className="py-32 px-4 bg-gradient-to-b from-jetBlack to-midnightBlue relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-full h-full" 
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, rgba(212, 175, 55, 0.05) 0, rgba(212, 175, 55, 0.05) 1px, transparent 1px, transparent 20px)`,
              backgroundSize: '40px 40px'
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-6xl md:text-7xl font-serif font-bold text-text-primary mb-6">Executive Intelligence. Amplified.</h2>
            <p className="text-3xl text-text-secondary font-light">Three pillars of strategic communication mastery</p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Target className="w-12 h-12 text-champagneGold" />,
                title: "VIP Intelligence",
                description: "Never miss critical board, investor, or stakeholder communications. AI automatically identifies and prioritizes your most important relationships.",
                features: ["Board member detection", "Investor relationship tracking", "Executive context analysis", "Priority score algorithm"]
              },
              {
                icon: <Globe className="w-12 h-12 text-champagneGold" />,
                title: "Unified Inbox",
                description: "Gmail, Slack, and Teams unified into one executive command center. Real-time synchronization with sub-second message delivery.",
                features: ["Multi-platform integration", "Real-time sync", "Unified search", "Cross-platform replies"]
              },
              {
                icon: <Zap className="w-12 h-12 text-champagneGold" />,
                title: "AI Insights",
                description: "GPT-4 powered analysis provides strategic insights, sentiment analysis, and intelligent response suggestions tailored to your communication style.",
                features: ["Strategic summarization", "Sentiment analysis", "Response suggestions", "Communication patterns"]
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="h-full bg-jetBlack/40 backdrop-blur-glassmorphism rounded-3xl p-10 border border-champagneGold/20 hover:border-champagneGold/40 shadow-private-jet-glass hover:shadow-champagne-lg transition-all duration-500 transform hover:scale-105">
                  <div className="mb-8">
                    <div className="w-20 h-20 bg-gradient-champagne/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <h3 className="text-3xl font-serif font-bold text-text-primary mb-4">{feature.title}</h3>
                    <p className="text-xl text-text-secondary leading-relaxed mb-6">{feature.description}</p>
                  </div>
                  
                  <ul className="space-y-3">
                    {feature.features.map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-text-secondary">
                        <CheckCircle className="w-5 h-5 text-champagneGold flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section - Executive Voices */}
      <section className="py-32 px-4 bg-gradient-to-b from-midnightBlue to-jetBlack relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-6xl font-serif font-bold text-text-primary mb-6">Executive Voices</h2>
            <p className="text-2xl text-text-secondary font-light">What C-suite leaders are saying</p>
          </motion.div>

          {/* Glassmorphic Testimonial Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-jetBlack/30 backdrop-blur-executive rounded-3xl p-12 border border-champagneGold/20 shadow-private-jet-glass"
          >
            <div className="relative h-80">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{
                    opacity: currentTestimonial === index ? 1 : 0,
                    x: currentTestimonial === index ? 0 : currentTestimonial < index ? 100 : -100
                  }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="absolute inset-0 flex flex-col justify-center"
                >
                  <blockquote className="text-3xl font-light text-text-primary mb-8 italic font-serif leading-relaxed text-center">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="flex items-center justify-center gap-6">
                    <div className="w-20 h-20 bg-gradient-champagne rounded-full flex items-center justify-center text-2xl font-bold text-jetBlack">
                      {testimonial.avatar}
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-semibold text-champagneGold mb-1">{testimonial.name}</p>
                      <p className="text-lg text-text-secondary mb-1">{testimonial.title}</p>
                      <p className="text-champagneGold/80 font-medium">{testimonial.company}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Testimonial Navigation */}
            <div className="flex justify-center gap-3 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentTestimonial === index 
                      ? 'w-12 bg-champagneGold shadow-champagne' 
                      : 'w-2 bg-champagneGold/30 hover:bg-champagneGold/50'
                  }`}
                />
              ))}
            </div>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-6 mt-16"
          >
            {[
              { icon: <Shield className="w-6 h-6" />, label: "SOC 2 Type II" },
              { icon: <Lock className="w-6 h-6" />, label: "GDPR Compliant" },
              { icon: <Award className="w-6 h-6" />, label: "ISO 27001" },
              { icon: <Briefcase className="w-6 h-6" />, label: "Enterprise Ready" }
            ].map((badge, index) => (
              <motion.div
                key={badge.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 bg-jetBlack/20 backdrop-blur-glass px-6 py-4 rounded-full border border-champagneGold/20 hover:border-champagneGold/40 transition-all duration-300"
              >
                <div className="text-champagneGold">{badge.icon}</div>
                <span className="text-text-secondary font-medium">{badge.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Section - Executive Plan */}
      <section className="py-32 px-4 bg-gradient-to-b from-jetBlack via-midnightBlue to-jetBlack relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-champagneGold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-midnightBlue/20 rounded-full blur-3xl" />
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-6xl font-serif font-bold text-text-primary mb-6">Executive Plan</h2>
            <p className="text-3xl text-text-secondary font-light">One plan. Unlimited power.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-jetBlack/40 backdrop-blur-executive rounded-3xl p-12 border border-champagneGold/30 shadow-private-jet-glass relative overflow-hidden"
          >
            {/* Pricing Header */}
            <div className="text-center mb-12">
              <div className="flex items-baseline justify-center gap-3 mb-4">
                <span className="text-8xl font-bold text-champagneGold">$500</span>
                <span className="text-3xl text-text-secondary">/month</span>
              </div>
              <p className="text-xl text-text-secondary">Time is the ultimate currency</p>
            </div>

            {/* Feature Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-12">
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
                  <div className="text-champagneGold mt-1 flex-shrink-0">{feature.icon}</div>
                  <span className="text-lg text-text-secondary leading-relaxed">{feature.text}</span>
                </motion.div>
              ))}
            </div>

            {/* CTA Button */}
            <div className="text-center">
              <Link
                href="/auth/signup"
                className="inline-block px-16 py-6 bg-gradient-champagne text-jetBlack rounded-2xl text-2xl font-bold hover:shadow-champagne-glow transition-all duration-300 transform hover:scale-105"
              >
                Start Free Trial
              </Link>
              <p className="text-center text-text-secondary mt-6 text-lg">
                Save 2+ hours daily • ROI positive in week 1
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer - Glassmorphic */}
      <footer className="py-20 px-4 bg-jetBlack border-t border-champagneGold/20 relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center mb-12">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="flex items-center gap-4 mb-6"
            >
              <div className="w-12 h-12 bg-gradient-champagne rounded-full flex items-center justify-center">
                <Crown className="w-8 h-8 text-jetBlack" />
              </div>
              <span className="text-4xl font-serif font-bold text-text-primary">Napoleon AI</span>
            </motion.div>
            <p className="text-2xl text-champagneGold font-light mb-8">Executive Intelligence. Amplified.</p>
          </div>
          
          <div className="flex justify-center gap-8 text-text-secondary mb-12 text-lg">
            <Link href="/privacy" className="hover:text-champagneGold transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-champagneGold transition-colors">Terms</Link>
            <Link href="/security" className="hover:text-champagneGold transition-colors">Security</Link>
            <Link href="/contact" className="hover:text-champagneGold transition-colors">Contact</Link>
          </div>
          
          <p className="text-center text-text-secondary/60 text-lg">
            © 2024 Napoleon AI. All rights reserved. Designed exclusively for C-suite executives.
          </p>
        </div>
      </footer>
    </div>
  )
}