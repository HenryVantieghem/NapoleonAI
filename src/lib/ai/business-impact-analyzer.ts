import { openai, AI_MODELS, AI_CONFIG, EXECUTIVE_CONTEXT, AIError } from './openai-client'
import { Message, BusinessImpact, DecisionContext, RiskAssessment, DecisionOption } from '@/types/ai'

export class BusinessImpactAnalyzer {
  /**
   * Assess the business impact of a message or decision
   */
  async assessBusinessImpact(message: Message): Promise<{
    impact: BusinessImpact
    financialRange: { min: number; max: number }
    timeframe: string
    stakeholderImpact: string[]
    riskFactors: string[]
    opportunities: string[]
    confidence: number
  }> {
    try {
      const response = await openai.chat.completions.create({
        model: AI_MODELS.analysis,
        messages: [
          {
            role: 'system',
            content: this.getBusinessImpactSystemPrompt()
          },
          {
            role: 'user',
            content: this.buildBusinessImpactPrompt(message)
          }
        ],
        temperature: AI_CONFIG.temperature.analysis,
        max_tokens: AI_CONFIG.maxTokens.analysis,
        response_format: { type: 'json_object' }
      })

      const result = JSON.parse(response.choices[0].message.content || '{}')
      
      return {
        impact: this.normalizeBusinessImpact(result.impact),
        financialRange: {
          min: result.financialRange?.min || 0,
          max: result.financialRange?.max || 0
        },
        timeframe: result.timeframe || 'unknown',
        stakeholderImpact: result.stakeholderImpact || [],
        riskFactors: result.riskFactors || [],
        opportunities: result.opportunities || [],
        confidence: Math.min(Math.max(result.confidence || 0.5, 0), 1)
      }
    } catch (error) {
      throw new AIError(
        'Failed to assess business impact',
        'BUSINESS_IMPACT_ERROR',
        error as Error
      )
    }
  }

  /**
   * Generate comprehensive decision context for executive decisions
   */
  async generateDecisionContext(message: Message): Promise<DecisionContext> {
    try {
      const response = await openai.chat.completions.create({
        model: AI_MODELS.analysis,
        messages: [
          {
            role: 'system',
            content: this.getDecisionContextSystemPrompt()
          },
          {
            role: 'user',
            content: this.buildDecisionContextPrompt(message)
          }
        ],
        temperature: AI_CONFIG.temperature.analysis,
        max_tokens: AI_CONFIG.maxTokens.analysis,
        response_format: { type: 'json_object' }
      })

      const result = JSON.parse(response.choices[0].message.content || '{}')
      
      return {
        messageId: message.id,
        decisionType: result.decisionType || 'operational',
        stakeholders: result.stakeholders || [],
        timeline: {
          deadline: result.timeline?.deadline ? new Date(result.timeline.deadline) : undefined,
          milestones: result.timeline?.milestones?.map((m: any) => ({
            ...m,
            date: new Date(m.date)
          })) || [],
          criticalPath: result.timeline?.criticalPath || []
        },
        riskAssessment: result.riskAssessment || {
          level: 'medium',
          factors: [],
          mitigation: [],
          contingency: []
        },
        options: result.options || [],
        recommendations: result.recommendations || [],
        precedents: result.precedents || [],
        createdAt: new Date()
      }
    } catch (error) {
      throw new AIError(
        'Failed to generate decision context',
        'DECISION_CONTEXT_ERROR',
        error as Error
      )
    }
  }

  /**
   * Analyze competitive implications of a decision
   */
  async analyzeCompetitiveImplications(message: Message): Promise<{
    competitiveAdvantage: string[]
    competitiveRisks: string[]
    marketPosition: 'strengthen' | 'maintain' | 'weaken'
    timingConsiderations: string[]
    recommendations: string[]
  }> {
    try {
      const response = await openai.chat.completions.create({
        model: AI_MODELS.analysis,
        messages: [
          {
            role: 'system',
            content: `You are a strategic business analyst specializing in competitive analysis. 
            Analyze business decisions for competitive implications, market positioning, and strategic timing.
            Focus on how decisions impact competitive advantage and market position.`
          },
          {
            role: 'user',
            content: `Analyze the competitive implications of this business communication:

Subject: ${message.subject}
From: ${message.sender}
Content: ${message.content}

Provide JSON analysis with:
- competitiveAdvantage: array of potential competitive advantages
- competitiveRisks: array of competitive risks or vulnerabilities
- marketPosition: strengthen/maintain/weaken market position
- timingConsiderations: array of timing factors
- recommendations: array of strategic recommendations

Focus on market dynamics, competitive response, and strategic positioning.`
          }
        ],
        temperature: AI_CONFIG.temperature.analysis,
        max_tokens: AI_CONFIG.maxTokens.analysis,
        response_format: { type: 'json_object' }
      })

      return JSON.parse(response.choices[0].message.content || '{}')
    } catch (error) {
      throw new AIError(
        'Failed to analyze competitive implications',
        'COMPETITIVE_ANALYSIS_ERROR',
        error as Error
      )
    }
  }

