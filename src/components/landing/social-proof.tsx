"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Star, Crown, Quote, Building, Award, TrendingUp } from "lucide-react"
import Image from "next/image"
import { executiveContent } from "@/lib/utils"

export function SocialProof() {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 })

  const companyLogos = [
    { name: "Fortune 500", size: "w-24 h-8" },
    { name: "Global Enterprises", size: "w-28 h-8" },
    { name: "Premium Brands", size: "w-32 h-8" },
    { name: "Executive Partners", size: "w-24 h-8" },
    { name: "Leadership Corp", size: "w-26 h-8" }
  ]

  const executiveStats = [
    {
      icon: Crown,
      value: "500+",
      label: "C-Suite Executives",
      description: "Trust Napoleon AI daily"
    },
    {
      icon: Building,
      value: "250+",
      label: "Fortune 1000",
      description: "Companies using our platform"
    },
    {
      icon: Award,
      value: "98%",
      label: "Executive Satisfaction",
      description: "Rate as transformational"
    },
    {
      icon: TrendingUp,
      value: "$2.5M",
      label: "Average ROI",
      description: "In executive time savings"
    }
  ]

  return (
    <section 
      ref={sectionRef}
      id="testimonials"
      className="section-padding-lg bg-gradient-to-br from-gray-50 to-cream relative overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute top-20 right-20 w-40 h-40 border-2 border-burgundy-300 rounded-full" />
        <div className="absolute bottom-40 left-20 w-32 h-32 border border-gold-300 rounded-full" />
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
              <Crown className="w-4 h-4 mr-2 text-burgundy-600" />
              <span>Trusted by C-Suite Leaders</span>
            </div>
          </div>
          
          <h2 className="text-responsive-display font-serif font-bold text-gray-900 mb-6">
            Executive Success Stories
          </h2>
          
          <p className="text-xl text-gray-600 leading-relaxed">
            Discover how C-suite leaders are transforming their communication 
            strategy with Napoleon AI's luxury executive experience.
          </p>
        </motion.div>

        {/* Executive Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
        >
          {executiveStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.1 * index + 0.3 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-burgundy-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-8 h-8 text-burgundy-600" />
              </div>
              <div className="text-3xl font-bold text-burgundy-700 mb-2">
                {stat.value}
              </div>
              <div className="font-semibold text-gray-900 mb-1">
                {stat.label}
              </div>
              <div className="text-sm text-gray-600">
                {stat.description}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Featured Testimonials */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {executiveContent.testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.1 * index + 0.4 }}
              className="testimonial-card group hover-lift"
            >
              {/* Quote Mark */}
              <div className="absolute top-6 right-6 opacity-10">
                <Quote className="w-12 h-12 text-burgundy-600" />
              </div>

              {/* Stars */}
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className="w-4 h-4 fill-gold-400 text-gold-400" 
                  />
                ))}
              </div>

              {/* Testimonial Text */}
              <blockquote className="text-gray-700 leading-relaxed mb-6 relative z-10">
                "{testimonial.quote}"
              </blockquote>

              {/* Executive Info */}
              <div className="flex items-center">
                <div className="relative w-12 h-12 mr-4">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.author}
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-burgundy-600 rounded-full flex items-center justify-center">
                    <Crown className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {testimonial.author}
                  </div>
                  <div className="text-sm text-burgundy-600 font-medium">
                    {testimonial.role}
                  </div>
                  <div className="text-xs text-gray-500">
                    {testimonial.company}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Detailed Case Study */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="card-luxury p-8 mb-16 bg-white border-2 border-burgundy-100"
        >
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center mb-4">
                <Crown className="w-6 h-6 text-burgundy-600 mr-3" />
                <span className="executive-badge text-sm">Executive Case Study</span>
              </div>
              
              <h3 className="text-2xl font-serif font-semibold text-gray-900 mb-4">
                Fortune 500 CEO Saves 12 Hours Weekly
              </h3>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                "Before Napoleon AI, I was drowning in communications across multiple platforms. 
                Critical investor updates were buried in hundreds of emails. Now, I immediately 
                see what matters most and never miss VIP communications."
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-burgundy-50 rounded-xl">
                  <div className="text-2xl font-bold text-burgundy-600 mb-1">12h</div>
                  <div className="text-sm text-gray-600">Weekly Time Saved</div>
                </div>
                <div className="text-center p-4 bg-burgundy-50 rounded-xl">
                  <div className="text-2xl font-bold text-burgundy-600 mb-1">100%</div>
                  <div className="text-sm text-gray-600">VIP Response Rate</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gray-100 rounded-2xl p-6 h-64 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Crown className="w-16 h-16 mx-auto mb-4 text-burgundy-300" />
                  <p className="text-sm">Executive Dashboard Preview</p>
                </div>
              </div>
              
              {/* Floating metrics */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -left-4 bg-white rounded-xl shadow-luxury p-3 border border-burgundy-100"
              >
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse" />
                  <span className="font-medium">Board Meeting Alert</span>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-luxury p-3 border border-burgundy-100"
              >
                <div className="flex items-center text-sm">
                  <Crown className="w-4 h-4 text-burgundy-600 mr-2" />
                  <span className="font-medium">VIP Priority: High</span>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Trust Logos */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center"
        >
          <p className="text-sm text-gray-500 mb-8 font-medium">
            Trusted by executives at leading companies worldwide
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
            {companyLogos.map((logo, index) => (
              <motion.div
                key={logo.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 0.6, scale: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.1 * index + 0.9 }}
                whileHover={{ opacity: 1, scale: 1.05 }}
                className={`${logo.size} bg-gray-300 rounded-lg flex items-center justify-center`}
              >
                <span className="text-xs font-medium text-gray-600">
                  {logo.name}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}