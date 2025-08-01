"use client"

import Link from "next/link"
import { Crown, ArrowRight } from "lucide-react"

export default function MinimalLanding() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Above-the-fold Hero - Critical Path */}
      <section className="min-h-screen relative flex items-center justify-center px-4 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700">
        <div className="relative z-10 text-center max-w-5xl mx-auto">
          {/* Simple Crown logo */}
          <div className="mb-16">
            <div className="w-24 h-24 bg-gradient-gold rounded-full flex items-center justify-center mx-auto mb-8 shadow-gold-lg">
              <Crown className="w-12 h-12 text-navy-900" />
            </div>
          </div>

          {/* Hero headline - Static for maximum performance */}
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-serif font-bold text-white mb-6 tracking-tight leading-[0.95]">
            Transform Communication Chaos
            <br />
            <span className="text-gold">into Strategic Clarity</span>
          </h1>

          <p className="text-2xl text-gold-200 mb-12 font-light max-w-3xl mx-auto">
            The luxury AI platform that unifies Gmail, Slack & Teams for C-suite executives. 
            Save 2+ hours daily with intelligence amplification.
          </p>

          {/* CTA Buttons - Critical conversion elements */}
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
        </div>
      </section>

      {/* Minimal Features Section - Essential info only */}
      <section className="py-32 px-4 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl font-serif font-bold text-navy-900 mb-6">Executive Intelligence. Amplified.</h2>
          <p className="text-2xl text-navy-600 font-light mb-16">Save 2+ hours daily with AI-powered communication management</p>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-navy-900">1</span>
              </div>
              <h3 className="text-2xl font-serif font-bold text-navy-900 mb-4">Connect Accounts</h3>
              <p className="text-navy-600">One-click OAuth integration with Gmail, Slack, and Teams</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-navy-900">2</span>
              </div>
              <h3 className="text-2xl font-serif font-bold text-navy-900 mb-4">AI Prioritization</h3>
              <p className="text-navy-600">Intelligent message prioritization learns your preferences</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-navy-900">3</span>
              </div>
              <h3 className="text-2xl font-serif font-bold text-navy-900 mb-4">Strategic Focus</h3>
              <p className="text-navy-600">Never miss critical board or investor communications</p>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="bg-navy-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center mx-auto mb-6">
            <Crown className="w-8 h-8 text-navy-900" />
          </div>
          <h3 className="text-2xl font-serif font-bold mb-4">Napoleon AI</h3>
          <p className="text-gold-200 mb-8">Executive Intelligence. Amplified.</p>
          <Link
            href="/auth/signup"
            className="px-8 py-4 bg-gradient-gold text-navy-900 rounded-xl font-semibold hover:shadow-gold-lg transition-shadow duration-300"
          >
            Get Started
          </Link>
        </div>
      </footer>
    </div>
  )
}