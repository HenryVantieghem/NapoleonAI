import { Navbar } from "@/components/shared/navbar"
import { HeroSection } from "@/components/landing/hero-section"
import { ValueProposition } from "@/components/landing/value-proposition"
import { SocialProof } from "@/components/landing/social-proof"
import { CTASection } from "@/components/landing/cta-section"

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <ValueProposition />
        <SocialProof />
        <CTASection />
      </main>
    </>
  )
}