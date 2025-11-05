'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X, Home, BookOpen, ClipboardList, TrendingUp, User, Settings, LogOut } from 'lucide-react';

export default function MobileMenu({ user, onLogout }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: BookOpen, label: 'Learn', path: '/learn' },
    { icon: ClipboardList, label: 'Curriculum', path: '/curriculum' },
    { icon: ClipboardList, label: 'Assessments', path: '/assessments' },
    { icon: TrendingUp, label: 'Progress', path: '/progress' },
  ];

  if (user?.role === 'PARENT') {
    navItems.push({ icon: User, label: 'Parent Dashboard', path: '/parent' });
  }

  const handleNavigate = (path) => {
    router.push(path);
    setIsOpen(false);
  };

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 w-64 bg-white shadow-xl z-50 overflow-y-auto">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xl font-bold text-gray-800">Menu</span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="text-sm text-gray-600">{user?.email}</div>
            </div>

            <nav className="p-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigate(item.path)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
                  >
                    <Icon className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-800">{item.label}</span>
                  </button>
                );
              })}

              <div className="border-t my-4"></div>

              <button
                onClick={() => {
                  handleNavigate('/settings');
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
              >
                <Settings className="w-5 h-5 text-gray-600" />
                <span className="text-gray-800">Settings</span>
              </button>

              <button
                onClick={() => {
                  onLogout();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 transition-colors text-left text-red-600"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </nav>
          </div>
        </>
      )}
    </div>
  );
}

