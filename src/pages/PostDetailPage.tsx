import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { apiClient } from '../api/client';
import { PostCard } from '../components/post/PostCard';
import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { formatDistanceToNow } from '../utils/formatDate';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    nickname: string;
    avatarUrl?: string;
  };
}

export function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuthStore();
  const [commentText, setCommentText] = useState('');

  const { data: post, isLoading: postLoading } = useQuery({
    queryKey: ['post', id],
    queryFn: async () => {
      const res = await apiClient.get(`/posts/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  const { data: comments, isLoading: commentsLoading, refetch: refetchComments } = useQuery<Comment[]>({
    queryKey: ['comments', id],
    queryFn: async () => {
      const res = await apiClient.get(`/posts/${id}/comments`);
      return res.data;
    },
    enabled: !!id,
  });

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !isAuthenticated) return;
    try {
      await apiClient.post(`/posts/${id}/comments`, { content: commentText.trim() });
      setCommentText('');
      refetchComments();
    } catch (err) {
      console.error(err);
    }
  };

  const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

  if (postLoading) return <div className="p-8 text-center">Loading...</div>;
  if (!post) return <div className="p-8 text-center">게시물을 찾을 수 없습니다.</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 flex flex-col md:flex-row gap-6 pt-8">
      {/* Left: The Post itself */}
      <div className="flex-1 max-w-xl mx-auto md:mx-0">
        <PostCard post={post} />
      </div>

      {/* Right: Comments Section */}
      <div className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl flex flex-col max-h-[80vh]">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 font-semibold">
          댓글
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {commentsLoading ? (
            <div className="text-center text-sm text-gray-500">댓글 불러오는 중...</div>
          ) : comments?.length === 0 ? (
            <div className="text-center text-sm text-gray-500 my-8">아직 댓글이 없습니다.<br/>가장 먼저 댓글을 남겨보세요!</div>
          ) : (
            comments?.map(comment => (
              <div key={comment.id} className="flex gap-3">
                {comment.author.avatarUrl ? (
                  <img
                    src={`${baseUrl}${comment.author.avatarUrl}`}
                    className="w-8 h-8 rounded-full object-cover"
                    alt={comment.author.nickname}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                    {comment.author.nickname[0].toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl px-4 py-2 inline-block">
                    <span className="font-semibold text-sm mr-2">{comment.author.nickname}</span>
                    <span className="text-sm">{comment.content}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1 ml-2">
                    {formatDistanceToNow(comment.createdAt)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Comment Form */}
        {isAuthenticated ? (
          <form onSubmit={handleSubmitComment} className="p-4 border-t border-gray-200 dark:border-gray-800 flex items-center gap-3">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="댓글 달기..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm p-0"
            />
            <button 
              type="submit" 
              disabled={!commentText.trim()}
              className="text-pink-500 font-semibold text-sm disabled:opacity-50"
            >
              게시
            </button>
          </form>
        ) : (
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-500">
            댓글을 남기려면 로그인해주세요.
          </div>
        )}
      </div>
    </div>
  );
}
