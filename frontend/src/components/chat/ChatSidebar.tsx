import React from 'react';
import { useAppAuth } from '../../contexts/KindeAuthContext';
import { useChat } from '../../contexts/ChatContext';
import { 
  PlusIcon, 
  ChatBubbleLeftIcon, 
  Cog6ToothIcon, 
  ArrowRightOnRectangleIcon,
  TrashIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

interface ChatSidebarProps {
  onClose: () => void;
}

export function ChatSidebar({ onClose }: ChatSidebarProps) {
  const { user, logout } = useAppAuth();
  const { sessions, currentSession, createSession, switchSession, deleteSession } = useChat();

  const handleNewChat = async () => {
    await createSession();
    onClose();
  };

  const handleSwitchSession = async (sessionId: string) => {
    await switchSession(sessionId);
    onClose();
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length <= 1) return; // Don't delete the last session
    
    if (confirm('Are you sure you want to delete this chat?')) {
      await deleteSession(sessionId);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Chats</h2>
          <button
            onClick={handleNewChat}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="New Chat"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        </div>
        
        <button
          onClick={handleNewChat}
          className="w-full btn-primary flex items-center justify-center gap-2"
        >
          <PlusIcon className="w-4 h-4" />
          New Chat
        </button>
      </div>

      {/* Chat sessions */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="p-2">
          {sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => handleSwitchSession(session.id)}
              className={`
                group relative p-3 rounded-lg cursor-pointer transition-colors mb-1
                ${currentSession?.id === session.id 
                  ? 'bg-blue-50 border border-blue-200' 
                  : 'hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <ChatBubbleLeftIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                
                <div className="flex-1 min-w-0">
                  <h3 className={`text-sm font-medium truncate ${
                    currentSession?.id === session.id ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    {session.title}
                  </h3>
                  
                  {session.lastMessage && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {session.lastMessage}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(session.lastActivity, { addSuffix: true })}
                    </span>
                    <span className="text-xs text-gray-400">
                      {session.messageCount} messages
                    </span>
                  </div>
                </div>

                {/* Session actions */}
                {sessions.length > 1 && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleDeleteSession(session.id, e)}
                      className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                      title="Delete chat"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User section */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-white">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.businessName || user?.email}
            </p>
          </div>
        </div>

        <div className="space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Cog6ToothIcon className="w-4 h-4" />
            Settings
          </button>
          
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}