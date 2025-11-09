'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  Home,
  BookOpen,
  TrendingUp,
  GraduationCap,
  HelpCircle,
  Settings,
  Award,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';

/**
 * AdaptiveSidebar - Grade-aware navigation sidebar
 * 
 * Features:
 * - Adapts complexity based on grade level
 * - Collapsible for more screen space
 * - Icon sizes adjust by grade
 * - Mobile drawer support
 * - Smooth animations
 */
export default function AdaptiveSidebar({ 
  isOpen = true, 
  onToggle,
  gradeLevel = 5,
  showDuringLearning = false, // Hide during active learning sessions
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-collapse on mobile
  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(true);
    }
  }, [isMobile]);

  // Get grade band
  const getGradeBand = (grade) => {
    if (grade <= -1) return 'preschool';
    if (grade === 0) return 'prek';
    if (grade <= 2) return 'k2';
    if (grade <= 5) return '35';
    if (grade <= 8) return '68';
    return '912';
  };

  const gradeBand = getGradeBand(gradeLevel);

  // Grade-adaptive configuration
  const config = {
    preschool: {
      iconSize: 48,
      showText: false,
      items: ['home', 'learn', 'help'],
      touchTarget: 56,
    },
    prek: {
      iconSize: 48,
      showText: false,
      items: ['home', 'learn', 'help'],
      touchTarget: 56,
    },
    k2: {
      iconSize: 40,
      showText: false,
      items: ['home', 'learn', 'progress', 'help'],
      touchTarget: 56,
    },
    '35': {
      iconSize: 32,
      showText: true,
      items: ['home', 'learn', 'progress', 'grades', 'help'],
      touchTarget: 48,
    },
    '68': {
      iconSize: 28,
      showText: true,
      items: ['home', 'learn', 'progress', 'grades', 'curriculum', 'help'],
      touchTarget: 44,
    },
    '912': {
      iconSize: 24,
      showText: true,
      items: ['home', 'learn', 'progress', 'grades', 'curriculum', 'assessments', 'help'],
      touchTarget: 40,
    },
  };

  const gradeConfig = config[gradeBand] || config['35'];

  // Navigation items
  const navItems = {
    home: {
      icon: Home,
      label: 'Home',
      path: '/dashboard',
      color: 'var(--color-accent)',
    },
    learn: {
      icon: BookOpen,
      label: 'Learn',
      path: '/learn',
      color: 'var(--color-primary)',
    },
    progress: {
      icon: TrendingUp,
      label: 'Progress',
      path: '/progress',
      color: 'var(--color-success)',
    },
    grades: {
      icon: GraduationCap,
      label: 'Grades',
      path: '/grades',
      color: 'var(--color-warning)',
    },
    curriculum: {
      icon: ClipboardList,
      label: 'Curriculum',
      path: '/curriculum',
      color: 'var(--color-info)',
    },
    assessments: {
      icon: Award,
      label: 'Assessments',
      path: '/assessments',
      color: 'var(--color-accent)',
    },
    help: {
      icon: HelpCircle,
      label: 'Help',
      path: '/help',
      color: 'var(--color-text-secondary)',
    },
  };

  // Filter items based on grade config
  const visibleItems = gradeConfig.items.map(key => navItems[key]).filter(Boolean);

  // Add parent dashboard for parents
  if (user?.role === 'PARENT') {
    visibleItems.push({
      icon: Settings,
      label: 'Parent',
      path: '/parent',
      color: 'var(--color-primary)',
    });
  }

  const handleNavigate = (path) => {
    router.push(path);
    if (isMobile) {
      onToggle?.(); // Close drawer on mobile after navigation
    }
  };

  const isActive = (path) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/';
    }
    return pathname?.startsWith(path);
  };

  // Don't show during active learning unless explicitly allowed
  if (!showDuringLearning && pathname?.includes('/learn') && pathname !== '/learn') {
    return null;
  }

  // Mobile drawer
  if (isMobile) {
    return (
      <>
        {/* Mobile Menu Button */}
        <button
          onClick={onToggle}
          className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg"
          style={{
            width: gradeConfig.touchTarget,
            height: gradeConfig.touchTarget,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <X size={gradeConfig.iconSize * 0.6} />
          ) : (
            <Menu size={gradeConfig.iconSize * 0.6} />
          )}
        </button>

        {/* Mobile Drawer */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={onToggle}
            />

            {/* Drawer */}
            <div
              className="fixed left-0 top-0 bottom-0 z-50 bg-white shadow-xl"
              style={{
                width: '280px',
                padding: 'var(--space-lg)',
                overflowY: 'auto',
                transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
                transition: 'transform 0.3s ease-in-out',
              }}
            >
              <div className="flex flex-col gap-2">
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);

                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNavigate(item.path)}
                      className="flex items-center gap-3 p-3 rounded-lg transition-colors"
                      style={{
                        backgroundColor: active ? item.color + '20' : 'transparent',
                        color: active ? item.color : 'var(--color-text-primary)',
                        minHeight: gradeConfig.touchTarget,
                        fontSize: gradeBand === 'k2' ? 'var(--text-lg)' : 'var(--text-base)',
                      }}
                    >
                      <Icon size={gradeConfig.iconSize} />
                      <span style={{ fontWeight: active ? 'var(--weight-semibold)' : 'var(--weight-normal)' }}>
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </>
    );
  }

  // Desktop sidebar
  return (
    <aside
      className="bg-white border-r border-gray-200 transition-all duration-300"
      style={{
        width: isCollapsed ? '80px' : '240px',
        minHeight: '100vh',
        position: 'sticky',
        top: 0,
        padding: 'var(--space-md)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-sm)',
      }}
    >
      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="self-end p-2 rounded-lg hover:bg-gray-100 transition-colors"
        style={{
          width: gradeConfig.touchTarget * 0.7,
          height: gradeConfig.touchTarget * 0.7,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? (
          <ChevronRight size={20} />
        ) : (
          <ChevronLeft size={20} />
        )}
      </button>

      {/* Navigation Items */}
      <nav className="flex flex-col gap-2 flex-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className="flex items-center gap-3 p-3 rounded-lg transition-all"
              style={{
                backgroundColor: active ? item.color + '20' : 'transparent',
                color: active ? item.color : 'var(--color-text-primary)',
                minHeight: gradeConfig.touchTarget,
                fontSize: gradeBand === 'k2' ? 'var(--text-lg)' : 'var(--text-base)',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = 'var(--color-bg-muted)';
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon size={gradeConfig.iconSize} />
              {(!isCollapsed && (gradeConfig.showText || gradeBand === 'k2')) && (
                <span style={{ fontWeight: active ? 'var(--weight-semibold)' : 'var(--weight-normal)' }}>
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

