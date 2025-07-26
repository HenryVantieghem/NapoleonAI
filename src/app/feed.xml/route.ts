import { NextResponse } from 'next/server'

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://napoleonai.com'
  
  const rssContent = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Napoleon AI - Executive Communication Intelligence</title>
    <description>Transform communication chaos into strategic clarity with Napoleon AI. Insights and updates for C-suite executives.</description>
    <link>${baseUrl}</link>
    <language>en-US</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    
    <item>
      <title>Introducing Napoleon AI: Your Executive Communication Commander</title>
      <description>Transform your executive communication with AI-powered prioritization, unified inbox management, and strategic insights designed for Fortune 500 leaders.</description>
      <link>${baseUrl}/blog/introducing-napoleon-ai</link>
      <guid>${baseUrl}/blog/introducing-napoleon-ai</guid>
      <pubDate>${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toUTCString()}</pubDate>
      <category>Product Launch</category>
    </item>
    
    <item>
      <title>How CEOs Save 8+ Hours Weekly with AI Communication Management</title>
      <description>Discover how Fortune 500 executives are reclaiming their time and focus with Napoleon AI's intelligent communication platform.</description>
      <link>${baseUrl}/blog/ceo-time-savings</link>
      <guid>${baseUrl}/blog/ceo-time-savings</guid>
      <pubDate>${new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toUTCString()}</pubDate>
      <category>Executive Productivity</category>
    </item>
    
    <item>
      <title>The Future of Executive Communication: AI-Powered Intelligence</title>
      <description>Explore how artificial intelligence is revolutionizing the way C-suite executives manage their communication workflows.</description>
      <link>${baseUrl}/blog/future-executive-communication</link>
      <guid>${baseUrl}/blog/future-executive-communication</guid>
      <pubDate>${new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toUTCString()}</pubDate>
      <category>Industry Insights</category>
    </item>
  </channel>
</rss>`

  return new NextResponse(rssContent, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}