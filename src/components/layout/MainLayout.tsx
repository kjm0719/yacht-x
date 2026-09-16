import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';

export function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content — offset for sidebar on desktop */}
      <main className="md:ml-60 lg:ml-60 pb-16 md:pb-0 min-h-screen transition-all duration-300">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  );
}
