import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, User, MessageCircle, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import { formatDistanceToNow } from '../utils/formatDate';

interface Notification {
  id: string;
  type: 'LIKE' | 'COMMENT' | 'FOLLOW' | 'SYSTEM';
  content: string;
  isRead: boolean;
  createdAt: string;
  actor?: {
    nickname: string;
    avatarUrl?: string;
  };
  post?: {
    id: string;
    media: { url: string }[];
  };
}

export function NotificationsPage() {
  const queryClient = useQueryClient();
  const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

  const { data: notifications, isLoading } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await apiClient.get('/notifications');
      return res.data;
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => apiClient.patch('/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'LIKE': return <Heart className="w-5 h-5 text-red-500 fill-current" />;
      case 'COMMENT': return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'FOLLOW': return <User className="w-5 h-5 text-pink-500" />;
      default: return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">알림</h1>
        <button 
          onClick={() => markAllReadMutation.mutate()}
          className="text-sm font-semibold text-blue-500 hover:text-blue-600"
        >
          모두 읽음 처리
        </button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center text-gray-500">불러오는 중...</div>
        ) : notifications?.length === 0 ? (
          <div className="text-center text-gray-500 py-12">새로운 알림이 없습니다.</div>
        ) : (
          notifications?.map((notif) => (
            <div 
              key={notif.id} 
              className={`flex items-center gap-4 p-4 rounded-xl transition ${
                notif.isRead ? 'bg-transparent' : 'bg-pink-50 dark:bg-pink-900/10'
              }`}
            >
              {/* Icon / Avatar */}
              <div className="relative flex-shrink-0">
                {notif.actor?.avatarUrl ? (
                  <img src={`${baseUrl}${notif.actor.avatarUrl}`} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center font-bold text-gray-500">
                    {notif.actor?.nickname[0].toUpperCase() ?? '?'}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 bg-white dark:bg-black rounded-full p-0.5">
                  {getIcon(notif.type)}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 text-sm">
                <Link to={notif.type === 'FOLLOW' ? `/profile/${notif.actor?.nickname}` : `/post/${notif.post?.id}`}>
                  <span className="font-semibold">{notif.actor?.nickname}</span>
                  <span className="text-gray-600 dark:text-gray-300"> {notif.content}</span>
                </Link>
                <div className="text-xs text-gray-400 mt-0.5">
                  {formatDistanceToNow(notif.createdAt)}
                </div>
              </div>

              {/* Action/Target Preview */}
              {notif.post?.media?.[0] && (
                <Link to={`/post/${notif.post.id}`} className="flex-shrink-0">
                  <img src={`${baseUrl}${notif.post.media[0].url}`} className="w-12 h-12 object-cover rounded-md" />
                </Link>
              )}
              {notif.type === 'FOLLOW' && (
                <Link 
                  to={`/profile/${notif.actor?.nickname}`}
                  className="px-4 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                  프로필
                </Link>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
