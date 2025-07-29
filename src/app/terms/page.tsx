import { Crown } from "lucide-react"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service - Napoleon AI",
  description: "Napoleon AI Terms of Service",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFAF8] to-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-r from-[#0A0A0A] to-[#333333] rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Crown className="w-8 h-8 text-[#D4AF37]" />
          </div>
          <h1 className="text-4xl font-bold text-[#0A0A0A] mb-4">Terms of Service</h1>
          <p className="text-[#666661]">Last updated: July 29, 2025</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-[#0A0A0A] mb-4">Executive Agreement</h2>
            <p className="text-[#666661] leading-relaxed">
              By using Napoleon AI, you agree to these terms of service. 
              Our platform is designed exclusively for C-suite executives and senior business leaders 
              who require sophisticated communication management.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#0A0A0A] mb-4">Service Description</h2>
            <p className="text-[#666661] leading-relaxed mb-4">
              Napoleon AI provides executive communication intelligence through:
            </p>
            <ul className="space-y-2 text-[#666661]">
              <li>• AI-powered message prioritization across Gmail, Slack, and Teams</li>
              <li>• VIP contact management and relationship insights</li>
              <li>• Strategic communication analytics and time-saving automation</li>
              <li>• Executive-grade security and privacy protection</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#0A0A0A] mb-4">Subscription and Billing</h2>
            <ul className="space-y-2 text-[#666661]">
              <li>• Monthly subscription fee of $300 per executive user</li>
              <li>• 14-day free trial with full feature access</li>
              <li>• Automatic renewal unless cancelled 24 hours before billing cycle</li>
              <li>• Enterprise pricing available for teams of 10+ executives</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#0A0A0A] mb-4">Acceptable Use</h2>
            <p className="text-[#666661] leading-relaxed">
              Napoleon AI is intended for legitimate business communication management. 
              Users must not use the service for any illegal activities or in violation of 
              their organization's policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#0A0A0A] mb-4">Limitation of Liability</h2>
            <p className="text-[#666661] leading-relaxed">
              Napoleon AI provides communication intelligence tools but cannot guarantee 
              100% accuracy in AI analysis. Users remain responsible for all business decisions 
              based on our insights and recommendations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#0A0A0A] mb-4">Contact</h2>
            <p className="text-[#666661] leading-relaxed">
              For questions about these terms, contact us at legal@napoleonai.com
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