  /**
   * Calculate financial impact scenarios
   */
  async calculateFinancialScenarios(message: Message): Promise<{
    scenarios: Array<{
      name: string
      probability: number
      revenue: number
      cost: number
      netImpact: number
      timeframe: string
      assumptions: string[]
    }>
    expectedValue: number
    riskAdjustedValue: number
    sensitivity: Array<{
      variable: string
      impact: number
    }>
  }> {
    try {
      const response = await openai.chat.completions.create({
        model: AI_MODELS.analysis,
        messages: [
          {
            role: 'system',
            content: `You are a financial analyst creating scenario models for executive decisions.
            Provide quantitative financial analysis with multiple scenarios, probabilities, and sensitivity analysis.
            Be realistic and conservative in estimates.`
          },
          {
            role: 'user',
            content: `Create financial scenarios for this business decision:

Subject: ${message.subject}
From: ${message.sender}
Content: ${message.content}

Provide JSON with:
- scenarios: array of financial scenarios with probability, revenue, cost, netImpact, timeframe, assumptions
- expectedValue: probability-weighted expected value
- riskAdjustedValue: risk-adjusted net present value
- sensitivity: array of key variables and their impact on outcomes

Include best case, most likely, and worst case scenarios with realistic probabilities.`
          }
        ],
        temperature: AI_CONFIG.temperature.analysis,
        max_tokens: AI_CONFIG.maxTokens.analysis,
        response_format: { type: 'json_object' }
      })

      return JSON.parse(response.choices[0].message.content || '{}')
    } catch (error) {
      throw new AIError(
        'Failed to calculate financial scenarios',
        'FINANCIAL_SCENARIOS_ERROR',
        error as Error
      )
    }
  }

  /**
   * Assess regulatory and compliance implications
   */
  async assessRegulatoryImplications(message: Message): Promise<{
    regulatoryBodies: string[]
    complianceRequirements: string[]
    risks: Array<{
      type: string
      severity: 'low' | 'medium' | 'high' | 'critical'
      description: string
      mitigation: string[]
    }>
    timeline: string[]
    recommendations: string[]
  }> {
    try {
      const response = await openai.chat.completions.create({
        model: AI_MODELS.analysis,
        messages: [
          {
            role: 'system',
            content: `You are a compliance and regulatory affairs expert analyzing business decisions.
            Focus on regulatory requirements, compliance obligations, and risk mitigation strategies.
            Consider SEC, FTC, GDPR, industry-specific regulations, and corporate governance.`
          },
          {
            role: 'user',
            content: `Analyze regulatory and compliance implications:

Subject: ${message.subject}
From: ${message.sender}
Content: ${message.content}

Provide JSON analysis with:
- regulatoryBodies: relevant regulatory agencies
- complianceRequirements: specific compliance obligations
- risks: array of regulatory risks with type, severity, description, mitigation
- timeline: key regulatory timeline considerations
- recommendations: compliance recommendations

Focus on material regulatory impacts and executive-level compliance decisions.`
          }
        ],
        temperature: AI_CONFIG.temperature.analysis,
        max_tokens: AI_CONFIG.maxTokens.analysis,
        response_format: { type: 'json_object' }
      })

      return JSON.parse(response.choices[0].message.content || '{}')
    } catch (error) {
      throw new AIError(
        'Failed to assess regulatory implications',
        'REGULATORY_ANALYSIS_ERROR',
        error as Error
      )
    }
  }

