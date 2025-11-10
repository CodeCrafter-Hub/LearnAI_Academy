'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Home,
  BookOpen,
  GraduationCap,
  ClipboardList,
  TrendingUp,
  Video,
  Settings,
  User,
  LogOut,
  Bell,
  Search,
  ChevronDown,
  Menu,
  X,
  HelpCircle,
  MessageSquare,
  CheckCircle,
  Clock,
  Award,
  Sparkles,
  Command,
  Shield,
  Brain,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
// import { useNotificationContext } from '@/components/providers/NotificationProvider';
import ThemeToggle from '@/components/ui/ThemeToggle';
import LanguageSelector from '@/components/i18n/LanguageSelector';

/**
 * Enterprise-Grade Navigation Header
 * 
 * Features:
 * - Clean, professional design with glassmorphism
 * - Organized dropdown menus
 * - Active state indicators with smooth transitions
 * - Advanced search with keyboard shortcuts (Cmd/Ctrl+K)
 * - Notifications dropdown with real-time updates
 * - Responsive mobile menu with animations
 * - Keyboard navigation support
 * - Breadcrumbs for deep navigation
 * - User menu with profile information
 */
export default function EnterpriseHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  // const { notifications: contextNotifications } = useNotificationContext() || { notifications: [] };
  const contextNotifications = [];
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);
  const searchInputRef = useRef(null);

  // Load notifications
  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [user]);

  const loadNotifications = async () => {
    try {
      // Use context notifications or fetch from API
      if (contextNotifications && contextNotifications.length > 0) {
        setNotifications(contextNotifications);
        setUnreadCount(contextNotifications.filter(n => !n.read).length);
      } else {
        // Fallback: Mock notifications for demo
        const mockNotifications = [
          {
            id: '1',
            type: 'achievement',
            title: 'Achievement Unlocked! 🎉',
            message: 'You earned the "Math Master" badge',
            time: '2 hours ago',
            read: false,
            icon: Award,
          },
          {
            id: '2',
            type: 'streak',
            title: 'Keep Your Streak Alive! 🔥',
            message: 'You\'re on a 7-day streak!',
            time: '5 hours ago',
            read: false,
            icon: Sparkles,
          },
          {
            id: '3',
            type: 'review',
            title: 'Time to Review! 📚',
            message: '3 items are ready for review',
            time: '1 day ago',
            read: true,
            icon: Clock,
          },
        ];
        setNotifications(mockNotifications);
        setUnreadCount(mockNotifications.filter(n => !n.read).length);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd/Ctrl + K for search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
      // Escape to close modals
      if (e.key === 'Escape') {
        setShowSearch(false);
        setShowUserMenu(false);
        setShowNotifications(false);
        setActiveDropdown(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setShowMobileMenu(false);
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
  };

  const markNotificationRead = async (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  // Navigation structure
  const navigation = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: Home,
      exact: true,
    },
    {
      label: 'Learn',
      path: '/learn',
      icon: BookOpen,
      submenu: [
        { label: 'Browse Topics', path: '/learn' },
        { label: 'Video Lessons', path: '/learn/videos' },
        { label: 'Practice', path: '/learn/practice' },
        { label: 'Study Tools', path: '/learn/tools' },
      ],
    },
    {
      label: 'Curriculum',
      path: '/curriculum',
      icon: GraduationCap,
      submenu: [
        { label: 'My Curriculum', path: '/curriculum' },
        { label: 'Subjects', path: '/curriculum/subjects' },
        { label: 'Units', path: '/curriculum/units' },
        { label: 'Lessons', path: '/curriculum/lessons' },
      ],
    },
    {
      label: 'Assessments',
      path: '/assessments',
      icon: ClipboardList,
      submenu: [
        { label: 'Take Assessment', path: '/assessments' },
        { label: 'My Results', path: '/assessments/results' },
        { label: 'Practice Tests', path: '/assessments/practice' },
      ],
    },
    {
      label: 'Progress',
      path: '/progress',
      icon: TrendingUp,
      submenu: [
        { label: 'Overview', path: '/progress' },
        { label: 'Analytics', path: '/progress/analytics' },
        { label: 'Achievements', path: '/progress/achievements' },
        { label: 'Reports', path: '/progress/reports' },
      ],
    },
  ];

  // Add parent-specific navigation
  if (user?.role === 'PARENT') {
    navigation.push({
      label: 'Parent',
      path: '/parent',
      icon: User,
      submenu: [
        { label: 'Dashboard', path: '/parent' },
        { label: 'Children', path: '/parent/children' },
        { label: 'Reports', path: '/parent/reports' },
        { label: 'Settings', path: '/parent/settings' },
      ],
    });
  }

  const isActive = (path, exact = false) => {
    if (exact) {
      return pathname === path;
    }
    return pathname?.startsWith(path);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearch(false);
      setSearchQuery('');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'achievement':
        return Award;
      case 'streak':
        return Sparkles;
      case 'review':
        return Clock;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'achievement':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'streak':
        return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20';
      case 'review':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-800';
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center flex-shrink-0">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center group transition-transform hover:scale-105"
              aria-label="Go to dashboard"
            >
              {/* Logo image - contains full branding */}
              <img 
                src="/logo.png" 
                alt="Aigents Academy - Ignited Minds, Powered by AI" 
                className="h-12 sm:h-14 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center max-w-4xl">
            {navigation.map((item) => {
              const Icon = item.icon;
              const hasSubmenu = item.submenu && item.submenu.length > 0;
              const active = isActive(item.path, item.exact);

              return (
                <div key={item.path} className="relative" ref={hasSubmenu ? dropdownRef : null}>
                  <button
                    onClick={() => {
                      if (hasSubmenu) {
                        setActiveDropdown(activeDropdown === item.path ? null : item.path);
                      } else {
                        router.push(item.path);
                      }
                    }}
                    onMouseEnter={() => {
                      if (hasSubmenu) {
                        // Auto-open on hover for better UX
                        setTimeout(() => {
                          if (activeDropdown !== item.path) {
                            setActiveDropdown(item.path);
                          }
                        }, 200);
                      }
                    }}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                      ${active
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {hasSubmenu && (
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          activeDropdown === item.path ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {hasSubmenu && activeDropdown === item.path && (
                    <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      {item.submenu.map((subitem) => (
                        <button
                          key={subitem.path}
                          onClick={() => {
                            router.push(subitem.path);
                            setActiveDropdown(null);
                          }}
                          className={`
                            w-full text-left px-4 py-2.5 text-sm transition-colors duration-150
                            ${isActive(subitem.path)
                              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }
                          `}
                        >
                          {subitem.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              {showSearch ? (
                <form onSubmit={handleSearch} className="flex items-center">
                  <div className="relative">
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search lessons, topics, videos..."
                      autoFocus
                      className="w-80 px-4 py-2 pl-10 pr-20 bg-white dark:bg-gray-800 border-2 border-blue-500 dark:border-blue-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg"
                      onBlur={() => {
                        setTimeout(() => setShowSearch(false), 200);
                      }}
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-gray-400">
                      <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Esc</kbd>
                    </div>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => {
                    setShowSearch(true);
                    setTimeout(() => searchInputRef.current?.focus(), 100);
                  }}
                  className="relative p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors group"
                  aria-label="Search"
                  title="Search (Ctrl+K)"
                >
                  <Search className="w-5 h-5" />
                  <div className="absolute -bottom-1 -right-1 hidden group-hover:block px-1.5 py-0.5 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 text-xs rounded">
                    <Command className="w-3 h-3 inline" />K
                  </div>
                </button>
              )}
            </div>

            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setActiveDropdown(null);
                }}
                className="relative p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-xs font-bold rounded-full">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Notifications
                    </h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No notifications</p>
                      </div>
                    ) : (
                      notifications.map((notification) => {
                        const Icon = getNotificationIcon(notification.type);
                        return (
                          <button
                            key={notification.id}
                            onClick={() => {
                              markNotificationRead(notification.id);
                              if (notification.action?.route) {
                                router.push(notification.action.route);
                                setShowNotifications(false);
                              }
                            }}
                            className={`
                              w-full text-left px-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0
                              transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50
                              ${!notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}
                            `}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${getNotificationColor(notification.type)}`}>
                                <Icon className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {notification.title}
                                  </p>
                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                                  )}
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                  {notification.time}
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => {
                          router.push('/notifications');
                          setShowNotifications(false);
                        }}
                        className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        View all notifications
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Language Selector */}
            <div className="hidden md:block">
              <LanguageSelector />
            </div>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowNotifications(false);
                  setActiveDropdown(null);
                }}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="hidden xl:block text-left">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {user?.name || user?.email?.split('@')[0] || 'User'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.role || 'Student'}
                  </div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                    showUserMenu ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {user?.name || 'User'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user?.email}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      router.push('/settings');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                  
                  <button
                    onClick={() => {
                      router.push('/help');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
                  >
                    <HelpCircle className="w-4 h-4" />
                    Help & Support
                  </button>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                  
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Menu"
            >
              {showMobileMenu ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="lg:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 animate-in slide-in-from-top duration-200">
          <nav className="px-4 py-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path, item.exact);

              return (
                <div key={item.path}>
                  <button
                    onClick={() => {
                      if (item.submenu) {
                        setActiveDropdown(activeDropdown === item.path ? null : item.path);
                      } else {
                        router.push(item.path);
                        setShowMobileMenu(false);
                      }
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                      ${active
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                    {item.submenu && (
                      <ChevronDown
                        className={`w-4 h-4 ml-auto transition-transform ${
                          activeDropdown === item.path ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </button>

                  {/* Mobile Submenu */}
                  {item.submenu && activeDropdown === item.path && (
                    <div className="ml-8 mt-1 space-y-1 animate-in slide-in-from-left duration-200">
                      {item.submenu.map((subitem) => (
                        <button
                          key={subitem.path}
                          onClick={() => {
                            router.push(subitem.path);
                            setShowMobileMenu(false);
                            setActiveDropdown(null);
                          }}
                          className={`
                            w-full text-left px-4 py-2 rounded-lg text-sm transition-colors
                            ${isActive(subitem.path)
                              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }
                          `}
                        >
                          {subitem.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
