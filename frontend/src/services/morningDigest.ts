// Morning Digest Service
// Generates intelligent email summaries for trade business owners

import { GmailApiService, EmailSummary } from './gmailApi';
import { EmailAnalysisService, EmailAnalysis } from './emailAnalysis';

export interface DigestEmail {
  id: string;
  subject: string;
  from: string;
  snippet: string;
  priority: string;
  category: string;
  urgencyScore: number;
  actionRequired: boolean;
  suggestedActions: string[];
  reasoning: string;
}

export interface MorningDigest {
  generatedAt: Date;
  dateRange: {
    from: Date;
    to: Date;
  };
  summary: {
    totalEmails: number;
    urgentCount: number;
    highPriorityCount: number;
    actionRequiredCount: number;
    categoryCounts: {
      urgent: number;
      standard: number;
      followUp: number;
      admin: number;
      spam: number;
    };
  };
  urgentEmails: DigestEmail[];
  highPriorityEmails: DigestEmail[];
  actionRequiredEmails: DigestEmail[];
  businessInsights: string[];
  recommendations: string[];
}

export class MorningDigestService {
  private gmailService: GmailApiService;

  constructor(gmailService: GmailApiService) {
    this.gmailService = gmailService;
  }

  // Generate morning digest for the last 24 hours
  async generateMorningDigest(): Promise<MorningDigest> {
    const now = new Date();
    const yesterday = new Date(now.getTime() - (24 * 60 * 60 * 1000));

    try {
      // Fetch recent emails
      const messageList = await this.gmailService.listMessages({
        maxResults: 50,
        q: `newer_than:1d in:inbox`, // Last 24 hours in inbox
      });

      if (!messageList.messages || messageList.messages.length === 0) {
        return this.createEmptyDigest(yesterday, now);
      }

      // Get detailed messages (limit to 20 for performance)
      const messageIds = messageList.messages.slice(0, 20).map(m => m.id);
      const detailedMessages = await this.gmailService.getMessages(messageIds);

      // Convert to email summaries and analyze
      const emailSummaries = detailedMessages.map(msg => 
        GmailApiService.messageToSummary(msg)
      );

      const analyzedEmails = EmailAnalysisService.analyzeEmails(emailSummaries);
      const sortedEmails = EmailAnalysisService.sortEmailsByPriority(analyzedEmails);

      // Generate digest
      return this.createDigest(sortedEmails, yesterday, now);

    } catch (error) {
      console.error('Failed to generate morning digest:', error);
      throw error;
    }
  }

  private createEmptyDigest(from: Date, to: Date): MorningDigest {
    return {
      generatedAt: new Date(),
      dateRange: { from, to },
      summary: {
        totalEmails: 0,
        urgentCount: 0,
        highPriorityCount: 0,
        actionRequiredCount: 0,
        categoryCounts: {
          urgent: 0,
          standard: 0,
          followUp: 0,
          admin: 0,
          spam: 0
        }
      },
      urgentEmails: [],
      highPriorityEmails: [],
      actionRequiredEmails: [],
      businessInsights: ['No new emails in the last 24 hours.'],
      recommendations: ['Great job staying on top of your inbox!']
    };
  }

  private createDigest(
    analyzedEmails: Array<EmailSummary & { analysis: EmailAnalysis }>,
    from: Date,
    to: Date
  ): MorningDigest {
    // Convert to digest email format
    const digestEmails: DigestEmail[] = analyzedEmails.map(email => ({
      id: email.id,
      subject: email.subject,
      from: email.from,
      snippet: email.snippet,
      priority: email.analysis.priority,
      category: email.analysis.category,
      urgencyScore: email.analysis.urgencyScore,
      actionRequired: email.analysis.actionRequired,
      suggestedActions: email.analysis.suggestedActions,
      reasoning: email.analysis.reasoning
    }));

    // Calculate summary statistics
    const summary = this.calculateSummary(digestEmails);

    // Filter emails by priority
    const urgentEmails = digestEmails.filter(e => e.priority === 'urgent');
    const highPriorityEmails = digestEmails.filter(e => e.priority === 'high');
    const actionRequiredEmails = digestEmails.filter(e => e.actionRequired);

    // Generate insights and recommendations
    const businessInsights = this.generateBusinessInsights(digestEmails, summary);
    const recommendations = this.generateRecommendations(digestEmails, summary);

    return {
      generatedAt: new Date(),
      dateRange: { from, to },
      summary,
      urgentEmails: urgentEmails.slice(0, 5), // Top 5
      highPriorityEmails: highPriorityEmails.slice(0, 8), // Top 8
      actionRequiredEmails: actionRequiredEmails.slice(0, 10), // Top 10
      businessInsights,
      recommendations
    };
  }

