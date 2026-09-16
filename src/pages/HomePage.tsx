import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { apiClient } from '../api/client';
import { PostCard } from '../components/post/PostCard';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

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

interface FeedPage {
  posts: Post[];
  nextCursor: string | null;
}

async function fetchFeed({ pageParam }: { pageParam?: string }) {
  const params = new URLSearchParams({ limit: '12', type: 'FEED' });
  if (pageParam) params.set('cursor', pageParam);
  const { data } = await apiClient.get<FeedPage>(`/posts?${params}`);
  return data;
}

export function HomePage() {
  const { isAuthenticated } = useAuthStore();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ['feed', 'FEED'],
      queryFn: fetchFeed,
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    });

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const posts = data?.pages.flatMap((p) => p.posts) ?? [];

  return (
    <div className="max-w-xl mx-auto px-0 sm:px-4 pt-4">
      {/* Stories placeholder */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-4 sm:px-0 mb-4">
        {isAuthenticated && (
          <Link to="/post/write" className="flex flex-col items-center gap-1 shrink-0">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
              <span className="text-2xl text-gray-400">+</span>
            </div>
            <span className="text-xs text-gray-500">내 스토리</span>
          </Link>
        )}
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden animate-pulse">
              <div className="flex items-center gap-3 p-4">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
              </div>
              <div className="aspect-square bg-gray-200 dark:bg-gray-700" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-48" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post feed */}
      <div className="space-y-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {/* Infinite scroll trigger */}
      <div ref={loadMoreRef} className="h-16 flex items-center justify-center">
        {isFetchingNextPage && (
          <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
        )}
        {!hasNextPage && posts.length > 0 && (
          <p className="text-gray-400 text-sm">모든 게시물을 확인했습니다. 👋</p>
        )}
      </div>
    </div>
  );
}
