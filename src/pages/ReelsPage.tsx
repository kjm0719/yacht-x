import { useInfiniteQuery } from '@tanstack/react-query';
import { useRef, useEffect, useCallback } from 'react';
import { apiClient } from '../api/client';
import { ReelCard } from '../components/reel/ReelCard';

interface ReelPost {
  id: string;
  caption?: string;
  author: { id: string; nickname: string; avatarUrl?: string };
  media: { id: string; url: string; type: string }[];
  _count: { likes: number; comments: number };
  likedByMe: boolean;
  tags: string[];
}

interface ReelPage {
  posts: ReelPost[];
  nextCursor: string | null;
}

async function fetchReels({ pageParam }: { pageParam?: string }) {
  const params = new URLSearchParams({ limit: '5', type: 'REEL' });
  if (pageParam) params.set('cursor', pageParam);
  const { data } = await apiClient.get<ReelPage>(`/posts?${params}`);
  return data;
}

export function ReelsPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ['feed', 'REEL'],
      queryFn: fetchReels,
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    });

  // Load more when reaching the end
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '100px', threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const reels = data?.pages.flatMap((p) => p.posts) ?? [];

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black text-white gap-4">
        <div className="text-6xl">🎬</div>
        <p className="text-xl font-semibold">아직 릴스가 없습니다</p>
        <p className="text-gray-400 text-sm">릴스를 업로드해보세요!</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-screen overflow-y-scroll snap-y snap-mandatory bg-black scrollbar-hide"
      style={{ scrollBehavior: 'smooth' }}
    >
      {reels.map((reel) => (
        <ReelCard key={reel.id} reel={reel} />
      ))}

      {/* Load more trigger */}
      <div ref={loadMoreRef} className="h-4 snap-start" />

      {isFetchingNextPage && (
        <div className="h-screen flex items-center justify-center bg-black snap-start">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
