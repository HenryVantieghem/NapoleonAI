import { Crown, Brain, Zap, Clock } from "lucide-react"
import { Metadata } from "next"

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
            <div className="w-20 h-20 bg-gradient-to-r from-[#0A0A0A] to-[#333333] rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <Crown className="w-10 h-10 text-[#D4AF37]" />
            </div>
            <h1 className="text-6xl md:text-7xl font-bold text-[#0A0A0A] mb-4 tracking-tight">
              Executive Intelligence.
            </h1>
            <h2 className="text-6xl md:text-7xl font-bold text-[#D4AF37] mb-8 tracking-tight">
              Amplified.
            </h2>
            <p className="text-2xl text-[#666661] mb-8 font-light">
              Save 2 hours daily on email and messages.
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
              <h3 className="text-2xl font-bold text-[#0A0A0A] mb-4">AI Priority</h3>
              <p className="text-[#666661]">Intelligent message prioritization puts the most important communications first.</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-[#D4AF37] rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#0A0A0A] mb-4">Unified Inbox</h3>
              <p className="text-[#666661]">Gmail, Slack, and Teams messages in one elegant interface.</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-[#D4AF37] rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#0A0A0A] mb-4">Time Saved</h3>
              <p className="text-[#666661]">Reclaim 2+ hours daily with smart automation and insights.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Testimonial */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <blockquote className="text-3xl font-light text-[#0A0A0A] mb-8 italic">
            "Napoleon AI transformed how I manage communications. I finally have clarity in the chaos."
          </blockquote>
          <div className="text-[#666661]">
            <p className="font-medium">Sarah Chen</p>
            <p>CEO, TechCorp</p>
          </div>
        </div>
      </section>

      {/* Pricing Card */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 text-center">
            <h3 className="text-3xl font-bold text-[#0A0A0A] mb-4">Executive Plan</h3>
            <div className="text-6xl font-bold text-[#D4AF37] mb-2">$300</div>
            <div className="text-[#666661] mb-8">per month</div>
            <ul className="text-left space-y-4 mb-8">
              <li className="flex items-center">
                <Crown className="w-5 h-5 text-[#D4AF37] mr-3" />
                <span>Unlimited message processing</span>
              </li>
              <li className="flex items-center">
                <Crown className="w-5 h-5 text-[#D4AF37] mr-3" />
                <span>Advanced AI prioritization</span>
              </li>
              <li className="flex items-center">
                <Crown className="w-5 h-5 text-[#D4AF37] mr-3" />
                <span>VIP contact management</span>
              </li>
              <li className="flex items-center">
                <Crown className="w-5 h-5 text-[#D4AF37] mr-3" />
                <span>White-glove onboarding</span>
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