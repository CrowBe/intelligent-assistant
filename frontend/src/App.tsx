import { useState } from 'react';
import { ChatProvider } from './contexts/ChatContext';
import { ChatInterface } from './components/chat/ChatInterface';
import SetupVerification from './components/setup/SetupVerification';
import { Toaster } from 'react-hot-toast';

function App() {
  const [currentView, setCurrentView] = useState<'setup' | 'chat'>('setup');

  return (
    <ChatProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <div className="p-4 bg-white shadow-sm">
          <div className="flex gap-2 justify-center flex-wrap">
            <button 
              onClick={() => setCurrentView('setup')}
              className={`px-4 py-2 rounded ${currentView === 'setup' ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              ⚙️ Development Setup
            </button>
            <button 
              onClick={() => setCurrentView('chat')}
              className={`px-4 py-2 rounded ${currentView === 'chat' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              💬 Intelligent Assistant
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-8">
          {currentView === 'setup' && <SetupVerification />}
          {currentView === 'chat' && <ChatInterface />}
        </div>
        
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </div>
    </ChatProvider>
  );
}

export default App;