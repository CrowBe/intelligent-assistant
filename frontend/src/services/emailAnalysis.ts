// Email Analysis Service
// This service analyzes email content for urgency, priority, and categorization

import { EmailSummary } from './gmailApi';

// Analysis result types
export interface EmailAnalysis {
  priority: 'urgent' | 'high' | 'normal' | 'low';
  category: 'urgent' | 'standard' | 'follow-up' | 'admin' | 'spam';
  urgencyScore: number; // 0-100
  businessRelevance: number; // 0-100
  actionRequired: boolean;
  estimatedReadTime: number; // in minutes
  keywords: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  suggestedActions: string[];
  reasoning: string;
}

// Keywords for different categories
const URGENT_KEYWORDS = [
  'urgent', 'asap', 'emergency', 'critical', 'immediate', 'deadline',
  'time sensitive', 'rush', 'priority', 'expires today', 'action required',
  'overdue', 'final notice', 'last chance', 'breaking', 'alert'
];

const BUSINESS_KEYWORDS = [
  'invoice', 'payment', 'quote', 'estimate', 'contract', 'proposal',
  'project', 'meeting', 'appointment', 'schedule', 'client', 'customer',
  'order', 'delivery', 'service', 'maintenance', 'repair', 'installation',
  'booking', 'reservation', 'follow up', 'feedback', 'review'
];

const ADMIN_KEYWORDS = [
  'notification', 'update', 'newsletter', 'report', 'summary',
  'confirmation', 'receipt', 'statement', 'reminder', 'subscription',
  'account', 'billing', 'renewal', 'terms', 'policy', 'legal'
];

const SPAM_INDICATORS = [
  'free', 'win', 'winner', 'congratulations', 'limited time',
  'click here', 'act now', 'make money', 'work from home',
  'no obligation', 'risk free', 'guarantee', 'amazing deal',
  'once in a lifetime', 'special offer', 'credit check'
];

// Trade business specific keywords
const TRADE_URGENT_KEYWORDS = [
  'leak', 'flood', 'blocked', 'burst', 'emergency call',
  'no water', 'no heating', 'gas leak', 'electrical fault',
  'power outage', 'safety issue', 'health hazard'
];

const TRADE_BUSINESS_KEYWORDS = [
  'plumbing', 'electrical', 'hvac', 'carpentry', 'roofing',
  'bathroom', 'kitchen', 'renovation', 'installation', 'repair',
  'maintenance', 'inspection', 'compliance', 'permit', 'quote'
];

export class EmailAnalysisService {
  // Main analysis function
  static analyzeEmail(email: EmailSummary): EmailAnalysis {
    const content = `${email.subject} ${email.snippet} ${email.bodyPreview}`.toLowerCase();
    const fromDomain = email.from.split('@')[1]?.toLowerCase() || '';
    
    // Calculate different scores
    const urgencyScore = this.calculateUrgencyScore(content, email);
    const businessRelevance = this.calculateBusinessRelevance(content, fromDomain);
    const spamScore = this.calculateSpamScore(content, email);
    
    // Determine category
    const category = this.determineCategory(content, urgencyScore, businessRelevance, spamScore);
    
    // Determine priority
    const priority = this.determinePriority(urgencyScore, businessRelevance, category);
    
    // Extract keywords
    const keywords = this.extractKeywords(content);
    
    // Analyze sentiment
    const sentiment = this.analyzeSentiment(content);
    
    // Check if action is required
    const actionRequired = this.requiresAction(content, category);
    
    // Estimate read time (rough calculation)
    const estimatedReadTime = Math.max(1, Math.ceil(content.split(' ').length / 200));
    
    // Generate suggested actions
    const suggestedActions = this.generateSuggestedActions(category, urgencyScore, actionRequired);
    
    // Generate reasoning
    const reasoning = this.generateReasoning(category, priority, urgencyScore, businessRelevance);

    return {
      priority,
      category,
      urgencyScore,
      businessRelevance,
      actionRequired,
      estimatedReadTime,
      keywords,
      sentiment,
      suggestedActions,
      reasoning
    };
  }

