// Gmail API Service Layer
// This service handles Gmail API calls using Google OAuth authentication

import { useEffect, useState } from 'react';
import { useGoogleGmailAuth } from './googleAuth';

// Gmail API scopes we need
export const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.metadata'
];

// Gmail API endpoints
const GMAIL_API_BASE = 'https://gmail.googleapis.com/gmail/v1';

// Types for Gmail API responses
export interface GmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  payload: {
    headers: Array<{
      name: string;
      value: string;
    }>;
    body?: {
      data?: string;
      size: number;
    };
    parts?: Array<{
      mimeType: string;
      body?: {
        data?: string;
        size: number;
      };
    }>;
  };
  sizeEstimate: number;
  historyId: string;
  internalDate: string;
}

export interface GmailThread {
  id: string;
  snippet: string;
  historyId: string;
  messages: GmailMessage[];
}

export interface EmailSummary {
  id: string;
  subject: string;
  from: string;
  to: string;
  date: Date;
  snippet: string;
  isUnread: boolean;
  labels: string[];
  priority: 'urgent' | 'high' | 'normal' | 'low';
  category: 'urgent' | 'standard' | 'follow-up' | 'admin' | 'spam';
  bodyPreview: string;
}

// Gmail API Service Class
export class GmailApiService {
  private accessToken: string | null = null;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  // Generic API call method
  private async makeApiCall(endpoint: string, options: RequestInit = {}): Promise<any> {
    if (!this.accessToken) {
      throw new Error('No access token available. Please authenticate first.');
    }

    const response = await fetch(`${GMAIL_API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Gmail API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
    }

    return response.json();
  }

  // Get user's Gmail profile
  async getProfile(): Promise<any> {
    return this.makeApiCall('/users/me/profile');
  }

  // List messages with filters
  async listMessages(options: {
    maxResults?: number;
    pageToken?: string;
    q?: string; // Gmail search query
    labelIds?: string[];
    includeSpamTrash?: boolean;
  } = {}): Promise<{
    messages: Array<{ id: string; threadId: string }>;
    nextPageToken?: string;
    resultSizeEstimate: number;
  }> {
    const params = new URLSearchParams();
    
    if (options.maxResults) params.append('maxResults', options.maxResults.toString());
    if (options.pageToken) params.append('pageToken', options.pageToken);
    if (options.q) params.append('q', options.q);
    if (options.labelIds) params.append('labelIds', options.labelIds.join(','));
    if (options.includeSpamTrash) params.append('includeSpamTrash', 'true');

    const endpoint = `/users/me/messages?${params.toString()}`;
    return this.makeApiCall(endpoint);
  }

  // Get a specific message
  async getMessage(messageId: string, format: 'minimal' | 'full' | 'raw' | 'metadata' = 'full'): Promise<GmailMessage> {
    return this.makeApiCall(`/users/me/messages/${messageId}?format=${format}`);
  }

  // Get multiple messages in batch
  async getMessages(messageIds: string[]): Promise<GmailMessage[]> {
    const messages = await Promise.all(
      messageIds.map(id => this.getMessage(id))
    );
    return messages;
  }

  // Get thread
  async getThread(threadId: string): Promise<GmailThread> {
    return this.makeApiCall(`/users/me/threads/${threadId}`);
  }

  // List labels
  async listLabels(): Promise<{
    labels: Array<{
      id: string;
      name: string;
      type: string;
      messagesTotal?: number;
      messagesUnread?: number;
    }>;
  }> {
    return this.makeApiCall('/users/me/labels');
  }

  // Send email
  async sendEmail(message: {
    to: string;
    subject: string;
    body: string;
    cc?: string;
    bcc?: string;
  }): Promise<GmailMessage> {
    const email = this.createEmailMessage(message);
    const encodedMessage = btoa(email).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    
    return this.makeApiCall('/users/me/messages/send', {
      method: 'POST',
      body: JSON.stringify({ raw: encodedMessage }),
    });
  }

  // Helper: Create email message string
  private createEmailMessage(message: {
    to: string;
    subject: string;
    body: string;
    cc?: string;
    bcc?: string;
  }): string {
    const lines = [
      `To: ${message.to}`,
      `Subject: ${message.subject}`,
    ];

    if (message.cc) lines.push(`Cc: ${message.cc}`);
    if (message.bcc) lines.push(`Bcc: ${message.bcc}`);
    
    lines.push('Content-Type: text/html; charset=utf-8');
    lines.push('');
    lines.push(message.body);

    return lines.join('\r\n');
  }

  // Helper: Decode base64 email body
  static decodeEmailBody(data: string): string {
    try {
      return atob(data.replace(/-/g, '+').replace(/_/g, '/'));
    } catch (error) {
      console.error('Failed to decode email body:', error);
      return '';
    }
  }

  // Helper: Extract header value
  static getHeaderValue(headers: Array<{ name: string; value: string }>, headerName: string): string {
    const header = headers.find(h => h.name.toLowerCase() === headerName.toLowerCase());
    return header?.value || '';
  }

  // Helper: Convert Gmail message to EmailSummary
  static messageToSummary(message: GmailMessage): EmailSummary {
    const headers = message.payload.headers;
    
    return {
      id: message.id,
      subject: this.getHeaderValue(headers, 'Subject'),
      from: this.getHeaderValue(headers, 'From'),
      to: this.getHeaderValue(headers, 'To'),
      date: new Date(parseInt(message.internalDate)),
      snippet: message.snippet,
      isUnread: true, // Would need to check labels for UNREAD
      labels: [], // Would need to map labelIds to label names
      priority: 'normal', // Will be determined by AI analysis
      category: 'standard', // Will be determined by AI analysis
      bodyPreview: message.snippet,
    };
  }
}

// React hook for Gmail API
export const useGmailApi = () => {
  const { isGmailAuthenticated, getGmailAccessToken } = useGoogleGmailAuth();
  const [gmailService, setGmailService] = useState<GmailApiService | null>(null);

  useEffect(() => {
    const initializeGmailService = async () => {
      if (isGmailAuthenticated) {
        const token = await getGmailAccessToken();
        if (token) {
          setGmailService(new GmailApiService(token));
        }
      } else {
        setGmailService(null);
      }
    };

    initializeGmailService();
  }, [isGmailAuthenticated, getGmailAccessToken]);

  return {
    gmailService,
    isGmailReady: isGmailAuthenticated && !!gmailService,
  };
};