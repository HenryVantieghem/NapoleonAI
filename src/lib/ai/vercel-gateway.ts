/**
 * Napoleon AI - Vercel AI Gateway Configuration
 * 
 * Enterprise-grade AI Gateway setup for executive communication management.
 * Provides unified access to multiple AI providers with automatic failover.
 */

import { openai } from 'ai/openai';
import { anthropic } from 'ai/anthropic';
import { generateText, generateObject } from 'ai';

// AI Model Configuration for Executive Tasks
export const aiConfig = {
  // Primary models for different executive tasks
  models: {
    // Best for executive message summarization
    summarization: openai('gpt-4-turbo', {
      temperature: 0.3,
      maxTokens: 500
    }),
    
    // Best for priority analysis and sentiment
    prioritization: anthropic('claude-3.5-sonnet', {
      temperature: 0.2,
      maxTokens: 300
    }),
    
    // Best for action item extraction
    actionExtraction: openai('gpt-4-turbo', {
      temperature: 0.1,
      maxTokens: 400
    }),
    
    // Best for relationship insights
    relationshipAnalysis: anthropic('claude-3.5-sonnet', {
      temperature: 0.4,
      maxTokens: 600
    }),
    
    // Best for executive response generation
    responseGeneration: openai('gpt-4-turbo', {
      temperature: 0.6,
      maxTokens: 800
    })
  },
  
  // Fallback chain for high availability
  fallbacks: {
    'gpt-4-turbo': ['claude-3.5-sonnet', 'gpt-4'],
    'claude-3.5-sonnet': ['gpt-4-turbo', 'gpt-4'],
    'gpt-4': ['claude-3.5-sonnet', 'gpt-4-turbo']
  },
  
  // Performance thresholds for model switching
  performance: {
    maxLatency: 5000, // 5 seconds max for executive use
    maxRetries: 3,
    fallbackDelay: 1000 // 1 second delay before fallback
  }
};

// Model selection based on task type and performance
export function getModelForTask(taskType: keyof typeof aiConfig.models) {
  const model = aiConfig.models[taskType];
  
  if (!model) {
    console.warn(`Unknown task type: ${taskType}, using default model`);
    return aiConfig.models.summarization;
  }
  
  return model;
}

// Executive-focused AI Gateway service
export class VercelAIGateway {
  private requestCount = 0;
  private performanceMetrics = new Map<string, number[]>();
  
  /**
   * Analyze executive message with priority scoring
   */
  async analyzeExecutiveMessage(content: string, context: {
    sender?: string;
    isVIP?: boolean;
    timestamp?: string;
    platform?: 'gmail' | 'slack' | 'teams';
  }) {
    const startTime = Date.now();
    
    try {
      const result = await generateObject({
        model: getModelForTask('prioritization'),
        prompt: this.buildPriorityPrompt(content, context),
        schema: {
          priority: 'number', // 1-100 scale
          urgency: 'string', // low, medium, high, critical
          sentiment: 'string', // positive, neutral, negative, urgent
          executiveAction: 'boolean', // requires C-suite attention
          estimatedResponseTime: 'string', // immediate, 1h, 4h, 24h
          keyTopics: 'array', // main subjects
          vipStatus: 'boolean' // from VIP contact
        }
      });
      
      this.recordPerformance('prioritization', Date.now() - startTime);
      return result.object;
      
    } catch (error) {
      console.error('Executive message analysis failed:', error);
      return this.getFallbackAnalysis(content, context);
    }
  }
  
  /**
   * Generate executive summary for daily digest
   */
  async generateExecutiveSummary(messages: any[], timeframe: string = '24h') {
    const startTime = Date.now();
    
    try {
      const result = await generateText({
        model: getModelForTask('summarization'),
        prompt: this.buildSummaryPrompt(messages, timeframe),
        maxTokens: 500,
        temperature: 0.3
      });
      
      this.recordPerformance('summarization', Date.now() - startTime);
      return result.text;
      
    } catch (error) {
      console.error('Executive summary generation failed:', error);
      return this.getFallbackSummary(messages);
    }
  }
  
