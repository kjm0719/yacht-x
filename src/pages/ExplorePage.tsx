import { useState, useEffect } from 'react';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { Search, Grid, Hash, User, LayoutList, Globe, Image as ImageIcon, Film } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiClient } from '../api/client';
import { cn } from '../utils/cn';
import DOMPurify from 'dompurify';

interface SearchResult {
  users: { id: string; nickname: string; avatarUrl: string | null }[];
  posts: { id: string; type: string; media: { url: string; type: string }[]; _count: { likes: number; comments: number } }[];
  tags: { name: string; _count?: { posts: number } }[];
  web?: { title: string; link: string; description: string }[];
  images?: { title: string; url: string; thumb: string; link?: string }[];
  videos?: { title: string; link: string; thumb: string; duration: string }[];
}

export function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const type = searchParams.get('type') || 'all'; // all, users, tags, posts, web

  const [searchInput, setSearchInput] = useState(q);
  const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

  useEffect(() => {
    setSearchInput(q);
  }, [q]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) {
      setSearchParams({});
      return;
    }
    setSearchParams({ q: searchInput.trim(), type: 'all' });
  };

  const setTab = (newType: string) => {
    setSearchParams({ q, type: newType });
  };

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['search', q, type],
    queryFn: async ({ pageParam = 1 }) => {
      if (!q) return { users: [], posts: [], tags: [], web: [], nextPage: undefined };
      const res = await apiClient.get(`/search?q=${encodeURIComponent(q)}&type=${type}&page=${pageParam}`);
      return res.data;
    },
    getNextPageParam: (lastPage) => lastPage?.nextPage,
    initialPageParam: 1,
    enabled: q.length > 0,
  });

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 800 &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // 데이터 합치기 (모든 페이지의 배열 요소들을 하나로)
  const results = {
    users: data?.pages.flatMap((p) => p.users || []) || [],
    posts: data?.pages.flatMap((p) => p.posts || []) || [],
    tags: data?.pages.flatMap((p) => p.tags || []) || [],
    web: data?.pages.flatMap((p) => p.web || []) || [],
    images: data?.pages.flatMap((p) => p.images || []) || [],
    videos: data?.pages.flatMap((p) => p.videos || []) || [],
  };

  const { data: exploreFeed, isLoading: exploreLoading } = useQuery({
    queryKey: ['explore-feed'],
    queryFn: async () => {
      const res = await apiClient.get('/posts?limit=30');
      return res.data.posts;
    },
    enabled: q.length === 0,
  });

  const renderPostGrid = (posts: any[]) => (
    <div className="grid grid-cols-3 gap-1 sm:gap-4 mt-4">
      {posts.map((post) => (
        <Link key={post.id} to={`/post/${post.id}`} className="relative aspect-square group bg-gray-100 dark:bg-gray-800 overflow-hidden cursor-pointer">
          {post.media[0]?.type === 'VIDEO' ? (
            <video src={`${baseUrl}${post.media[0].url}`} className="w-full h-full object-cover" />
          ) : (
            <img src={`${baseUrl}${post.media[0].url}`} className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-4 text-white font-semibold">
            <span className="flex items-center gap-1">❤️ {post._count?.likes ?? 0}</span>
            <span className="flex items-center gap-1">💬 {post._count?.comments ?? 0}</span>
          </div>
        </Link>
      ))}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Search Input Bar */}
      <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto mb-8">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-12 pr-4 py-3.5 border border-gray-200 dark:border-gray-700 rounded-2xl leading-5 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 sm:text-lg transition shadow-sm"
          placeholder="통합 검색 (웹 검색, 유저, 게시물...)"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </form>

      {/* Search Results Area */}
      {q.length > 0 ? (
        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex gap-2 sm:gap-4 border-b border-gray-200 dark:border-gray-800 pb-px overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setTab('all')}
              className={cn("px-4 py-3 flex items-center gap-2 font-semibold text-sm whitespace-nowrap border-b-2 transition", type === 'all' ? "border-gray-900 dark:border-white text-gray-900 dark:text-white" : "border-transparent text-gray-500")}
            >
              <LayoutList className="w-4 h-4" /> 통합검색
            </button>
            <button
              onClick={() => setTab('web')}
              className={cn("px-4 py-3 flex items-center gap-2 font-semibold text-sm whitespace-nowrap border-b-2 transition", type === 'web' ? "border-gray-900 dark:border-white text-gray-900 dark:text-white" : "border-transparent text-gray-500")}
            >
              <Globe className="w-4 h-4" /> 웹 검색
            </button>
            <button
              onClick={() => setTab('images')}
              className={cn("px-4 py-3 flex items-center gap-2 font-semibold text-sm whitespace-nowrap border-b-2 transition", type === 'images' ? "border-gray-900 dark:border-white text-gray-900 dark:text-white" : "border-transparent text-gray-500")}
            >
              <ImageIcon className="w-4 h-4" /> 이미지
            </button>
            <button
              onClick={() => setTab('videos')}
              className={cn("px-4 py-3 flex items-center gap-2 font-semibold text-sm whitespace-nowrap border-b-2 transition", type === 'videos' ? "border-gray-900 dark:border-white text-gray-900 dark:text-white" : "border-transparent text-gray-500")}
            >
              <Film className="w-4 h-4" /> 동영상
            </button>
            <button
              onClick={() => setTab('users')}
              className={cn("px-4 py-3 flex items-center gap-2 font-semibold text-sm whitespace-nowrap border-b-2 transition", type === 'users' ? "border-gray-900 dark:border-white text-gray-900 dark:text-white" : "border-transparent text-gray-500")}
            >
              <User className="w-4 h-4" /> 계정
            </button>
            <button
              onClick={() => setTab('tags')}
              className={cn("px-4 py-3 flex items-center gap-2 font-semibold text-sm whitespace-nowrap border-b-2 transition", type === 'tags' ? "border-gray-900 dark:border-white text-gray-900 dark:text-white" : "border-transparent text-gray-500")}
            >
              <Hash className="w-4 h-4" /> 태그
            </button>
            <button
              onClick={() => setTab('posts')}
              className={cn("px-4 py-3 flex items-center gap-2 font-semibold text-sm whitespace-nowrap border-b-2 transition", type === 'posts' ? "border-gray-900 dark:border-white text-gray-900 dark:text-white" : "border-transparent text-gray-500")}
            >
              <Grid className="w-4 h-4" /> 게시물
            </button>
          </div>

          {isLoading ? (
            <div className="text-center text-gray-500 py-10">검색 중...</div>
          ) : (
            <div className="space-y-10">
              
              {/* Web Results Section */}
              {(type === 'all' || type === 'web') && results?.web && results.web.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2"><Globe className="w-5 h-5 text-blue-500"/> 웹 검색 결과</h3>
                    {type === 'all' && results.web.length > 2 && (
                      <button onClick={() => setTab('web')} className="text-sm text-blue-500 hover:underline">모두 보기</button>
                    )}
                  </div>
                  <div className="space-y-4">
                    {results.web.slice(0, type === 'all' ? 3 : undefined).map((item, idx) => (
                      <a key={idx} href={item.link} target="_blank" rel="noopener noreferrer" className="block p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl hover:shadow-md transition">
                        <h4 
                          className="text-blue-600 dark:text-blue-400 font-medium text-lg mb-1"
                          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item.title) }}
                        />
                        <p 
                          className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2"
                          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item.description) }}
                        />
                        <div className="text-xs text-gray-400 mt-2 truncate">{item.link}</div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Images Section */}
              {(type === 'all' || type === 'images') && results?.images && results.images.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2"><ImageIcon className="w-5 h-5 text-green-500"/> 이미지</h3>
                    {type === 'all' && results.images.length > 3 && (
                      <button onClick={() => setTab('images')} className="text-sm text-green-500 hover:underline">모두 보기</button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {results.images.slice(0, type === 'all' ? 4 : undefined).map((img, idx) => (
                      <a key={idx} href={img.url} target="_blank" rel="noopener noreferrer" className="block relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden group">
                        <img src={img.thumb || img.url} alt={img.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition">
                          <p className="text-white text-xs truncate">{img.title}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Videos Section */}
              {(type === 'all' || type === 'videos') && results?.videos && results.videos.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2"><Film className="w-5 h-5 text-red-500"/> 동영상</h3>
                    {type === 'all' && results.videos.length > 1 && (
                      <button onClick={() => setTab('videos')} className="text-sm text-red-500 hover:underline">모두 보기</button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {results.videos.slice(0, type === 'all' ? 2 : undefined).map((vid, idx) => (
                      <a key={idx} href={vid.link} target="_blank" rel="noopener noreferrer" className="flex gap-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-2 rounded-xl hover:shadow-md transition">
                        <div className="relative w-32 sm:w-40 flex-shrink-0 bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden aspect-video">
                          <img src={`${baseUrl}/api/search/proxy?url=${encodeURIComponent(vid.thumb)}`} alt={vid.title} className="w-full h-full object-cover" />
                          <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1 rounded">{vid.duration}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm line-clamp-2 leading-snug">{vid.title}</h4>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Users Section */}
              {(type === 'all' || type === 'users') && results?.users && results.users.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">계정</h3>
                    {type === 'all' && results.users.length > 2 && (
                      <button onClick={() => setTab('users')} className="text-sm text-pink-500 hover:underline">모두 보기</button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {results.users.slice(0, type === 'all' ? 4 : undefined).map(u => (
                      <Link key={u.id} to={`/profile/${u.nickname}`} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl hover:shadow-md transition">
                        {u.avatarUrl ? (
                          <img src={`${baseUrl}${u.avatarUrl}`} className="w-12 h-12 rounded-full object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-400 to-pink-500 flex items-center justify-center font-bold text-white">
                            {u.nickname[0].toUpperCase()}
                          </div>
                        )}
                        <span className="font-semibold">{u.nickname}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags Section */}
              {(type === 'all' || type === 'tags') && results?.tags && results.tags.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">태그</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {results.tags.map(t => (
                      <Link key={t.name} to={`/explore?q=${t.name}&type=posts`} className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl font-medium text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition flex items-center gap-2">
                        <Hash className="w-4 h-4 text-gray-400" />
                        {t.name}
                        {t._count && <span className="opacity-50 text-xs ml-1">({t._count.posts})</span>}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Posts Section */}
              {(type === 'all' || type === 'posts') && results?.posts && results.posts.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">게시물</h3>
                  </div>
                  {renderPostGrid(results.posts)}
                </div>
              )}

              {/* Empty State */}
              {!results?.web?.length && !results?.users?.length && !results?.tags?.length && !results?.posts?.length && (
                <div className="text-center text-gray-500 py-12">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>'{q}'에 대한 검색 결과가 없습니다.</p>
                </div>
              )}
              
              {/* Infinite Scroll Loading Indicator */}
              {isFetchingNextPage && (
                <div className="text-center text-gray-400 py-4">
                  더 많은 결과를 불러오는 중입니다...
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Default Explore Grid */
        <div>
          <h2 className="font-semibold text-xl mb-4 px-1">추천 게시물</h2>
          {exploreLoading ? (
            <div className="text-center text-gray-500 py-10">불러오는 중...</div>
          ) : (
            renderPostGrid(exploreFeed || [])
          )}
        </div>
      )}
    </div>
  );
}
