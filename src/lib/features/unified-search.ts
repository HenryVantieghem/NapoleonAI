import { unifiedMessageService } from '@/lib/integrations/unified-message-service'
import { vipTrackingService } from './vip-tracking'
import { messageAnalyzer } from '@/lib/ai/message-analyzer'
import { supabase } from '@/lib/supabase/client'
import { Message, PriorityLevel } from '@/types/ai'
import { openai, AI_MODELS, AI_CONFIG } from '@/lib/ai/openai-client'

export interface SearchQuery {
  query: string
  filters?: SearchFilters
  ranking?: SearchRanking
  pagination?: SearchPagination
}

export interface SearchFilters {
  platforms?: ('gmail' | 'slack' | 'teams')[]
  dateRange?: {
    start: Date
    end: Date
  }
  senders?: string[]
  priorities?: PriorityLevel[]
  hasAttachments?: boolean
  isUnread?: boolean
  vipOnly?: boolean
  tags?: string[]
  channels?: string[]
}

export interface SearchRanking {
  algorithm: 'relevance' | 'recency' | 'priority' | 'vip' | 'ai_hybrid'
  boosts?: {
    vip?: number
    priority?: number
    recency?: number
    engagement?: number
  }
}

export interface SearchPagination {
  limit: number
  offset: number
}

export interface SearchResult {
  message: Message
  score: number
  highlights: string[]
  relevanceFactors: RelevanceFactor[]
  vipInfo?: {
    isVIP: boolean
    level?: string
    priorityBoost: number
  }
  context?: {
    threadMessages?: Message[]
    relatedMessages?: Message[]
  }
}

export interface RelevanceFactor {
  type: 'keyword_match' | 'semantic_similarity' | 'vip_sender' | 'priority_level' | 'recency' | 'engagement'
  score: number
  description: string
}

export interface SearchResponse {
  results: SearchResult[]
  total: number
  query: string
  processingTime: number
  suggestions?: string[]
  facets?: SearchFacets
}

export interface SearchFacets {
  platforms: { [key: string]: number }
  senders: { [key: string]: number }
  priorities: { [key: string]: number }
  timeRanges: { [key: string]: number }
  channels: { [key: string]: number }
}

export class UnifiedSearchService {
  /**
   * Perform unified search across all platforms with AI ranking
   */
  async search(userId: string, searchQuery: SearchQuery): Promise<SearchResponse> {
    const startTime = Date.now()
    
    try {
      // Expand query with AI-powered semantic understanding
      const expandedQuery = await this.expandQueryWithAI(searchQuery.query)
      
      // Search across platforms
      const platformResults = await this.searchPlatforms(userId, expandedQuery, searchQuery.filters)
      
      // Get additional context from database
      const dbResults = await this.searchDatabase(userId, expandedQuery, searchQuery.filters)
      
      // Combine and deduplicate results
      const combinedResults = this.combineResults(platformResults, dbResults)
      
      // Apply AI ranking and scoring
      const rankedResults = await this.rankResults(
        combinedResults,
        searchQuery,
        userId
      )
      
      // Generate search suggestions
      const suggestions = await this.generateSearchSuggestions(searchQuery.query, userId)
      
      // Calculate facets for filtering
      const facets = this.calculateFacets(combinedResults)
      
      // Apply pagination
      const paginatedResults = this.applyPagination(rankedResults, searchQuery.pagination)
      
      const processingTime = Date.now() - startTime
      
      // Save search query for analytics
      await this.saveSearchQuery(userId, searchQuery.query, rankedResults.length, processingTime)
      
      return {
        results: paginatedResults,
        total: rankedResults.length,
        query: searchQuery.query,
        processingTime,
        suggestions,
        facets
      }
    } catch (error) {
      console.error('Search error:', error)
      throw new Error(`Search failed: ${(error as Error).message}`)
    }
  }

