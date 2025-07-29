import { Crown } from "lucide-react"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy - Napoleon AI",
  description: "Napoleon AI Privacy Policy",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFAF8] to-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-r from-[#0A0A0A] to-[#333333] rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Crown className="w-8 h-8 text-[#D4AF37]" />
          </div>
          <h1 className="text-4xl font-bold text-[#0A0A0A] mb-4">Privacy Policy</h1>
          <p className="text-[#666661]">Last updated: July 29, 2025</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-[#0A0A0A] mb-4">Executive Summary</h2>
            <p className="text-[#666661] leading-relaxed">
              Napoleon AI is committed to protecting your privacy and securing your communications data. 
              This policy outlines how we collect, use, and protect your information when you use our executive communication platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#0A0A0A] mb-4">Information We Collect</h2>
            <ul className="space-y-2 text-[#666661]">
              <li>• Email and messaging data from connected accounts (Gmail, Slack, Teams)</li>
              <li>• Account information and authentication data</li>
              <li>• Usage analytics and performance metrics</li>
              <li>• VIP contact designations and preferences</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#0A0A0A] mb-4">How We Use Your Information</h2>
            <ul className="space-y-2 text-[#666661]">
              <li>• AI-powered message prioritization and analysis</li>
              <li>• Providing personalized communication insights</li>
              <li>• Improving our service quality and features</li>
              <li>• Ensuring platform security and compliance</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#0A0A0A] mb-4">Data Security</h2>
            <p className="text-[#666661] leading-relaxed">
              We employ enterprise-grade security measures including end-to-end encryption, 
              secure data storage, and regular security audits to protect your executive communications.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#0A0A0A] mb-4">Contact Us</h2>
            <p className="text-[#666661] leading-relaxed">
              For any privacy-related questions or concerns, please contact us at privacy@napoleonai.com
            </p>
          </section>
        </div>

        <div className="text-center mt-8">
          <a 
            href="/" 
            className="inline-block bg-[#0A0A0A] text-white px-6 py-3 rounded-lg hover:bg-[#333333] transition-colors"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}