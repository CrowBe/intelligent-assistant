import { useState, useEffect } from 'react';
import { useGmailApi } from '../../services/gmailApi';
import { useGoogleGmailAuth } from '../../services/googleAuth';
import { EmailAnalysisService } from '../../services/emailAnalysis';
import type { EmailSummary, GmailMessage } from '../../services/gmailApi';
import type { EmailAnalysis } from '../../services/emailAnalysis';

const GmailTest: React.FC = () => {
  const { gmailService, isGmailReady } = useGmailApi();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [emails, setEmails] = useState<Array<EmailSummary & { analysis: EmailAnalysis }>>([]);

  // Test Gmail profile
  const testProfile = async () => {
    if (!gmailService) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const profileData = await gmailService.getProfile();
      setProfile(profileData);
      console.log('Gmail profile:', profileData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get Gmail profile';
      setError(errorMessage);
      console.error('Gmail profile error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Test fetching recent emails
  const testFetchEmails = async () => {
    if (!gmailService) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Get list of recent messages
      const messageList = await gmailService.listMessages({
        maxResults: 10,
        q: 'is:unread OR (in:inbox newer_than:7d)', // Unread or recent inbox messages
      });
      
      console.log('Message list:', messageList);
      
      if (messageList.messages && messageList.messages.length > 0) {
        // Get detailed message data
        const messageIds = messageList.messages.map(m => m.id).slice(0, 5); // Limit to 5 for testing
        const detailedMessages = await gmailService.getMessages(messageIds);
        
        // Convert to EmailSummary format
        const emailSummaries = detailedMessages.map(msg => 
          gmailService.constructor.messageToSummary(msg)
        );
        
        // Analyze emails
        const analyzedEmails = EmailAnalysisService.analyzeEmails(emailSummaries);
        const sortedEmails = EmailAnalysisService.sortEmailsByPriority(analyzedEmails);
        
        setEmails(sortedEmails);
        console.log('Analyzed emails:', sortedEmails);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch emails';
      setError(errorMessage);
      console.error('Gmail fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Test sending an email
  const testSendEmail = async () => {
    if (!gmailService || !profile) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const testMessage = {
        to: profile.emailAddress, // Send to self for testing
        subject: 'Test Email from Intelligent Assistant',
        body: `
          <p>This is a test email sent from the Intelligent Assistant app.</p>
          <p>Time: ${new Date().toLocaleString()}</p>
          <p>This email was sent to test the Gmail API integration.</p>
        `
      };
      
      const result = await gmailService.sendEmail(testMessage);
      console.log('Email sent:', result);
      alert('Test email sent successfully! Check your inbox.');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send email';
      setError(errorMessage);
      console.error('Gmail send error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'normal': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'low': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'standard': return 'bg-green-100 text-green-800';
      case 'follow-up': return 'bg-yellow-100 text-yellow-800';
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'spam': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isGmailReady) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Gmail Integration Test</h2>
        <div className="text-center p-8 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-yellow-800">
            Gmail API not ready. Please make sure you're authenticated and have the required permissions.
          </p>
          <p className="text-sm text-yellow-600 mt-2">
            Note: This requires Gmail API permissions to be configured in your authentication provider.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Gmail Integration Test</h2>
      
      {/* Controls */}
      <div className="mb-6 flex gap-4 justify-center flex-wrap">
        <button
          onClick={testProfile}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? '⏳' : '👤'} Test Profile
        </button>
        
        <button
          onClick={testFetchEmails}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
        >
          {loading ? '⏳' : '📧'} Fetch & Analyze Emails
        </button>
        
        <button
          onClick={testSendEmail}
          disabled={loading || !profile}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-400"
        >
          {loading ? '⏳' : '✉️'} Send Test Email
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-red-800 font-semibold">Error:</p>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Profile Display */}
      {profile && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
          <h3 className="font-semibold text-green-800 mb-2">Gmail Profile</h3>
          <div className="text-sm text-green-700">
            <p><strong>Email:</strong> {profile.emailAddress}</p>
            <p><strong>Messages Total:</strong> {profile.messagesTotal?.toLocaleString()}</p>
            <p><strong>Threads Total:</strong> {profile.threadsTotal?.toLocaleString()}</p>
            <p><strong>History ID:</strong> {profile.historyId}</p>
          </div>
        </div>
      )}

      {/* Emails Display */}
      {emails.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold mb-4">Recent Emails (Analyzed & Prioritized)</h3>
          
          {emails.map((email, index) => (
            <div key={email.id} className={`p-4 border rounded-lg ${getPriorityColor(email.analysis.priority)}`}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-lg">{email.subject || '(No Subject)'}</h4>
                  <p className="text-sm opacity-75">From: {email.from}</p>
                  <p className="text-sm opacity-75">Date: {email.date.toLocaleString()}</p>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(email.analysis.category)}`}>
                    {email.analysis.category.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(email.analysis.priority)}`}>
                    {email.analysis.priority.toUpperCase()}
                  </span>
                </div>
              </div>
              
              <p className="text-sm mb-3 opacity-90">{email.snippet}</p>
              
              {/* Analysis Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="font-medium">Urgency:</span> {email.analysis.urgencyScore}/100
                </div>
                <div>
                  <span className="font-medium">Business:</span> {email.analysis.businessRelevance}/100
                </div>
                <div>
                  <span className="font-medium">Read Time:</span> {email.analysis.estimatedReadTime}min
                </div>
                <div>
                  <span className="font-medium">Action:</span> {email.analysis.actionRequired ? 'Required' : 'None'}
                </div>
              </div>
              
              {/* Keywords */}
              {email.analysis.keywords.length > 0 && (
                <div className="mt-2">
                  <span className="text-xs font-medium">Keywords: </span>
                  {email.analysis.keywords.slice(0, 5).map((keyword, i) => (
                    <span key={i} className="inline-block bg-gray-200 rounded px-2 py-1 text-xs mr-1 mb-1">
                      {keyword}
                    </span>
                  ))}
                </div>
              )}
              
              {/* Suggested Actions */}
              {email.analysis.suggestedActions.length > 0 && (
                <div className="mt-2">
                  <span className="text-xs font-medium">Suggested Actions: </span>
                  <ul className="text-xs list-disc list-inside">
                    {email.analysis.suggestedActions.map((action, i) => (
                      <li key={i}>{action}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="mt-2 text-xs opacity-75">
                <span className="font-medium">Analysis:</span> {email.analysis.reasoning}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Instructions */}
      <div className="mt-8 text-xs text-gray-500 bg-gray-50 p-4 rounded">
        <p><strong>Instructions:</strong></p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Click "Test Profile" to verify Gmail API access</li>
          <li>Click "Fetch & Analyze Emails" to get recent emails and see AI analysis</li>
          <li>Click "Send Test Email" to test sending functionality</li>
          <li>Check browser console for detailed API responses</li>
        </ol>
        <p className="mt-2 text-blue-600">
          ℹ️ This demonstrates Phase 1B email intelligence: fetching, analyzing, and prioritizing emails.
        </p>
      </div>
    </div>
  );
};

export default GmailTest;