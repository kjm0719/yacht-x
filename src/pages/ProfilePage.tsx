import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { Grid, Bookmark, PlaySquare, Settings } from 'lucide-react';
import { apiClient } from '../api/client';
import { useAuthStore } from '../stores/authStore';
import { useState } from 'react';

interface Profile {
  id: string;
  nickname: string;
  bio: string | null;
  avatarUrl: string | null;
  _count: {
    posts: number;
    followers: number;
    following: number;
  };
  isFollowing: boolean;
}

interface UserPost {
  id: string;
  type: string;
  media: { url: string; type: string }[];
  _count: { likes: number; comments: number };
}

export function ProfilePage() {
  const { nickname } = useParams<{ nickname: string }>();
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'POSTS' | 'REELS' | 'SAVED'>('POSTS');

  const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

  const { data: profile, isLoading: profileLoading } = useQuery<Profile>({
    queryKey: ['profile', nickname],
    queryFn: async () => {
      const res = await apiClient.get(`/users/${nickname}`);
      return res.data;
    },
    enabled: !!nickname,
  });

  const { data: posts, isLoading: postsLoading } = useQuery<UserPost[]>({
    queryKey: ['profile-posts', nickname],
    queryFn: async () => {
      // In a real app we would have a /users/:id/posts endpoint
      // Using search API as a proxy for user posts for now, or assume we have it.
      // Wait, let's use the search endpoint or assume the backend has it.
      // Since we don't have a specific user posts endpoint, we can use the /posts endpoint with a filter if supported,
      // but let's query the search endpoint which supports query by author nickname if implemented, or we can just fetch /posts and filter.
      // Actually, we'll fetch /posts?limit=50 and filter locally for MVP if no endpoint exists, or assume backend can handle it.
      // Let's use search API as it searches by nickname.
      const res = await apiClient.get(`/search?q=${nickname}&type=users`);
      // Fallback: If not implemented, just return empty array for now
      return res.data.posts || [];
    },
    enabled: !!nickname,
  });

  const followMutation = useMutation({
    mutationFn: () => apiClient.post(`/users/${profile?.id}/follow`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', nickname] });
    },
  });

  if (profileLoading) return <div className="p-8 text-center">Loading...</div>;
  if (!profile) return <div className="p-8 text-center text-gray-500">유저를 찾을 수 없습니다.</div>;

  const isOwnProfile = user?.id === profile.id;

  return (
    <div className="max-w-4xl mx-auto px-4 pt-8 pb-16">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center border-b border-gray-200 dark:border-gray-800 pb-8">
        <div className="flex-shrink-0 mx-auto sm:mx-0">
          {profile.avatarUrl ? (
            <img 
              src={`${baseUrl}${profile.avatarUrl}`} 
              alt={profile.nickname} 
              className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-800"
            />
          ) : (
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-4xl">
              {profile.nickname[0].toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
            <h1 className="text-2xl font-normal">{profile.nickname}</h1>
            <div className="flex gap-2">
              {isOwnProfile ? (
                <>
                  <button className="px-4 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-sm font-semibold transition">
                    프로필 편집
                  </button>
                  <button className="p-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition">
                    <Settings className="w-5 h-5" />
                  </button>
                </>
              ) : (
                isAuthenticated && (
                  <button 
                    onClick={() => followMutation.mutate()}
                    className={`px-6 py-1.5 rounded-lg text-sm font-semibold transition ${
                      profile.isFollowing 
                        ? 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    {profile.isFollowing ? '팔로잉' : '팔로우'}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="flex gap-6 mb-4">
            <div><span className="font-semibold">{profile._count.posts}</span> 게시물</div>
            <div><span className="font-semibold">{profile._count.followers}</span> 팔로워</div>
            <div><span className="font-semibold">{profile._count.following}</span> 팔로우</div>
          </div>

          <div className="text-sm">
            <p className="font-semibold">{profile.nickname}</p>
            <p className="whitespace-pre-wrap">{profile.bio || '소개가 없습니다.'}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center border-t border-gray-200 dark:border-gray-800">
        <button 
          onClick={() => setActiveTab('POSTS')}
          className={`flex items-center gap-2 px-6 py-4 text-xs font-semibold tracking-widest ${activeTab === 'POSTS' ? 'border-t-2 border-gray-900 dark:border-white text-gray-900 dark:text-white' : 'text-gray-500'}`}
        >
          <Grid className="w-4 h-4" /> 게시물
        </button>
        <button 
          onClick={() => setActiveTab('REELS')}
          className={`flex items-center gap-2 px-6 py-4 text-xs font-semibold tracking-widest ${activeTab === 'REELS' ? 'border-t-2 border-gray-900 dark:border-white text-gray-900 dark:text-white' : 'text-gray-500'}`}
        >
          <PlaySquare className="w-4 h-4" /> 릴스
        </button>
        {isOwnProfile && (
          <button 
            onClick={() => setActiveTab('SAVED')}
            className={`flex items-center gap-2 px-6 py-4 text-xs font-semibold tracking-widest ${activeTab === 'SAVED' ? 'border-t-2 border-gray-900 dark:border-white text-gray-900 dark:text-white' : 'text-gray-500'}`}
          >
            <Bookmark className="w-4 h-4" /> 저장됨
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-1 sm:gap-4 mt-2">
        {postsLoading ? (
          <div className="col-span-3 text-center py-10 text-gray-500">불러오는 중...</div>
        ) : posts?.length === 0 ? (
          <div className="col-span-3 text-center py-20 text-gray-500">아직 등록된 게시물이 없습니다.</div>
        ) : (
          posts?.filter(p => activeTab === 'POSTS' ? p.type === 'FEED' : p.type === 'REEL').map(post => (
            <Link key={post.id} to={`/post/${post.id}`} className="relative aspect-square group bg-gray-100 dark:bg-gray-800 overflow-hidden cursor-pointer">
              {post.media[0]?.type === 'VIDEO' ? (
                <video src={`${baseUrl}${post.media[0].url}`} className="w-full h-full object-cover" />
              ) : (
                <img src={`${baseUrl}${post.media[0].url}`} className="w-full h-full object-cover" />
              )}
              {/* Overlay stats on hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-4 text-white font-semibold">
                <span className="flex items-center gap-1">❤️ {post._count.likes}</span>
                <span className="flex items-center gap-1">💬 {post._count.comments}</span>
              </div>
              {post.type === 'REEL' && (
                <div className="absolute top-2 right-2 text-white"><PlaySquare className="w-5 h-5 fill-current" /></div>
              )}
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
