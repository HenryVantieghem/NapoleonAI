import { Metadata } from "next"
import Link from 'next/link'
import { Crown } from "lucide-react"

export const metadata: Metadata = {
  title: "Gmail Smart Inbox | Napoleon AI",
  description: "Transform communication chaos into strategic clarity. Smart Gmail management for busy professionals.",
  keywords: [
    "Gmail management",
    "email productivity",
    "smart inbox",
    "email organization",
    "Napoleon AI"
  ]
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0B0D11] flex items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-4xl mx-auto">
        {/* Logo */}
        <div className="mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-[#D4AF37] to-[#B8941F] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Crown className="w-10 h-10 text-[#0B0D11]" />
          </div>
          <h2 className="text-2xl font-bold text-[#D4AF37] tracking-wide">NAPOLEON AI</h2>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
          Transform Communication Chaos
          <br />
          <span className="text-[#D4AF37] bg-gradient-to-r from-[#D4AF37] to-[#F4C842] bg-clip-text text-transparent">
            into Strategic Clarity
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Smart Gmail management that prioritizes what matters most to you
        </p>

        {/* CTA Button */}
        <div className="pt-8">
          <Link href="/auth/signup">
            <button className="inline-flex items-center space-x-3 bg-[#D4AF37] text-[#0B0D11] px-12 py-6 rounded-full text-xl font-bold hover:bg-[#F4C842] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
              <span>Connect with Gmail</span>
              <Crown className="w-6 h-6" />
            </button>
          </Link>
        </div>

        {/* Simple benefit points */}
        <div className="pt-12 grid md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-[#D4AF37] text-lg font-semibold mb-2">Smart Prioritization</div>
            <div className="text-gray-400">Focus on what matters most</div>
          </div>
          <div>
            <div className="text-[#D4AF37] text-lg font-semibold mb-2">Clean Interface</div>
            <div className="text-gray-400">Elegant, distraction-free design</div>
          </div>
          <div>
            <div className="text-[#D4AF37] text-lg font-semibold mb-2">Quick Setup</div>
            <div className="text-gray-400">Connect Gmail in seconds</div>
          </div>
        </div>
      </div>
    </main>
  )
}