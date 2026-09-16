import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, PlusSquare, Heart, User, Film, MessageCircle } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuthStore } from '../../stores/authStore';

const navItems = [
  { to: '/', icon: Home, label: '홈' },
  { to: '/explore', icon: Search, label: '탐색' },
  { to: '/reels', icon: Film, label: '릴스' },
  { to: '/post/write', icon: PlusSquare, label: '만들기' },
  { to: '/messages', icon: MessageCircle, label: 'DM' },
  { to: '/notifications', icon: Heart, label: '알림' },
];

export function BottomNav() {
  const location = useLocation();
  const { user } = useAuthStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 z-40 flex md:hidden">
      {navItems.map(({ to, icon: Icon, label }) => {
        const active = location.pathname === to;
        return (
          <Link
            key={to}
            to={to}
            className={cn(
              'flex-1 flex flex-col items-center justify-center py-2 transition-colors',
              active ? 'text-black dark:text-white' : 'text-gray-400 dark:text-gray-600'
            )}
            aria-label={label}
          >
            <Icon className="w-6 h-6" strokeWidth={active ? 2.5 : 1.5} />
          </Link>
        );
      })}
      {user && (
        <Link
          to={`/profile/${user.nickname}`}
          className={cn(
            'flex-1 flex flex-col items-center justify-center py-2 transition-colors',
            location.pathname === `/profile/${user.nickname}`
              ? 'text-black dark:text-white'
              : 'text-gray-400 dark:text-gray-600'
          )}
        >
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.nickname}
              className="w-6 h-6 rounded-full object-cover border-2 border-transparent"
              style={
                location.pathname === `/profile/${user.nickname}`
                  ? { borderColor: 'black' }
                  : {}
              }
            />
          ) : (
            <User className="w-6 h-6" />
          )}
        </Link>
      )}
    </nav>
  );
}
