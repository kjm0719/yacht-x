import { useRef, useEffect, useState, useCallback } from 'react';
import { Heart, MessageCircle, Share2, Volume2, VolumeX } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { useAuthStore } from '../../stores/authStore';

interface ReelPost {
  id: string;
  caption?: string;
  author: { id: string; nickname: string; avatarUrl?: string };
  media: { id: string; url: string; type: string }[];
  _count: { likes: number; comments: number };
  likedByMe: boolean;
  tags: string[];
}

export function ReelCard({ reel }: { reel: ReelPost }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [muted, setMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';
  const videoMedia = reel.media.find((m) => m.type === 'VIDEO') ?? reel.media[0];

  // Auto-play when visible using IntersectionObserver
  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && entry.intersectionRatio >= 0.7) {
          video.play().catch(() => {});
          setIsPlaying(true);
        } else {
          video.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.7 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  const likeMutation = useMutation({
    mutationFn: () => apiClient.post(`/posts/${reel.id}/like`),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['feed', 'REEL'] });
      queryClient.setQueriesData({ queryKey: ['feed', 'REEL'] }, (old: unknown) => {
        const data = old as { pages?: { posts?: ReelPost[] }[] } | undefined;
        if (!data?.pages) return old;
        return {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            posts: page.posts?.map((p) =>
              p.id === reel.id
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
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['feed', 'REEL'] }),
  });

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-full snap-start bg-black flex items-center justify-center overflow-hidden"
    >
      {/* Video */}
      {videoMedia && (
        <video
          ref={videoRef}
          src={`${baseUrl}${videoMedia.url}`}
          className="h-full w-full object-cover"
          loop
          muted={muted}
          playsInline
          onClick={togglePlay}
        />
      )}

      {/* Play/Pause overlay */}
      {!isPlaying && (
        <div
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
          onClick={togglePlay}
        >
          <div className="bg-black/40 rounded-full p-5">
            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}

      {/* Right action bar */}
      <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6">
        {/* Like */}
        <button
          onClick={() => isAuthenticated && likeMutation.mutate()}
          className="flex flex-col items-center gap-1"
          aria-label={reel.likedByMe ? '좋아요 취소' : '좋아요'}
        >
          <Heart
            className={`w-7 h-7 drop-shadow-lg transition-transform hover:scale-110 ${
              reel.likedByMe ? 'text-red-500 fill-current' : 'text-white'
            }`}
          />
          <span className="text-white text-xs font-semibold drop-shadow">
            {reel._count.likes.toLocaleString()}
          </span>
        </button>

        {/* Comment */}
        <Link
          to={`/post/${reel.id}`}
          className="flex flex-col items-center gap-1"
          aria-label="댓글"
        >
          <MessageCircle className="w-7 h-7 text-white drop-shadow-lg" />
          <span className="text-white text-xs font-semibold drop-shadow">
            {reel._count.comments.toLocaleString()}
          </span>
        </Link>

        {/* Share */}
        <button className="flex flex-col items-center gap-1" aria-label="공유">
          <Share2 className="w-7 h-7 text-white drop-shadow-lg" />
          <span className="text-white text-xs font-semibold drop-shadow">공유</span>
        </button>

        {/* Mute toggle */}
        <button
          onClick={() => {
            setMuted((m) => !m);
            if (videoRef.current) videoRef.current.muted = !muted;
          }}
          aria-label={muted ? '음소거 해제' : '음소거'}
        >
          {muted ? (
            <VolumeX className="w-7 h-7 text-white drop-shadow-lg" />
          ) : (
            <Volume2 className="w-7 h-7 text-white drop-shadow-lg" />
          )}
        </button>

        {/* Author avatar */}
        <Link to={`/profile/${reel.author.nickname}`}>
          {reel.author.avatarUrl ? (
            <img
              src={`${baseUrl}${reel.author.avatarUrl}`}
              alt={reel.author.nickname}
              className="w-10 h-10 rounded-full object-cover border-2 border-white"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 border-2 border-white flex items-center justify-center text-white font-bold text-sm">
              {reel.author.nickname[0].toUpperCase()}
            </div>
          )}
        </Link>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pb-8 bg-gradient-to-t from-black/70 to-transparent">
        <Link
          to={`/profile/${reel.author.nickname}`}
          className="flex items-center gap-2 mb-2"
        >
          <span className="text-white font-semibold text-sm drop-shadow">
            @{reel.author.nickname}
          </span>
        </Link>
        {reel.caption && (
          <p className="text-white text-sm drop-shadow line-clamp-2">{reel.caption}</p>
        )}
        {reel.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {reel.tags.slice(0, 5).map((tag) => (
              <span key={tag} className="text-blue-300 text-sm">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