  private calculateSummary(emails: DigestEmail[]) {
    const categoryCounts = {
      urgent: 0,
      standard: 0,
      followUp: 0,
      admin: 0,
      spam: 0
    };

    let urgentCount = 0;
    let highPriorityCount = 0;
    let actionRequiredCount = 0;

    emails.forEach(email => {
      // Count by category
      switch (email.category) {
        case 'urgent': categoryCounts.urgent++; break;
        case 'standard': categoryCounts.standard++; break;
        case 'follow-up': categoryCounts.followUp++; break;
        case 'admin': categoryCounts.admin++; break;
        case 'spam': categoryCounts.spam++; break;
      }

      // Count by priority
      if (email.priority === 'urgent') urgentCount++;
      if (email.priority === 'high') highPriorityCount++;
      if (email.actionRequired) actionRequiredCount++;
    });

    return {
      totalEmails: emails.length,
      urgentCount,
      highPriorityCount,
      actionRequiredCount,
      categoryCounts
    };
  }

  private generateBusinessInsights(emails: DigestEmail[], summary: any): string[] {
    const insights: string[] = [];

    // Email volume insights
    if (summary.totalEmails > 30) {
      insights.push(`📈 High email volume (${summary.totalEmails} emails). Consider setting up email filters.`);
    } else if (summary.totalEmails < 5) {
      insights.push(`📉 Low email volume (${summary.totalEmails} emails). Good inbox management!`);
    }

    // Urgency insights
    if (summary.urgentCount > 5) {
      insights.push(`🚨 High number of urgent emails (${summary.urgentCount}). May need immediate attention.`);
    }

    // Action required insights
    const actionPercentage = Math.round((summary.actionRequiredCount / summary.totalEmails) * 100);
    if (actionPercentage > 60) {
      insights.push(`⚡ ${actionPercentage}% of emails require action. Consider blocking time for email responses.`);
    }

    // Category insights
    if (summary.categoryCounts.followUp > summary.categoryCounts.standard) {
      insights.push(`🔄 More follow-up emails than new inquiries. Good sign of ongoing customer relationships.`);
    }

    if (summary.categoryCounts.spam > 3) {
      insights.push(`🛡️ ${summary.categoryCounts.spam} potential spam emails detected. Review spam filters.`);
    }

    // Business-specific insights
    const businessKeywords = ['quote', 'estimate', 'invoice', 'payment', 'service', 'repair', 'maintenance'];
    const businessEmailCount = emails.filter(email => 
      businessKeywords.some(keyword => 
        email.subject.toLowerCase().includes(keyword) || 
        email.snippet.toLowerCase().includes(keyword)
      )
    ).length;

    if (businessEmailCount > summary.totalEmails * 0.7) {
      insights.push(`💼 High business email ratio (${Math.round(businessEmailCount / summary.totalEmails * 100)}%). Strong customer engagement.`);
    }

    return insights.length > 0 ? insights : ['📊 Email patterns look normal for your business.'];
  }

  private generateRecommendations(emails: DigestEmail[], summary: any): string[] {
    const recommendations: string[] = [];

    // Priority-based recommendations
    if (summary.urgentCount > 0) {
      recommendations.push(`🔥 Address ${summary.urgentCount} urgent email${summary.urgentCount > 1 ? 's' : ''} first`);
    }

    if (summary.actionRequiredCount > 10) {
      recommendations.push(`📋 Block 2-3 hours today for email responses (${summary.actionRequiredCount} emails need action)`);
    }

    // Time management recommendations
    if (summary.totalEmails > 20) {
      recommendations.push(`⏰ Consider batching email responses at set times (e.g., 9 AM, 2 PM, 5 PM)`);
    }

    // Business process recommendations
    if (summary.categoryCounts.followUp > 5) {
      recommendations.push(`📞 Consider calling clients with multiple follow-ups instead of emailing`);
    }

    if (summary.categoryCounts.admin > 8) {
      recommendations.push(`📄 Set up filters to auto-sort administrative emails`);
    }

    // Default recommendations
    if (recommendations.length === 0) {
      recommendations.push(`✅ Your inbox looks manageable today!`);
      recommendations.push(`💡 Consider setting up email templates for common responses`);
    }

    return recommendations;
  }

  // Generate digest for specific date range
  async generateCustomDigest(fromDate: Date, toDate: Date): Promise<MorningDigest> {
    const fromFormatted = Math.floor(fromDate.getTime() / 1000);
    const toFormatted = Math.floor(toDate.getTime() / 1000);

    try {
      const messageList = await this.gmailService.listMessages({
        maxResults: 50,
        q: `after:${fromFormatted} before:${toFormatted} in:inbox`,
      });

      if (!messageList.messages || messageList.messages.length === 0) {
        return this.createEmptyDigest(fromDate, toDate);
      }

      const messageIds = messageList.messages.slice(0, 20).map(m => m.id);
      const detailedMessages = await this.gmailService.getMessages(messageIds);
      const emailSummaries = detailedMessages.map(msg => 
        GmailApiService.messageToSummary(msg)
      );
      const analyzedEmails = EmailAnalysisService.analyzeEmails(emailSummaries);
      const sortedEmails = EmailAnalysisService.sortEmailsByPriority(analyzedEmails);

      return this.createDigest(sortedEmails, fromDate, toDate);

    } catch (error) {
      console.error('Failed to generate custom digest:', error);
      throw error;
    }
  }
}