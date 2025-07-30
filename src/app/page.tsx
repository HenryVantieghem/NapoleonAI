import { Crown, Brain, Zap, Clock } from "lucide-react"
import { Metadata } from "next"
import dynamic from "next/dynamic"

// Dynamic imports for performance optimization
const DynamicCrown = dynamic(() => import("lucide-react").then(mod => ({ default: mod.Crown })), { ssr: false })
const DynamicBrain = dynamic(() => import("lucide-react").then(mod => ({ default: mod.Brain })), { ssr: false })
const DynamicZap = dynamic(() => import("lucide-react").then(mod => ({ default: mod.Zap })), { ssr: false })
const DynamicClock = dynamic(() => import("lucide-react").then(mod => ({ default: mod.Clock })), { ssr: false })

export const metadata: Metadata = {
  title: "Napoleon AI - Executive Intelligence. Amplified.",
  description: "Save 2 hours daily on email and messages. The luxury AI platform for C-suite executives.",
  keywords: [
    "executive communication platform",
    "AI email management",
    "unified inbox for executives",
    "Napoleon AI",
    "CEO communication tools"
  ],
  openGraph: {
    title: "Napoleon AI - Executive Intelligence. Amplified.",
    description: "Save 2 hours daily on email and messages.",
    images: [
      {
        url: "/og-hero-image.jpg",
        width: 1200,
        height: 630,
        alt: "Napoleon AI Executive Dashboard"
      }
    ],
  },
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-gold to-gold-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl ring-2 ring-gold ring-opacity-30 animate-pulse">
              <Crown className="w-10 h-10 text-navy-900 drop-shadow-lg" />
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold text-white mb-4 tracking-tight leading-tight">
              Transform Communication Chaos
            </h1>
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold text-gold mb-6 sm:mb-8 tracking-tight leading-tight">
              into Strategic Clarity
            </h2>
            <p className="text-2xl text-gold-200 mb-4 font-light">
              Save 2+ hours daily with AI-powered executive intelligence
            </p>
            <p className="text-lg text-gold-100 mb-8 font-light">
              The luxury productivity platform designed exclusively for C-suite executives
            </p>
            <a 
              href="/auth/signup" 
              className="inline-block bg-gradient-gold text-navy-900 px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-gold-lg transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              Take Command Now
            </a>
            <div className="text-sm text-gold-200 mt-4">
              Trusted by Fortune 500 executives worldwide
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-cream">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-navy-900 mb-4">How It Works</h2>
            <p className="text-xl text-navy-600">Three steps to executive clarity</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-luxury border border-gold-200/20 text-center hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-2xl font-semibold text-navy-900 mb-4">Connect</h3>
              <p className="text-navy-600">Seamlessly integrate Gmail, Slack, and Teams with enterprise-grade OAuth security. One-click setup in under 2 minutes.</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-luxury border border-gold-200/20 text-center hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-2xl font-semibold text-navy-900 mb-4">Define VIPs</h3>
              <p className="text-navy-600">Mark board members, investors, and key stakeholders. AI automatically prioritizes their communications for immediate attention.</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-luxury border border-gold-200/20 text-center hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-2xl font-semibold text-navy-900 mb-4">Execute</h3>
              <p className="text-navy-600">Access your unified command center. AI-powered insights, priority scoring, and strategic summaries at your fingertips.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof & Exclusivity */}
      <section className="py-20 px-4 bg-gradient-to-r from-navy-900 to-navy-800">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-serif font-bold text-white mb-4">Designed for C-suite Leaders Only</h2>
          <p className="text-xl text-gold-200 mb-12">$500/month. Exclusive. Executive-grade intelligence.</p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-luxury rounded-2xl p-6 border border-gold/20">
              <h3 className="text-xl font-bold text-gold mb-3">vs Superhuman ($30/mo)</h3>
              <p className="text-gold-100 text-sm">We unify Gmail + Slack + Teams. They only do email. We provide AI executive insights. They offer basic shortcuts.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-luxury rounded-2xl p-6 border border-gold/20">
              <h3 className="text-xl font-bold text-gold mb-3">vs Notion ($20/mo)</h3>
              <p className="text-gold-100 text-sm">We focus on executive communication workflows. They're too general. We provide real-time unified messaging. They're document-centric.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-luxury rounded-2xl p-6 border border-gold/20">
              <h3 className="text-xl font-bold text-gold mb-3">vs Slack ($15/mo)</h3>
              <p className="text-gold-100 text-sm">We unify all communication platforms. They're Slack-only. We provide C-suite AI analysis. They offer basic search and notifications.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Executive Testimonial */}
      <section className="py-20 px-4 bg-cream">
        <div className="max-w-4xl mx-auto text-center">
          <blockquote className="text-3xl font-light text-navy-900 mb-8 italic font-serif">
            "Napoleon AI saves me 3 hours daily. I never miss critical board communications anymore. It's like having a Chief of Staff for my inbox."
          </blockquote>
          <div className="text-navy-600">
            <p className="font-semibold">Michael Rodriguez</p>
            <p>CEO, CloudScale Technologies (Fortune 500)</p>
          </div>
        </div>
      </section>

      {/* Pricing Card */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-navy-900 to-navy-800 rounded-3xl p-8 shadow-2xl border border-gold/20 text-center">
            <h3 className="text-3xl font-serif font-bold text-white mb-4">Executive Plan</h3>
            <div className="text-6xl font-bold text-gold mb-2">$500</div>
            <div className="text-gold-200 mb-8">per month</div>
            <ul className="text-left space-y-4 mb-8">
              <li className="flex items-center">
                <Crown className="w-5 h-5 text-gold mr-3" />
                <span className="text-gold-100">Unlimited executive message processing</span>
              </li>
              <li className="flex items-center">
                <Crown className="w-5 h-5 text-gold mr-3" />
                <span className="text-gold-100">C-suite AI prioritization & insights</span>
              </li>
              <li className="flex items-center">
                <Crown className="w-5 h-5 text-gold mr-3" />
                <span className="text-gold-100">Board & investor relationship tracking</span>
              </li>
              <li className="flex items-center">
                <Crown className="w-5 h-5 text-gold mr-3" />
                <span className="text-gold-100">Dedicated executive success manager</span>
              </li>
            </ul>
            <a 
              href="/auth/signup" 
              className="w-full block bg-gradient-gold text-navy-900 py-4 rounded-lg text-lg font-semibold hover:shadow-gold-lg transition-all duration-300 transform hover:scale-105"
            >
              Start Your Trial
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-gold/20 bg-navy-900">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center mb-4">
            <Crown className="w-6 h-6 text-gold mr-2" />
            <span className="text-xl font-serif font-bold text-white">Napoleon AI</span>
          </div>
          <p className="text-gold-200 mb-4">Executive Intelligence. Amplified.</p>
          <div className="flex justify-center space-x-6 text-sm text-gold-100">
            <a href="/privacy" className="hover:text-gold">Privacy</a>
            <a href="/terms" className="hover:text-gold">Terms</a>
            <a href="/contact" className="hover:text-gold">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}