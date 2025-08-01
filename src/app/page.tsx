import { Metadata } from "next"
import MinimalLanding from "./minimal-landing"

export const metadata: Metadata = {
  title: "Executive Intelligence Platform | Napoleon AI",
  description: "Transform communication chaos into strategic clarity. Save 2+ hours daily with AI-powered executive intelligence that unifies Gmail, Slack & Teams. Built for C-suite leaders.",
  keywords: [
    "executive communication platform",
    "AI email management for CEOs",
    "unified inbox C-suite",
    "Gmail Slack Teams integration",
    "board communication management",
    "investor relations platform",
    "executive productivity AI",
    "Fortune 500 communication tools",
    "Napoleon AI platform",
    "luxury business software"
  ],
  openGraph: {
    title: "Transform Communication Chaos into Strategic Clarity | Napoleon AI",
    description: "Save 2+ hours daily. The luxury AI platform designed exclusively for C-suite executives. Unify Gmail, Slack & Teams with intelligence amplification.",
    images: [
      {
        url: "/og-hero-image.jpg",
        width: 1200,
        height: 630,
        alt: "Napoleon AI - Transform Communication Chaos into Strategic Clarity"
      }
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Napoleon AI - Executive Intelligence. Amplified.",
    description: "Save 2+ hours daily with AI-powered executive communication management.",
    images: ["/twitter-hero-image.jpg"],
  },
  alternates: {
    canonical: "https://napoleon-ai.com",
  },
}

export default function HomePage() {
  return <MinimalLanding />
}