  // Calculate urgency score (0-100)
  private static calculateUrgencyScore(content: string, email: EmailSummary): number {
    let score = 0;
    
    // Check for urgent keywords
    URGENT_KEYWORDS.forEach(keyword => {
      if (content.includes(keyword)) {
        score += 15;
      }
    });
    
    // Trade-specific urgent keywords get higher score
    TRADE_URGENT_KEYWORDS.forEach(keyword => {
      if (content.includes(keyword)) {
        score += 25;
      }
    });
    
    // Time-based urgency
    const emailAge = Date.now() - email.date.getTime();
    const hoursOld = emailAge / (1000 * 60 * 60);
    
    if (hoursOld < 1) score += 10; // Very recent
    if (hoursOld < 4) score += 5; // Recent
    
    // Subject line indicators
    if (email.subject.includes('!')) score += 5;
    if (email.subject.toUpperCase() === email.subject) score += 10; // ALL CAPS
    if (email.subject.includes('RE:') && email.subject.includes('RE: RE:')) score += 8; // Long thread
    
    // Known sender patterns
    if (email.from.includes('noreply') || email.from.includes('no-reply')) {
      score -= 10; // Automated emails are usually less urgent
    }
    
    return Math.min(100, Math.max(0, score));
  }

  // Calculate business relevance (0-100)
  private static calculateBusinessRelevance(content: string, fromDomain: string): number {
    let score = 30; // Base score
    
    // Business keywords
    BUSINESS_KEYWORDS.forEach(keyword => {
      if (content.includes(keyword)) {
        score += 8;
      }
    });
    
    // Trade-specific keywords
    TRADE_BUSINESS_KEYWORDS.forEach(keyword => {
      if (content.includes(keyword)) {
        score += 12;
      }
    });
    
    // Domain-based scoring
    const businessDomains = ['gmail.com', 'outlook.com', 'yahoo.com']; // Personal email domains
    if (!businessDomains.includes(fromDomain) && fromDomain) {
      score += 15; // Business email domain
    }
    
    // Common business email patterns
    if (content.includes('invoice') || content.includes('quote')) score += 20;
    if (content.includes('meeting') || content.includes('appointment')) score += 15;
    if (content.includes('payment') || content.includes('overdue')) score += 20;
    
    return Math.min(100, Math.max(0, score));
  }

  // Calculate spam likelihood (0-100)
  private static calculateSpamScore(content: string, email: EmailSummary): number {
    let score = 0;
    
    SPAM_INDICATORS.forEach(indicator => {
      if (content.includes(indicator)) {
        score += 15;
      }
    });
    
    // Excessive punctuation
    const exclamationCount = (content.match(/!/g) || []).length;
    score += Math.min(20, exclamationCount * 2);
    
    // Suspicious patterns
    if (email.from.includes('noreply@') && content.includes('click here')) score += 20;
    if (content.includes('$') && content.includes('free')) score += 15;
    
    return Math.min(100, Math.max(0, score));
  }

  // Determine email category
  private static determineCategory(content: string, urgencyScore: number, businessRelevance: number, spamScore: number): EmailAnalysis['category'] {
    if (spamScore > 60) return 'spam';
    if (urgencyScore > 70) return 'urgent';
    if (businessRelevance > 70) return 'standard';
    if (content.includes('follow up') || content.includes('following up')) return 'follow-up';
    if (ADMIN_KEYWORDS.some(keyword => content.includes(keyword))) return 'admin';
    
    return 'standard';
  }

  // Determine priority level
  private static determinePriority(urgencyScore: number, businessRelevance: number, category: EmailAnalysis['category']): EmailAnalysis['priority'] {
    if (category === 'urgent' || urgencyScore > 80) return 'urgent';
    if (urgencyScore > 60 || (businessRelevance > 80 && urgencyScore > 40)) return 'high';
    if (urgencyScore < 20 && businessRelevance < 30) return 'low';
    return 'normal';
  }