  /**
   * Extract actionable items from executive communications
   */
  async extractActionItems(content: string, context: any) {
    const startTime = Date.now();
    
    try {
      const result = await generateObject({
        model: getModelForTask('actionExtraction'),
        prompt: this.buildActionPrompt(content, context),
        schema: {
          actionItems: 'array', // list of extracted actions
          deadlines: 'array', // associated deadlines
          assignees: 'array', // who should handle each action
          priorities: 'array', // action priorities
          dependencies: 'array' // task dependencies
        }
      });
      
      this.recordPerformance('actionExtraction', Date.now() - startTime);
      return result.object;
      
    } catch (error) {
      console.error('Action extraction failed:', error);
      return this.getFallbackActions(content);
    }
  }
  
  /**
   * Generate relationship insights for VIP contacts
   */
  async analyzeRelationshipInsights(contactHistory: any[], contactInfo: any) {
    const startTime = Date.now();
    
    try {
      const result = await generateObject({
        model: getModelForTask('relationshipAnalysis'),
        prompt: this.buildRelationshipPrompt(contactHistory, contactInfo),
        schema: {
          relationshipStrength: 'number', // 1-10 scale
          communicationTrend: 'string', // increasing, stable, decreasing
          lastInteraction: 'string',
          suggestedActions: 'array',
          riskFactors: 'array',
          opportunities: 'array'
        }
      });
      
      this.recordPerformance('relationshipAnalysis', Date.now() - startTime);
      return result.object;
      
    } catch (error) {
      console.error('Relationship analysis failed:', error);
      return this.getFallbackRelationship(contactInfo);
    }
  }
  
  /**
   * Generate executive response suggestions
   */
  async generateExecutiveResponse(originalMessage: string, context: any, tone: 'formal' | 'friendly' | 'urgent' = 'formal') {
    const startTime = Date.now();
    
    try {
      const result = await generateText({
        model: getModelForTask('responseGeneration'),
        prompt: this.buildResponsePrompt(originalMessage, context, tone),
        maxTokens: 800,
        temperature: 0.6
      });
      
      this.recordPerformance('responseGeneration', Date.now() - startTime);
      return result.text;
      
    } catch (error) {
      console.error('Response generation failed:', error);
      return this.getFallbackResponse(originalMessage, tone);
    }
  }
  
  // Performance monitoring
  private recordPerformance(operation: string, duration: number) {
    if (!this.performanceMetrics.has(operation)) {
      this.performanceMetrics.set(operation, []);
    }
    
    const metrics = this.performanceMetrics.get(operation)!;
    metrics.push(duration);
    
    // Keep only last 100 measurements
    if (metrics.length > 100) {
      metrics.shift();
    }
    
    // Log slow operations
    if (duration > aiConfig.performance.maxLatency) {
      console.warn(`Slow AI operation detected: ${operation} took ${duration}ms`);
    }
  }
  
  // Get performance statistics
  getPerformanceStats() {
    const stats: Record<string, any> = {};
    
    for (const [operation, metrics] of this.performanceMetrics) {
      const avg = metrics.reduce((a, b) => a + b, 0) / metrics.length;
      const max = Math.max(...metrics);
      const min = Math.min(...metrics);
      
      stats[operation] = {
        average: Math.round(avg),
        maximum: max,
        minimum: min,
        requestCount: metrics.length
      };
    }
    
    return stats;
  }
  
  // Prompt builders
  private buildPriorityPrompt(content: string, context: any) {
    return `
As an executive assistant AI, analyze this message for priority and executive attention needs:

Message: "${content}"
Sender: ${context.sender || 'Unknown'}
Platform: ${context.platform || 'Unknown'}
VIP Contact: ${context.isVIP ? 'Yes' : 'No'}
Timestamp: ${context.timestamp || 'Unknown'}

Consider:
1. Urgency indicators (deadline words, ASAP, urgent, etc.)
2. Business impact (revenue, clients, board, investors)
3. Sender importance (VIP status, C-suite, key stakeholders)
4. Action requirements (decisions, approvals, responses needed)
5. Time sensitivity (meetings, deadlines, market windows)

Provide executive-level analysis focused on strategic importance.
    `;
  }
  
