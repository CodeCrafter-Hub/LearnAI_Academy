'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Home, User, LogOut, Settings } from 'lucide-react';
import MobileMenu from './MobileMenu';

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  return (
    <header className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            aria-label="Go to dashboard"
          >
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-2">
              <span className="text-white font-bold text-xl">LA</span>
            </div>
            <span className="text-xl font-bold text-gray-800 hidden sm:inline">
              LearnAI Academy
            </span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors font-medium"
            >
              <Home className="w-5 h-5" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => router.push('/learn')}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors font-medium"
            >
              <span>Learn</span>
            </button>
            <button
              onClick={() => router.push('/curriculum')}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors font-medium"
            >
              <span>Curriculum</span>
            </button>
            <button
              onClick={() => router.push('/assessments')}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors font-medium"
            >
              <span>Assessments</span>
            </button>
            <button
              onClick={() => router.push('/progress')}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors font-medium"
            >
              <span>Progress</span>
            </button>
            {user?.role === 'PARENT' && (
              <button
                onClick={() => router.push('/parent')}
                className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors font-medium"
              >
                <span>Parent Dashboard</span>
              </button>
            )}
          </nav>

          {/* Desktop User Menu */}
          <div className="hidden md:block relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 rounded-full px-4 py-2 transition-colors"
              aria-label="User menu"
            >
              <User className="w-5 h-5" />
              <span className="hidden lg:inline">{user?.email}</span>
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-2 z-20">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      router.push('/settings');
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      handleLogout();
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-red-600 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <MobileMenu user={user} onLogout={handleLogout} />
        </div>
      </div>
    </header>
  );
}
