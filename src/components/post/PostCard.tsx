import { useState } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { useAuthStore } from '../../stores/authStore';
import { formatDistanceToNow } from '../../utils/formatDate';

interface Post {
  id: string;
  caption?: string;
  type: string;
  author: { id: string; nickname: string; avatarUrl?: string };
  media: { id: string; url: string; type: string; thumbnailUrl?: string }[];
  _count: { likes: number; comments: number };
  likedByMe: boolean;
  createdAt: string;
  tags: string[];
}

export function PostCard({ post }: { post: Post }) {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  const likeMutation = useMutation({
    mutationFn: () => apiClient.post(`/posts/${post.id}/like`),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['feed'] });
      // Optimistic update
      queryClient.setQueriesData({ queryKey: ['feed'] }, (old: unknown) => {
        const data = old as { pages?: { posts?: Post[] }[] } | undefined;
        if (!data?.pages) return old;
        return {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            posts: page.posts?.map((p) =>
              p.id === post.id
                ? {
                    ...p,
                    likedByMe: !p.likedByMe,
                    _count: { ...p._count, likes: p.likedByMe ? p._count.likes - 1 : p._count.likes + 1 },
                  }
                : p
            ),
          })),
        };
      });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['feed'] }),
  });

  const handleLike = () => {
    if (!isAuthenticated) return;
    likeMutation.mutate();
  };

  const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';
  const currentMedia = post.media[currentMediaIndex];

  return (
    <article className="bg-white dark:bg-gray-900 sm:rounded-2xl sm:border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <Link to={`/profile/${post.author.nickname}`} className="flex items-center gap-3">
          {post.author.avatarUrl ? (
            <img
              src={`${baseUrl}${post.author.avatarUrl}`}
              alt={post.author.nickname}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-pink-400 ring-offset-1"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
              {post.author.nickname[0].toUpperCase()}
            </div>
          )}
          <span className="font-semibold text-sm">{post.author.nickname}</span>
        </Link>
        <button className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Media */}
      {currentMedia && (
        <div className="relative aspect-square bg-black">
          {currentMedia.type === 'IMAGE' ? (
            <img
              src={`${baseUrl}${currentMedia.url}`}
              alt="게시물"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <video
              src={`${baseUrl}${currentMedia.url}`}
              className="w-full h-full object-cover"
              controls
              loop
              playsInline
            />
          )}

          {/* Multi-media dots */}
          {post.media.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
              {post.media.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentMediaIndex(i)}
                  className={`w-1.5 h-1.5 rounded-full transition ${
                    i === currentMediaIndex ? 'bg-white scale-125' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Arrow navigation */}
          {currentMediaIndex < post.media.length - 1 && (
            <button
              onClick={() => setCurrentMediaIndex((i) => i + 1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 hover:bg-white transition"
            >
              <span className="text-sm">›</span>
            </button>
          )}
          {currentMediaIndex > 0 && (
            <button
              onClick={() => setCurrentMediaIndex((i) => i - 1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 hover:bg-white transition"
            >
              <span className="text-sm">‹</span>
            </button>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`transition-transform hover:scale-110 ${post.likedByMe ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}
              aria-label={post.likedByMe ? '좋아요 취소' : '좋아요'}
            >
              <Heart className={`w-6 h-6 ${post.likedByMe ? 'fill-current' : ''}`} />
            </button>
            <Link to={`/post/${post.id}`}>
              <MessageCircle className="w-6 h-6 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition" />
            </Link>
            <button>
              <Send className="w-6 h-6 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition" />
            </button>
          </div>
          <button>
            <Bookmark className="w-6 h-6 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition" />
          </button>
        </div>

        {/* Like count */}
        <p className="font-semibold text-sm mb-1">
          {post._count.likes.toLocaleString()}명이 좋아합니다
        </p>

        {/* Caption */}
        {post.caption && (
          <p className="text-sm">
            <Link to={`/profile/${post.author.nickname}`} className="font-semibold mr-2">
              {post.author.nickname}
            </Link>
            {post.caption}
          </p>
        )}

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                to={`/explore?q=${tag}&type=tags`}
                className="text-blue-500 text-sm hover:underline"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Comment preview */}
        {post._count.comments > 0 && (
          <Link to={`/post/${post.id}`} className="text-gray-500 dark:text-gray-400 text-sm mt-1 block">
            댓글 {post._count.comments}개 모두 보기
          </Link>
        )}

        {/* Timestamp */}
        <p className="text-gray-400 text-xs mt-1 uppercase">
          {formatDistanceToNow(post.createdAt)}
        </p>
      </div>
    </article>
  );
}
