import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home, Search, PlusSquare, Heart, User, Film, MessageCircle, LogOut, Sun, Moon, Menu
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';
import { apiClient } from '../../api/client';
import { cn } from '../../utils/cn';

const navItems = [
  { to: '/', icon: Home, label: '홈' },
  { to: '/explore', icon: Search, label: '탐색' },
  { to: '/reels', icon: Film, label: '릴스' },
  { to: '/post/write', icon: PlusSquare, label: '만들기' },
  { to: '/messages', icon: MessageCircle, label: '메시지' },
  { to: '/notifications', icon: Heart, label: '알림' },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      logout();
      navigate('/auth/login');
    }
  };

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 h-full bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 z-40 flex flex-col transition-all duration-300',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="px-4 py-6">
        {collapsed ? (
          <div className="w-8 h-8 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 rounded-xl" />
        ) : (
          <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            Nexus
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex items-center gap-4 px-3 py-3 rounded-xl transition-colors hover:bg-gray-100 dark:hover:bg-gray-900',
                active ? 'font-bold' : 'font-normal',
                collapsed && 'justify-center'
              )}
            >
              <Icon className="w-6 h-6 shrink-0" strokeWidth={active ? 2.5 : 1.5} />
              {!collapsed && <span className="text-sm">{label}</span>}
            </Link>
          );
        })}

        {/* Profile */}
        {isAuthenticated && user && (
          <Link
            to={`/profile/${user.nickname}`}
            className={cn(
              'flex items-center gap-4 px-3 py-3 rounded-xl transition-colors hover:bg-gray-100 dark:hover:bg-gray-900',
              location.pathname === `/profile/${user.nickname}` && 'font-bold',
              collapsed && 'justify-center'
            )}
          >
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.nickname} className="w-6 h-6 rounded-full object-cover" />
            ) : (
              <User className="w-6 h-6 shrink-0" />
            )}
            {!collapsed && <span className="text-sm">프로필</span>}
          </Link>
        )}
      </nav>

      {/* Bottom actions */}
      <div className="px-2 pb-6 space-y-1">
        <button
          onClick={toggleTheme}
          className={cn(
            'w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-colors hover:bg-gray-100 dark:hover:bg-gray-900',
            collapsed && 'justify-center'
          )}
        >
          {theme === 'light' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
          {!collapsed && <span className="text-sm">{theme === 'light' ? '다크모드' : '라이트모드'}</span>}
        </button>

        {isAuthenticated && (
          <button
            onClick={handleLogout}
            className={cn(
              'w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-colors hover:bg-gray-100 dark:hover:bg-gray-900 text-red-500',
              collapsed && 'justify-center'
            )}
          >
            <LogOut className="w-6 h-6 shrink-0" />
            {!collapsed && <span className="text-sm">로그아웃</span>}
          </button>
        )}

        <button
          onClick={() => setCollapsed((c) => !c)}
          className={cn(
            'w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-colors hover:bg-gray-100 dark:hover:bg-gray-900',
            collapsed && 'justify-center'
          )}
        >
          <Menu className="w-6 h-6" />
          {!collapsed && <span className="text-sm">접기</span>}
        </button>
      </div>
    </aside>
  );
}
