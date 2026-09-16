import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Send, ArrowLeft } from 'lucide-react';
import { apiClient } from '../api/client';
import { useAuthStore } from '../stores/authStore';
import { getSocket } from '../api/socket';
import { formatDistanceToNow } from '../utils/formatDate';
import { cn } from '../utils/cn';

interface Conversation {
  id: string; // Other user's ID
  nickname: string;
  avatarUrl: string | null;
  lastMessage: string;
  updatedAt: string;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
}

export function MessagesPage() {
  const { userId: activeUserId } = useParams<{ userId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

  // Fetch conversation list
  const { data: conversations, isLoading: convLoading } = useQuery<Conversation[]>({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await apiClient.get('/messages');
      return res.data;
    },
  });

  // Fetch active chat history
  const { data: history, isLoading: historyLoading } = useQuery<Message[]>({
    queryKey: ['messages', activeUserId],
    queryFn: async () => {
      const res = await apiClient.get(`/messages/${activeUserId}`);
      return res.data;
    },
    enabled: !!activeUserId,
  });

  // Set initial history
  useEffect(() => {
    if (history) setMessages(history);
  }, [history]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Socket setup
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = (msg: Message) => {
      // Only append if it belongs to the current open chat
      if (
        (msg.senderId === activeUserId && msg.receiverId === user?.id) ||
        (msg.senderId === user?.id && msg.receiverId === activeUserId)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on('receive_message', handleNewMessage);
    return () => {
      socket.off('receive_message', handleNewMessage);
    };
  }, [activeUserId, user?.id]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeUserId) return;

    try {
      // Send via REST API, the server emits via Socket.IO
      await apiClient.post(`/messages/${activeUserId}`, { content: inputText.trim() });
      setInputText('');
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  const activeUser = conversations?.find((c) => c.id === activeUserId);

  return (
    <div className="flex h-[calc(100vh-4rem)] md:h-screen bg-white dark:bg-black w-full overflow-hidden">
      
      {/* Sidebar: Conversation List */}
      <div 
        className={cn(
          "w-full md:w-80 lg:w-96 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all",
          activeUserId ? "hidden md:flex" : "flex"
        )}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 font-bold text-xl flex items-center justify-between">
          <h2 className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">Messages</h2>
        </div>
        <div className="overflow-y-auto flex-1">
          {convLoading ? (
            <div className="p-4 text-center text-gray-500 text-sm">로딩 중...</div>
          ) : conversations?.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">대화 내역이 없습니다.</div>
          ) : (
            conversations?.map((conv) => (
              <Link
                key={conv.id}
                to={`/messages/${conv.id}`}
                className={cn(
                  "flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition cursor-pointer",
                  activeUserId === conv.id && "bg-gray-50 dark:bg-gray-900"
                )}
              >
                {conv.avatarUrl ? (
                  <img src={`${baseUrl}${conv.avatarUrl}`} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-400 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                    {conv.nickname[0].toUpperCase()}
                  </div>
                )}
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-semibold text-sm">{conv.nickname}</span>
                    <span className="text-xs text-gray-400">{formatDistanceToNow(conv.updatedAt)}</span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Main: Chat Room */}
      <div 
        className={cn(
          "flex-1 flex flex-col bg-white dark:bg-black h-full relative",
          !activeUserId ? "hidden md:flex" : "flex"
        )}
      >
        {activeUserId ? (
          <>
            {/* Chat Header */}
            <div className="h-16 border-b border-gray-200 dark:border-gray-800 flex items-center px-4 gap-3 flex-shrink-0 z-10 bg-white dark:bg-black">
              <button 
                onClick={() => navigate('/messages')}
                className="md:hidden p-2 -ml-2 text-gray-500 hover:text-gray-900 dark:hover:text-white"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              
              {activeUser?.avatarUrl ? (
                <img src={`${baseUrl}${activeUser.avatarUrl}`} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center font-bold text-xs">
                  {activeUser?.nickname?.[0]?.toUpperCase()}
                </div>
              )}
              <span className="font-semibold">{activeUser?.nickname}</span>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {historyLoading ? (
                <div className="text-center text-gray-500 py-4">불러오는 중...</div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.senderId === user?.id;
                  return (
                    <div key={msg.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                      <div
                        className={cn(
                          "max-w-[70%] rounded-2xl px-4 py-2 text-sm",
                          isMine 
                            ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-br-sm" 
                            : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm"
                        )}
                      >
                        {msg.content}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-4 border-t border-gray-200 dark:border-gray-800 flex items-center gap-2 bg-white dark:bg-black">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="메시지 입력..."
                className="flex-1 bg-gray-100 dark:bg-gray-900 border-none rounded-full px-5 py-2.5 text-sm focus:ring-0 focus:outline-none"
              />
              <button 
                type="submit" 
                disabled={!inputText.trim()}
                className="p-2.5 bg-pink-500 text-white rounded-full hover:bg-pink-600 disabled:opacity-50 transition"
              >
                <Send className="w-5 h-5 -ml-0.5" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-24 h-24 border-2 border-gray-300 dark:border-gray-700 rounded-full flex items-center justify-center mb-4">
              <Send className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">내 메시지</h3>
            <p className="text-gray-500 text-sm">친구나 그룹에 비공개 사진과 메시지를 보내보세요.</p>
          </div>
        )}
      </div>
    </div>
  );
}
