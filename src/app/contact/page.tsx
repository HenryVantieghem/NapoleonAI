import { Crown, Mail, Phone, MapPin } from "lucide-react"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact - Napoleon AI",
  description: "Contact Napoleon AI executive support",
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFAF8] to-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-r from-[#0A0A0A] to-[#333333] rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Crown className="w-8 h-8 text-[#D4AF37]" />
          </div>
          <h1 className="text-4xl font-bold text-[#0A0A0A] mb-4">Executive Support</h1>
          <p className="text-xl text-[#666661]">White-glove service for C-suite leaders</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold text-[#0A0A0A] mb-6">Contact Information</h2>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-[#D4AF37] rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-[#0A0A0A]">Executive Support</div>
                  <div className="text-[#666661]">support@napoleonai.com</div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-[#D4AF37] rounded-full flex items-center justify-center">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-[#0A0A0A]">Priority Hotline</div>
                  <div className="text-[#666661]">1-800-NAPOLEON</div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-[#D4AF37] rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-[#0A0A0A]">Headquarters</div>
                  <div className="text-[#666661]">New York, NY</div>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-[#0A0A0A] mb-2">Executive Response Times</h3>
              <ul className="space-y-1 text-sm text-[#666661]">
                <li>• Critical issues: 15 minutes</li>
                <li>• General support: 2 hours</li>
                <li>• Feature requests: 24 hours</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold text-[#0A0A0A] mb-6">Get In Touch</h2>
            
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#0A0A0A] mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#0A0A0A] mb-2">
                  Executive Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                  placeholder="your.email@company.com"
                />
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-medium text-[#0A0A0A] mb-2">
                  Company
                </label>
                <input
                  type="text"
                  id="company"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                  placeholder="Your company name"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-[#0A0A0A] mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                  placeholder="How can we help you command your communications?"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-[#0A0A0A] text-white py-3 rounded-lg font-medium hover:bg-[#333333] transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>

        <div className="text-center mt-8">
          <a 
            href="/" 
            className="inline-block bg-[#D4AF37] text-white px-6 py-3 rounded-lg hover:bg-[#B8941F] transition-colors"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}