  // Extract relevant keywords
  private static extractKeywords(content: string): string[] {
    const allKeywords = [...URGENT_KEYWORDS, ...BUSINESS_KEYWORDS, ...TRADE_BUSINESS_KEYWORDS, ...TRADE_URGENT_KEYWORDS];
    return allKeywords.filter(keyword => content.includes(keyword));
  }

  // Simple sentiment analysis
  private static analyzeSentiment(content: string): EmailAnalysis['sentiment'] {
    const positiveWords = ['thank', 'great', 'excellent', 'pleased', 'happy', 'satisfied', 'good', 'wonderful'];
    const negativeWords = ['problem', 'issue', 'complaint', 'angry', 'upset', 'disappointed', 'terrible', 'awful', 'urgent', 'emergency'];
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    positiveWords.forEach(word => {
      if (content.includes(word)) positiveCount++;
    });
    
    negativeWords.forEach(word => {
      if (content.includes(word)) negativeCount++;
    });
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  // Check if action is required
  private static requiresAction(content: string, category: EmailAnalysis['category']): boolean {
    const actionWords = ['please', 'request', 'need', 'require', 'schedule', 'confirm', 'respond', 'reply', 'call'];
    const hasActionWords = actionWords.some(word => content.includes(word));
    
    return category === 'urgent' || hasActionWords || content.includes('?');
  }

  // Generate suggested actions
  private static generateSuggestedActions(category: EmailAnalysis['category'], urgencyScore: number, actionRequired: boolean): string[] {
    const actions: string[] = [];
    
    if (category === 'urgent' || urgencyScore > 70) {
      actions.push('Respond immediately');
      actions.push('Call if necessary');
    } else if (category === 'standard' && actionRequired) {
      actions.push('Respond within 24 hours');
      actions.push('Add to calendar if scheduling required');
    } else if (category === 'follow-up') {
      actions.push('Check previous correspondence');
      actions.push('Provide requested update');
    } else if (category === 'admin') {
      actions.push('File for records');
      actions.push('Review when convenient');
    }
    
    if (category === 'spam') {
      actions.push('Mark as spam');
      actions.push('Block sender if needed');
    }
    
    return actions;
  }

  // Generate reasoning for the analysis
  private static generateReasoning(category: EmailAnalysis['category'], priority: EmailAnalysis['priority'], urgencyScore: number, businessRelevance: number): string {
    let reasoning = `Categorized as ${category} with ${priority} priority. `;
    
    if (urgencyScore > 70) {
      reasoning += `High urgency score (${urgencyScore}) due to urgent keywords or time sensitivity. `;
    }
    
    if (businessRelevance > 70) {
      reasoning += `High business relevance (${businessRelevance}) based on content and sender. `;
    }
    
    if (category === 'urgent') {
      reasoning += 'Contains urgent indicators requiring immediate attention.';
    } else if (category === 'spam') {
      reasoning += 'Contains spam indicators and should be reviewed carefully.';
    }
    
    return reasoning;
  }

  // Batch analyze multiple emails
  static analyzeEmails(emails: EmailSummary[]): Array<EmailSummary & { analysis: EmailAnalysis }> {
    return emails.map(email => ({
      ...email,
      analysis: this.analyzeEmail(email)
    }));
  }

  // Sort emails by priority and urgency
  static sortEmailsByPriority(emails: Array<EmailSummary & { analysis: EmailAnalysis }>): Array<EmailSummary & { analysis: EmailAnalysis }> {
    const priorityOrder = { 'urgent': 4, 'high': 3, 'normal': 2, 'low': 1 };
    
    return emails.sort((a, b) => {
      const aPriority = priorityOrder[a.analysis.priority];
      const bPriority = priorityOrder[b.analysis.priority];
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority; // Higher priority first
      }
      
      // If same priority, sort by urgency score
      return b.analysis.urgencyScore - a.analysis.urgencyScore;
    });
  }
}