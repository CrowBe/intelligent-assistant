import { useState } from 'react';
import { useHybridAuth } from '../../services/hybridAuth';
import { GmailApiService } from '../../services/gmailApi';
import { EmailAnalysisService } from '../../services/emailAnalysis';
import type { EmailSummary } from '../../services/gmailApi';
import type { EmailAnalysis } from '../../services/emailAnalysis';

const HybridAuthTest: React.FC = () => {
  const {
    isKindeAuthenticated,
    kindeUser,
    gmailAuth,
    isGmailConnected,
    isFullyAuthenticated,
    accountsMatch,
    connectGmail,
    disconnectGmail,
    refreshGmailToken,
    isLoading,
    error
  } = useHybridAuth();

  const [testResults, setTestResults] = useState<any>(null);
  const [emails, setEmails] = useState<Array<EmailSummary & { analysis: EmailAnalysis }>>([]);

  // Test Gmail API access
  const testGmailAccess = async () => {
    if (!isGmailConnected || !gmailAuth.accessToken) return;

    try {
      const gmailService = new GmailApiService(gmailAuth.accessToken);
      
      // Test profile access
      const profile = await gmailService.getProfile();
      
      // Test fetching recent emails
      const messageList = await gmailService.listMessages({
        maxResults: 5,
        q: 'in:inbox newer_than:7d'
      });

      if (messageList.messages && messageList.messages.length > 0) {
        const messageIds = messageList.messages.map(m => m.id);
        const detailedMessages = await gmailService.getMessages(messageIds);
        
        const emailSummaries = detailedMessages.map(msg => 
          GmailApiService.messageToSummary(msg)
        );
        
        const analyzedEmails = EmailAnalysisService.analyzeEmails(emailSummaries);
        const sortedEmails = EmailAnalysisService.sortEmailsByPriority(analyzedEmails);
        
        setEmails(sortedEmails);
      }

      setTestResults({
        profile,
        messageCount: messageList.messages?.length || 0,
        success: true
      });

    } catch (err) {
      setTestResults({
        error: err instanceof Error ? err.message : 'Gmail API test failed',
        success: false
      });
    }
  };

  const getStatusColor = (status: boolean) => status ? 'text-green-600' : 'text-red-600';
  const getStatusIcon = (status: boolean) => status ? '✅' : '❌';

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Hybrid Authentication Test</h2>
      <p className="text-center text-gray-600 mb-8">
        Kinde for app auth + Google OAuth for Gmail API access
      </p>

      {/* Authentication Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Kinde Auth Status */}
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            {getStatusIcon(isKindeAuthenticated)} Kinde Authentication
          </h3>
          
          {isKindeAuthenticated && kindeUser ? (
            <div className="space-y-2 text-sm">
              <p><strong>Name:</strong> {kindeUser.fullName}</p>
              <p><strong>Email:</strong> {kindeUser.email}</p>
              <p><strong>ID:</strong> {kindeUser.id}</p>
              <div className={`font-medium ${getStatusColor(true)}`}>
                ✅ Authenticated with Kinde
              </div>
            </div>
          ) : (
            <div className={`text-sm ${getStatusColor(false)}`}>
              ❌ Not authenticated with Kinde
            </div>
          )}
        </div>

        {/* Gmail Auth Status */}
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            {getStatusIcon(isGmailConnected)} Gmail API Access
          </h3>
          
          {isGmailConnected ? (
            <div className="space-y-2 text-sm">
              <p><strong>Gmail:</strong> {gmailAuth.userEmail}</p>
              <p><strong>Token:</strong> {gmailAuth.accessToken?.substring(0, 20)}...</p>
              <p><strong>Expires:</strong> {gmailAuth.expiresAt ? new Date(gmailAuth.expiresAt).toLocaleString() : 'Unknown'}</p>
              <div className={`font-medium ${getStatusColor(accountsMatch)}`}>
                {accountsMatch ? '✅ Account matches Kinde' : '⚠️ Different Gmail account'}
              </div>
            </div>
          ) : (
            <div className={`text-sm ${getStatusColor(false)}`}>
              ❌ Gmail API not connected
            </div>
          )}
        </div>
      </div>

      {/* Overall Status */}
      <div className={`p-4 rounded-lg mb-6 ${isFullyAuthenticated ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
        <div className={`font-semibold ${isFullyAuthenticated ? 'text-green-800' : 'text-yellow-800'}`}>
          {isFullyAuthenticated ? (
            <>✅ Fully Authenticated - Ready for Email Intelligence</>
          ) : (
            <>⚠️ Additional Setup Required</>
          )}
        </div>
        
        {!isKindeAuthenticated && (
          <p className="text-sm text-yellow-700 mt-1">
            Please go to the "🔐 App Auth" tab to sign in with Kinde first.
          </p>
        )}
        
        {isKindeAuthenticated && !isGmailConnected && (
          <p className="text-sm text-yellow-700 mt-1">
            Click "Connect Gmail" below to enable email features.
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center mb-6">
        {isKindeAuthenticated && !isGmailConnected && (
          <button
            onClick={connectGmail}
            disabled={isLoading}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 flex items-center gap-2"
          >
            {isLoading ? '⏳' : '📧'} Connect Gmail
          </button>
        )}
        
        {isGmailConnected && (
          <>
            <button
              onClick={testGmailAccess}
              disabled={isLoading}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
            >
              {isLoading ? '⏳' : '🔬'} Test Gmail API
            </button>
            
            <button
              onClick={disconnectGmail}
              disabled={isLoading}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400"
            >
              {isLoading ? '⏳' : '🔌'} Disconnect Gmail
            </button>
          </>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-red-800 font-semibold">Error:</p>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Test Results */}
      {testResults && (
        <div className="mb-6 p-4 bg-gray-50 border rounded">
          <h3 className="font-semibold mb-2">Gmail API Test Results:</h3>
          {testResults.success ? (
            <div className="text-sm space-y-1">
              <p className="text-green-600">✅ Gmail API access successful</p>
              <p><strong>Profile Email:</strong> {testResults.profile?.emailAddress}</p>
              <p><strong>Total Messages:</strong> {testResults.profile?.messagesTotal?.toLocaleString()}</p>
              <p><strong>Recent Messages Found:</strong> {testResults.messageCount}</p>
            </div>
          ) : (
            <div className="text-sm text-red-600">
              ❌ {testResults.error}
            </div>
          )}
        </div>
      )}

      {/* Analyzed Emails */}
      {emails.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Recent Emails (AI Analysis)</h3>
          {emails.slice(0, 3).map((email, index) => (
            <div key={email.id} className="p-4 border rounded-lg bg-gray-50">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold">{email.subject || '(No Subject)'}</h4>
                  <p className="text-sm text-gray-600">From: {email.from}</p>
                </div>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    email.analysis.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                    email.analysis.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {email.analysis.priority.toUpperCase()}
                  </span>
                  <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                    {email.analysis.category.toUpperCase()}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-700">{email.snippet}</p>
              <div className="text-xs text-gray-500 mt-2">
                Urgency: {email.analysis.urgencyScore}/100 | 
                Business: {email.analysis.businessRelevance}/100 |
                Action: {email.analysis.actionRequired ? 'Required' : 'None'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* User Experience Explanation */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="font-semibold text-blue-800 mb-2">🎯 User Experience Flow</h3>
        <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
          <li><strong>Single Kinde Login:</strong> User signs in once with their Google account via Kinde</li>
          <li><strong>One-Click Gmail:</strong> When accessing email features, user clicks "Connect Gmail"</li>
          <li><strong>Same Account:</strong> Google recognizes the user is already signed in (no second login!)</li>
          <li><strong>Permission Consent:</strong> User sees one permission screen for Gmail API access</li>
          <li><strong>Seamless Access:</strong> All email features work automatically from then on</li>
        </ol>
        <p className="text-sm text-blue-600 mt-2">
          ✨ <strong>Result:</strong> Feels like single sign-on with proper API permissions!
        </p>
      </div>
    </div>
  );
};

export default HybridAuthTest;