  /**
   * Build business impact analysis prompt
   */
  private buildBusinessImpactPrompt(message: Message): string {
    return `Assess the business impact of this executive communication:

Subject: ${message.subject}
From: ${message.sender} (${message.senderRole || 'Unknown role'})
Channel: ${message.channel}
Content: ${message.content}

Executive Context:
- Company focus: Strategic growth, profitability, market position
- Key metrics: Revenue, EBITDA, market share, customer satisfaction
- Decision thresholds: $10M+ (critical), $1M+ (high), $100K+ (medium)

Provide JSON analysis with:
- impact: very-high/high/medium/low business impact assessment
- financialRange: {min: number, max: number} estimated financial impact
- timeframe: when impact will be realized (immediate/short-term/medium-term/long-term)
- stakeholderImpact: array of affected stakeholder groups
- riskFactors: array of business risks
- opportunities: array of business opportunities
- confidence: 0.0-1.0 confidence in assessment

Consider:
1. Financial implications (revenue, cost, profitability)
2. Strategic importance (competitive advantage, market position)
3. Operational impact (efficiency, processes, resources)
4. Stakeholder effects (customers, employees, partners, investors)
5. Timeline and urgency
6. Risk and opportunity assessment`
  }

  /**
   * Build decision context analysis prompt
   */
  private buildDecisionContextPrompt(message: Message): string {
    return `Generate comprehensive decision context for this executive communication:

Subject: ${message.subject}
From: ${message.sender}
Content: ${message.content}

Provide JSON with:
- decisionType: financial/strategic/operational/legal/hr/technology/partnership/acquisition
- stakeholders: array of {name, role, influence: high/medium/low, position: supporter/neutral/opposition/unknown}
- timeline: {deadline: ISO date, milestones: [{name, date: ISO date, importance: critical/high/medium/low, dependencies: string[]}], criticalPath: string[]}
- riskAssessment: {level: critical/high/medium/low, factors: [{type: financial/reputational/operational/legal/competitive, description, probability: 0.0-1.0, impact: very-high/high/medium/low}], mitigation: string[], contingency: string[]}
- options: array of {id, title, description, pros: string[], cons: string[], cost: number, timeline: string, riskLevel: critical/high/medium/low, recommendationScore: 0.0-1.0}
- recommendations: array of strategic recommendations
- precedents: array of similar past decisions or industry precedents

Focus on executive-level strategic context and decision-making frameworks.`
  }

  /**
   * Get business impact analysis system prompt
   */
  private getBusinessImpactSystemPrompt(): string {
    return `You are a senior business analyst specializing in executive-level impact assessment.

Your expertise includes:
- Financial modeling and valuation
- Strategic analysis and competitive positioning  
- Risk assessment and scenario planning
- Stakeholder impact analysis
- Market dynamics and timing
- Operational efficiency and resource allocation

Decision Framework:
- VERY HIGH: $50M+ impact, strategic transformation, market leadership
- HIGH: $10M+ impact, competitive advantage, significant market share
- MEDIUM: $1M+ impact, operational efficiency, customer satisfaction
- LOW: <$1M impact, process improvement, administrative

Analysis Approach:
1. Quantify financial implications across time horizons
2. Assess strategic importance and competitive impact
3. Evaluate stakeholder effects and alignment
4. Consider market timing and competitive dynamics
5. Identify risks, opportunities, and mitigation strategies
6. Provide confidence-weighted assessments

Focus on actionable insights that help executives make informed decisions quickly.`
  }

  /**
   * Get decision context system prompt
   */
  private getDecisionContextSystemPrompt(): string {
    return `You are an executive decision support specialist providing comprehensive context for C-suite decisions.

Your role:
- Structure complex decisions with clear frameworks
- Identify all relevant stakeholders and their positions
- Map decision timelines and critical milestones
- Assess risks across multiple dimensions
- Generate viable options with pros/cons analysis
- Provide strategic recommendations based on precedents

Decision Categories:
- Financial: M&A, investments, budget allocation, financing
- Strategic: Market entry, partnerships, product direction
- Operational: Process changes, technology, organizational
- Legal: Compliance, contracts, regulatory responses
- HR: Leadership, compensation, organizational design

Context Framework:
1. Define decision type and scope
2. Map stakeholder influence and positions
3. Establish timeline with critical milestones
4. Assess multi-dimensional risks
5. Generate and evaluate options
6. Recommend optimal path forward

Provide structured, actionable decision support for executive leadership.`
  }

  /**
   * Normalize business impact assessment
   */
  private normalizeBusinessImpact(impact: string): BusinessImpact {
    const normalized = impact?.toLowerCase().replace(/[-_]/g, '')
    
    if (normalized?.includes('veryhigh') || normalized?.includes('critical')) {
      return 'very-high'
    }
    if (normalized?.includes('high')) {
      return 'high'
    }
    if (normalized?.includes('medium') || normalized?.includes('moderate')) {
      return 'medium'
    }
    return 'low'
  }
}

// Singleton instance
export const businessImpactAnalyzer = new BusinessImpactAnalyzer()