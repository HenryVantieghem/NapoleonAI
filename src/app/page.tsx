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
    <div className="min-h-screen bg-gradient-to-br from-[#FAFAF8] to-white">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-[#0A0A0A] to-[#333333] rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl ring-2 ring-[#D4AF37] ring-opacity-20 animate-pulse">
              <Crown className="w-10 h-10 text-[#D4AF37] drop-shadow-lg" />
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold text-[#0A0A0A] mb-4 tracking-tight leading-tight">
              Executive Intelligence.
            </h1>
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold text-[#D4AF37] mb-6 sm:mb-8 tracking-tight leading-tight">
              Amplified.
            </h2>
            <p className="text-2xl text-[#666661] mb-4 font-light">
              Save 2+ hours daily on email and messages.
            </p>
            <p className="text-lg text-[#666661] mb-8 font-light">
              The only communication platform designed exclusively for Fortune 500 executives.
            </p>
            <a 
              href="/auth/signup" 
              className="inline-block bg-[#0A0A0A] text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-[#333333] transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              Start Free Trial
            </a>
            <div className="text-sm text-[#666661] mt-4">
              Trusted by Fortune 500 executives worldwide
            </div>
          </div>
        </div>
      </section>

      {/* Three Feature Cards */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-[#D4AF37] rounded-full flex items-center justify-center mx-auto mb-6">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#0A0A0A] mb-4">Executive Intelligence</h3>
              <p className="text-[#666661]">AI analyzes every message for C-suite relevance, prioritizing board communications, investor updates, and strategic decisions first.</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-[#D4AF37] rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#0A0A0A] mb-4">Command Center</h3>
              <p className="text-[#666661]">Unite Gmail, Slack, and Teams into one executive command center. Never miss critical communications across platforms again.</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-[#D4AF37] rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#0A0A0A] mb-4">Executive ROI</h3>
              <p className="text-[#666661]">Reclaim 2+ hours daily ($500-1000 value at executive rates). AI automation handles routine communications so you focus on strategic decisions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Competitive Advantages */}
      <section className="py-20 px-4 bg-gradient-to-r from-[#0A0A0A] to-[#333333]">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Why Executives Choose Napoleon AI</h2>
          <p className="text-xl text-gray-300 mb-12">Superior to every alternative, designed exclusively for C-suite leaders</p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-[#D4AF37]/20">
              <h3 className="text-xl font-bold text-[#D4AF37] mb-3">vs Superhuman ($30/mo)</h3>
              <p className="text-gray-300 text-sm">We unify Gmail + Slack + Teams. They only do email. We provide AI executive insights. They offer basic shortcuts.</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-[#D4AF37]/20">
              <h3 className="text-xl font-bold text-[#D4AF37] mb-3">vs Notion ($20/mo)</h3>
              <p className="text-gray-300 text-sm">We focus on executive communication workflows. They're too general. We provide real-time unified messaging. They're document-centric.</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-[#D4AF37]/20">
              <h3 className="text-xl font-bold text-[#D4AF37] mb-3">vs Slack ($15/mo)</h3>
              <p className="text-gray-300 text-sm">We unify all communication platforms. They're Slack-only. We provide C-suite AI analysis. They offer basic search and notifications.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Executive Testimonial */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <blockquote className="text-3xl font-light text-[#0A0A0A] mb-8 italic">
            "Napoleon AI saves me 3 hours daily. I never miss critical board communications anymore. It's like having a Chief of Staff for my inbox."
          </blockquote>
          <div className="text-[#666661]">
            <p className="font-medium">Michael Rodriguez</p>
            <p>CEO, CloudScale Technologies (Fortune 500)</p>
          </div>
        </div>
      </section>

      {/* Pricing Card */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 text-center">
            <h3 className="text-3xl font-bold text-[#0A0A0A] mb-4">Executive Plan</h3>
            <div className="text-6xl font-bold text-[#D4AF37] mb-2">$500</div>
            <div className="text-[#666661] mb-8">per month</div>
            <ul className="text-left space-y-4 mb-8">
              <li className="flex items-center">
                <Crown className="w-5 h-5 text-[#D4AF37] mr-3" />
                <span>Unlimited executive message processing</span>
              </li>
              <li className="flex items-center">
                <Crown className="w-5 h-5 text-[#D4AF37] mr-3" />
                <span>C-suite AI prioritization & insights</span>
              </li>
              <li className="flex items-center">
                <Crown className="w-5 h-5 text-[#D4AF37] mr-3" />
                <span>Board & investor relationship tracking</span>
              </li>
              <li className="flex items-center">
                <Crown className="w-5 h-5 text-[#D4AF37] mr-3" />
                <span>Dedicated executive success manager</span>
              </li>
            </ul>
            <a 
              href="/auth/signup" 
              className="w-full block bg-[#0A0A0A] text-white py-4 rounded-lg text-lg font-medium hover:bg-[#333333] transition-all duration-300"
            >
              Start Your Trial
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-gray-200">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center mb-4">
            <Crown className="w-6 h-6 text-[#D4AF37] mr-2" />
            <span className="text-xl font-bold text-[#0A0A0A]">Napoleon AI</span>
          </div>
          <p className="text-[#666661] mb-4">Executive Intelligence. Amplified.</p>
          <div className="flex justify-center space-x-6 text-sm text-[#666661]">
            <a href="/privacy" className="hover:text-[#0A0A0A]">Privacy</a>
            <a href="/terms" className="hover:text-[#0A0A0A]">Terms</a>
            <a href="/contact" className="hover:text-[#0A0A0A]">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}