  /**
   * Get search suggestions based on query and user history
   */
  async getSearchSuggestions(userId: string, query: string): Promise<string[]> {
    try {
      // Get suggestions from AI
      const aiSuggestions = await this.generateSearchSuggestions(query, userId)
      
      // Get suggestions from user's search history
      const { data: recentSearches } = await supabase
        .from('search_queries')
        .select('query')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10)
      
      const historySuggestions = recentSearches
        ?.filter(s => s.query.toLowerCase().includes(query.toLowerCase()))
        .map(s => s.query) || []
      
      // Get suggestions from VIP contacts
      const vipContacts = await vipTrackingService.getVIPContacts(userId)
      const vipSuggestions = vipContacts
        .filter(vip => 
          vip.name.toLowerCase().includes(query.toLowerCase()) ||
          vip.company?.toLowerCase().includes(query.toLowerCase())
        )
        .map(vip => `from:${vip.email}`)
        .slice(0, 3)
      
      // Combine and deduplicate
      const allSuggestions = [
        ...aiSuggestions,
        ...historySuggestions,
        ...vipSuggestions
      ]
      
      return [...new Set(allSuggestions)].slice(0, 8)
    } catch (error) {
      console.error('Error getting search suggestions:', error)
      return []
    }
  }

  /**
   * Advanced search with filters and operators
   */
  async advancedSearch(userId: string, searchQuery: {
    query: string
    operators?: {
      from?: string
      to?: string
      subject?: string
      hasAttachment?: boolean
      in?: string
      before?: Date
      after?: Date
    }
    filters?: SearchFilters
  }): Promise<SearchResponse> {
    // Build advanced query string
    let queryString = searchQuery.query
    
    if (searchQuery.operators) {
      const ops = searchQuery.operators
      if (ops.from) queryString += ` from:${ops.from}`
      if (ops.to) queryString += ` to:${ops.to}`
      if (ops.subject) queryString += ` subject:"${ops.subject}"`
      if (ops.hasAttachment) queryString += ` has:attachment`
      if (ops.in) queryString += ` in:${ops.in}`
      if (ops.before) queryString += ` before:${ops.before.toISOString().split('T')[0]}`
      if (ops.after) queryString += ` after:${ops.after.toISOString().split('T')[0]}`
    }
    
    return await this.search(userId, {
      query: queryString,
      filters: searchQuery.filters,
      ranking: { algorithm: 'ai_hybrid' }
    })
  }

  /**
   * Semantic search using AI embeddings
   */
  async semanticSearch(userId: string, query: string, limit: number = 20): Promise<SearchResult[]> {
    try {
      // Generate embedding for search query
      const queryEmbedding = await this.generateQueryEmbedding(query)
      
      // Search for messages with similar embeddings
      const { data: similarMessages } = await supabase.rpc('search_messages_by_embedding', {
        query_embedding: queryEmbedding,
        match_threshold: 0.7,
        match_count: limit,
        user_id: userId
      })
      
      if (!similarMessages) return []
      
      // Convert to search results with semantic similarity scores
      const results: SearchResult[] = []
      
      for (const msg of similarMessages) {
        const vipInfo = await this.getVIPInfo(userId, msg.sender_email || msg.sender)
        
        results.push({
          message: msg,
          score: msg.similarity,
          highlights: await this.generateSemanticHighlights(query, msg.content),
          relevanceFactors: [
            {
              type: 'semantic_similarity',
              score: msg.similarity * 100,
              description: `${Math.round(msg.similarity * 100)}% semantic similarity`
            }
          ],
          vipInfo
        })
      }
      
      return results.sort((a, b) => b.score - a.score)
    } catch (error) {
      console.error('Semantic search error:', error)
      return []
    }
  }

  /**
   * Quick search for mobile and voice interfaces
   */
  async quickSearch(userId: string, query: string): Promise<SearchResult[]> {
    const quickQuery: SearchQuery = {
      query,
      filters: {
        priorities: ['critical', 'high'],
        vipOnly: true
      },
      ranking: { algorithm: 'ai_hybrid' },
      pagination: { limit: 10, offset: 0 }
    }
    
    const response = await this.search(userId, quickQuery)
    return response.results
  }

  /**
   * Private helper methods
   */
  private async expandQueryWithAI(query: string): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: AI_MODELS.analysis,
        messages: [
          {
            role: 'system',
            content: `You are a search query optimizer. Expand and enhance search queries to improve message search results.
            
            Add relevant synonyms, related terms, and alternative phrasings while maintaining search intent.
            Focus on business and executive communication context.`
          },
          {
            role: 'user',
            content: `Expand this search query for better message search results: "${query}"
            
            Return JSON with:
            - expandedQuery: enhanced query string
            - keywords: array of key search terms
            - synonyms: array of relevant synonyms`
          }
        ],
        temperature: AI_CONFIG.temperature.extraction,
        max_tokens: 200,
        response_format: { type: 'json_object' }
      })

      const result = JSON.parse(response.choices[0].message.content || '{}')
      return result.expandedQuery || query
    } catch (error) {
      return query
    }
  }

  private async searchPlatforms(
    userId: string,
    query: string,
    filters?: SearchFilters
  ): Promise<Message[]> {
    const platforms = filters?.platforms || ['gmail', 'slack', 'teams']
    
    const searchResult = await unifiedMessageService.searchMessages(userId, query, {
      platforms,
      limit: 100
    })
    
    return [...searchResult.gmail, ...searchResult.slack, ...searchResult.teams]
  }

  private async searchDatabase(
    userId: string,
    query: string,
    filters?: SearchFilters
  ): Promise<Message[]> {
    let dbQuery = supabase
      .from('messages')
      .select('*')
      .eq('user_id', userId)
      .or(`subject.ilike.%${query}%,content.ilike.%${query}%,sender.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(100)

    if (filters?.platforms?.length) {
      dbQuery = dbQuery.in('channel', filters.platforms)
    }

    if (filters?.dateRange) {
      dbQuery = dbQuery
        .gte('created_at', filters.dateRange.start.toISOString())
        .lte('created_at', filters.dateRange.end.toISOString())
    }

    if (filters?.senders?.length) {
      dbQuery = dbQuery.in('sender', filters.senders)
    }

    if (filters?.hasAttachments !== undefined) {
      dbQuery = dbQuery.eq('has_attachments', filters.hasAttachments)
    }

    if (filters?.isUnread !== undefined) {
      dbQuery = dbQuery.eq('is_read', !filters.isUnread)
    }

    const { data, error } = await dbQuery
    if (error) throw error
    return data || []
  }

  private combineResults(platformResults: Message[], dbResults: Message[]): Message[] {
    const messageMap = new Map<string, Message>()
    
    // Add platform results first (higher priority)
    platformResults.forEach(msg => messageMap.set(msg.id, msg))
    
    // Add database results if not already present
    dbResults.forEach(msg => {
      if (!messageMap.has(msg.id)) {
        messageMap.set(msg.id, msg)
      }
    })
    
    return Array.from(messageMap.values())
  }

  private async rankResults(
    messages: Message[],
    searchQuery: SearchQuery,
    userId: string
  ): Promise<SearchResult[]> {
    const results: SearchResult[] = []
    
    for (const message of messages) {
      // Calculate base relevance score
      const baseScore = this.calculateRelevanceScore(message, searchQuery.query)
      
      // Get VIP information
      const vipInfo = await this.getVIPInfo(userId, message.senderEmail || message.sender)
      
      // Get priority information
      const { data: analysis } = await supabase
        .from('message_analysis')
        .select('priority, business_impact')
        .eq('message_id', message.id)
        .single()
      
      // Calculate relevance factors
      const relevanceFactors = this.calculateRelevanceFactors(
        message,
        searchQuery.query,
        vipInfo,
        analysis
      )
      
      // Calculate final score with boosts
      const finalScore = this.calculateFinalScore(
        baseScore,
        relevanceFactors,
        searchQuery.ranking?.boosts
      )
      
      // Generate highlights
      const highlights = this.generateHighlights(message, searchQuery.query)
      
      results.push({
        message,
        score: finalScore,
        highlights,
        relevanceFactors,
        vipInfo
      })
    }
    
    // Sort by final score
    return results.sort((a, b) => b.score - a.score)
  }

  private calculateRelevanceScore(message: Message, query: string): number {
    const queryTerms = query.toLowerCase().split(/\s+/)
    let score = 0
    
    const subject = message.subject.toLowerCase()
    const content = message.content.toLowerCase()
    const sender = message.sender.toLowerCase()
    
    // Exact phrase match in subject (highest weight)
    if (subject.includes(query.toLowerCase())) {
      score += 100
    }
    
    // Individual term matches
    queryTerms.forEach(term => {
      if (subject.includes(term)) score += 50
      if (content.includes(term)) score += 20
      if (sender.includes(term)) score += 30
    })
    
    // Recency boost (messages in last 7 days get boost)
    const daysSince = (Date.now() - message.timestamp.getTime()) / (1000 * 60 * 60 * 24)
    if (daysSince <= 7) {
      score += (7 - daysSince) * 5
    }
    
    return score
  }

  private async getVIPInfo(userId: string, senderIdentifier: string) {
    try {
      const vipResult = await vipTrackingService.analyzeMessageSender(
        { senderEmail: senderIdentifier, sender: senderIdentifier } as Message,
        userId
      )
      
      return {
        isVIP: vipResult.isVIP,
        level: vipResult.vipLevel,
        priorityBoost: vipResult.priorityBoost
      }
    } catch (error) {
      return { isVIP: false, priorityBoost: 0 }
    }
  }

  private calculateRelevanceFactors(
    message: Message,
    query: string,
    vipInfo: any,
    analysis: any
  ): RelevanceFactor[] {
    const factors: RelevanceFactor[] = []
    
    // Keyword relevance
    const keywordScore = this.calculateRelevanceScore(message, query)
    factors.push({
      type: 'keyword_match',
      score: Math.min(keywordScore, 100),
      description: `${Math.round(keywordScore)}% keyword relevance`
    })
    
    // VIP sender boost
    if (vipInfo.isVIP) {
      factors.push({
        type: 'vip_sender',
        score: vipInfo.priorityBoost,
        description: `VIP ${vipInfo.level} sender`
      })
    }
    
    // Priority level
    if (analysis?.priority) {
      const priorityScores = { critical: 100, high: 75, medium: 50, low: 25 }
      factors.push({
        type: 'priority_level',
        score: priorityScores[analysis.priority as keyof typeof priorityScores] || 25,
        description: `${analysis.priority} priority message`
      })
    }
    
    // Recency factor
    const daysSince = (Date.now() - message.timestamp.getTime()) / (1000 * 60 * 60 * 24)
    const recencyScore = Math.max(0, 100 - daysSince * 2)
    factors.push({
      type: 'recency',
      score: recencyScore,
      description: `${Math.round(daysSince)} days old`
    })
    
    return factors
  }

  private calculateFinalScore(
    baseScore: number,
    factors: RelevanceFactor[],
    boosts?: SearchRanking['boosts']
  ): number {
    let score = baseScore
    
    factors.forEach(factor => {
      let boost = 1
      if (boosts) {
        switch (factor.type) {
          case 'vip_sender':
            boost = boosts.vip || 1
            break
          case 'priority_level':
            boost = boosts.priority || 1
            break
          case 'recency':
            boost = boosts.recency || 1
            break
          case 'engagement':
            boost = boosts.engagement || 1
            break
        }
      }
      
      score += factor.score * boost
    })
    
    return score
  }

  private generateHighlights(message: Message, query: string): string[] {
    const highlights = []
    const queryTerms = query.toLowerCase().split(/\s+/)
    
    // Highlight in subject
    let highlightedSubject = message.subject
    queryTerms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi')
      highlightedSubject = highlightedSubject.replace(regex, '<mark>$1</mark>')
    })
    if (highlightedSubject !== message.subject) {
      highlights.push(highlightedSubject)
    }
    
    // Highlight in content (first 200 chars)
    const contentSnippet = message.content.substring(0, 200) + '...'
    let highlightedContent = contentSnippet
    queryTerms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi')
      highlightedContent = highlightedContent.replace(regex, '<mark>$1</mark>')
    })
    if (highlightedContent !== contentSnippet) {
      highlights.push(highlightedContent)
    }
    
    return highlights
  }

  private async generateSemanticHighlights(query: string, content: string): Promise<string[]> {
    // AI-powered semantic highlighting would go here
    // For now, return simple keyword highlights
    return this.generateHighlights({ content, subject: '' } as Message, query)
  }

  private async generateSearchSuggestions(query: string, userId: string): Promise<string[]> {
    try {
      const response = await openai.chat.completions.create({
        model: AI_MODELS.extraction,
        messages: [
          {
            role: 'system',
            content: 'Generate helpful search suggestions for executive message search. Focus on business context and executive communication patterns.'
          },
          {
            role: 'user',
            content: `Generate 5 search suggestions related to: "${query}"
            
            Return JSON array of suggestion strings.`
          }
        ],
        temperature: 0.7,
        max_tokens: 200,
        response_format: { type: 'json_object' }
      })

      const result = JSON.parse(response.choices[0].message.content || '{}')
      return result.suggestions || []
    } catch (error) {
      return []
    }
  }

  private calculateFacets(messages: Message[]): SearchFacets {
    const facets: SearchFacets = {
      platforms: {},
      senders: {},
      priorities: {},
      timeRanges: {},
      channels: {}
    }
    
    messages.forEach(message => {
      // Platform facets
      facets.platforms[message.channel] = (facets.platforms[message.channel] || 0) + 1
      
      // Sender facets
      facets.senders[message.sender] = (facets.senders[message.sender] || 0) + 1
      
      // Time range facets
      const daysSince = Math.floor((Date.now() - message.timestamp.getTime()) / (1000 * 60 * 60 * 24))
      let timeRange = 'older'
      if (daysSince <= 1) timeRange = 'today'
      else if (daysSince <= 7) timeRange = 'this_week'
      else if (daysSince <= 30) timeRange = 'this_month'
      
      facets.timeRanges[timeRange] = (facets.timeRanges[timeRange] || 0) + 1
    })
    
    return facets
  }

  private applyPagination(results: SearchResult[], pagination?: SearchPagination): SearchResult[] {
    if (!pagination) return results.slice(0, 20) // Default limit
    
    const start = pagination.offset || 0
    const end = start + (pagination.limit || 20)
    return results.slice(start, end)
  }

  private async generateQueryEmbedding(query: string): Promise<number[]> {
    // This would use OpenAI embeddings API or similar
    // For now, return empty array
    return []
  }

  private async saveSearchQuery(
    userId: string,
    query: string,
    resultCount: number,
    processingTime: number
  ): Promise<void> {
    await supabase.from('search_queries').insert({
      user_id: userId,
      query,
      result_count: resultCount,
      processing_time_ms: processingTime,
      created_at: new Date().toISOString()
    })
  }
}

// Singleton instance
export const unifiedSearchService = new UnifiedSearchService()