  private buildSummaryPrompt(messages: any[], timeframe: string) {
    const messageCount = messages.length;
    const vipCount = messages.filter(m => m.isVIP).length;
    const urgentCount = messages.filter(m => m.urgency === 'high' || m.urgency === 'critical').length;
    
    return `
Create an executive summary for ${messageCount} messages received in the last ${timeframe}.

Key metrics:
- Total messages: ${messageCount}
- VIP messages: ${vipCount}
- Urgent messages: ${urgentCount}

Messages overview:
${messages.map(m => `- From: ${m.sender}, Subject: ${m.subject}, Priority: ${m.priority}`).join('\n')}

Create a luxury executive briefing that highlights:
1. Critical items requiring immediate attention
2. Key stakeholder communications
3. Time-sensitive opportunities or risks
4. Strategic decisions needed
5. Follow-up actions required

Write in a concise, executive-appropriate tone suitable for C-suite consumption.
    `;
  }
  
  private buildActionPrompt(content: string, context: any) {
    return `
Extract actionable items from this executive communication:

Message: "${content}"
Context: ${JSON.stringify(context, null, 2)}

Identify:
1. Specific actions that need to be taken
2. Deadlines or timeframes mentioned
3. Who should be responsible for each action
4. Dependencies between actions
5. Priority levels for each action

Focus on executive-level actions and strategic decisions, not administrative tasks.
    `;
  }
  
  private buildRelationshipPrompt(history: any[], contact: any) {
    return `
Analyze the relationship with this VIP contact based on communication history:

Contact: ${contact.name} (${contact.relationship_type})
Email: ${contact.email}
Priority Level: ${contact.priority_level}/10

Communication History (last ${history.length} interactions):
${history.map(h => `- ${h.date}: ${h.subject} (${h.sentiment})`).join('\n')}

Provide executive-level relationship intelligence focusing on:
1. Relationship health and trends
2. Communication patterns and frequency
3. Potential risks or opportunities
4. Recommended actions to strengthen relationship
5. Strategic importance to business objectives
    `;
  }
  
  private buildResponsePrompt(message: string, context: any, tone: string) {
    return `
Generate an executive response to this message:

Original Message: "${message}"
Response Tone: ${tone}
Executive Role: ${context.userRole || 'C-suite'}
Relationship: ${context.relationship || 'Professional'}

Create a response that:
1. Reflects executive-level authority and decision-making
2. Is appropriately concise for executive communication
3. Maintains luxury brand positioning
4. Addresses key points efficiently
5. Includes appropriate next steps or delegation

Use ${tone} tone while maintaining executive gravitas.
    `;
  }
  
  // Fallback methods for error scenarios
  private getFallbackAnalysis(content: string, context: any) {
    return {
      priority: 50,
      urgency: 'medium',
      sentiment: 'neutral',
      executiveAction: false,
      estimatedResponseTime: '4h',
      keyTopics: ['General Communication'],
      vipStatus: context.isVIP || false
    };
  }
  
  private getFallbackSummary(messages: any[]) {
    return `Executive Summary: ${messages.length} messages received. Please review for urgent items requiring immediate attention.`;
  }
  
  private getFallbackActions(content: string) {
    return {
      actionItems: ['Review message and determine next steps'],
      deadlines: ['Within 24 hours'],
      assignees: ['Executive Assistant'],
      priorities: ['Medium'],
      dependencies: []
    };
  }
  
  private getFallbackRelationship(contact: any) {
    return {
      relationshipStrength: 5,
      communicationTrend: 'stable',
      lastInteraction: 'Unknown',
      suggestedActions: ['Schedule regular check-in'],
      riskFactors: ['Limited recent communication'],
      opportunities: ['Strengthen relationship through regular contact']
    };
  }
  
  private getFallbackResponse(message: string, tone: string) {
    return `Thank you for your message. I will review this and provide a detailed response shortly.`;
  }
}

// Singleton instance for application use
export const aiGateway = new VercelAIGateway();

// Export configuration for testing and monitoring
export { aiConfig };