'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Home, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import ThemeToggle from '@/components/ui/ThemeToggle';
import LanguageSelector from '@/components/i18n/LanguageSelector';
import MobileMenu from './MobileMenu';

export default function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="glass" style={{
      borderBottom: '1px solid var(--color-border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 'var(--z-sticky)',
    }}>
      <div className="container" style={{
        padding: 'var(--space-md)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Logo */}
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-xs)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'opacity var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
            aria-label="Go to dashboard"
          >
            <div style={{
              background: 'linear-gradient(135deg, hsl(220, 80%, 60%) 0%, hsl(260, 70%, 60%) 100%)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-xs)',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <span style={{
                color: 'white',
                fontWeight: 'var(--weight-bold)',
                fontSize: 'var(--text-xl)',
              }}>LA</span>
            </div>
            <span className="hidden sm:inline" style={{
              fontSize: 'var(--text-xl)',
              fontWeight: 'var(--weight-bold)',
              color: 'var(--color-text-primary)',
            }}>
              Aigents Academy
            </span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex" style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-md)',
          }}>
            <button
              onClick={() => router.push('/dashboard')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2xs)',
                padding: 'var(--space-xs) var(--space-sm)',
                background: 'none',
                border: 'none',
                color: 'var(--color-text-secondary)',
                fontWeight: 'var(--weight-medium)',
                fontSize: 'var(--text-base)',
                cursor: 'pointer',
                borderRadius: 'var(--radius-lg)',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--color-accent)';
                e.currentTarget.style.background = 'var(--color-bg-muted)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--color-text-secondary)';
                e.currentTarget.style.background = 'none';
              }}
            >
              <Home className="w-5 h-5" aria-hidden="true" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => router.push('/learn')}
              style={{
                padding: 'var(--space-xs) var(--space-sm)',
                background: 'none',
                border: 'none',
                color: 'var(--color-text-secondary)',
                fontWeight: 'var(--weight-medium)',
                fontSize: 'var(--text-base)',
                cursor: 'pointer',
                borderRadius: 'var(--radius-lg)',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--color-accent)';
                e.currentTarget.style.background = 'var(--color-bg-muted)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--color-text-secondary)';
                e.currentTarget.style.background = 'none';
              }}
            >
              Learn
            </button>
            <button
              onClick={() => router.push('/curriculum')}
              style={{
                padding: 'var(--space-xs) var(--space-sm)',
                background: 'none',
                border: 'none',
                color: 'var(--color-text-secondary)',
                fontWeight: 'var(--weight-medium)',
                fontSize: 'var(--text-base)',
                cursor: 'pointer',
                borderRadius: 'var(--radius-lg)',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--color-accent)';
                e.currentTarget.style.background = 'var(--color-bg-muted)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--color-text-secondary)';
                e.currentTarget.style.background = 'none';
              }}
            >
              Curriculum
            </button>
            <button
              onClick={() => router.push('/assessments')}
              style={{
                padding: 'var(--space-xs) var(--space-sm)',
                background: 'none',
                border: 'none',
                color: 'var(--color-text-secondary)',
                fontWeight: 'var(--weight-medium)',
                fontSize: 'var(--text-base)',
                cursor: 'pointer',
                borderRadius: 'var(--radius-lg)',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--color-accent)';
                e.currentTarget.style.background = 'var(--color-bg-muted)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--color-text-secondary)';
                e.currentTarget.style.background = 'none';
              }}
            >
              Assessments
            </button>
            <button
              onClick={() => router.push('/progress')}
              style={{
                padding: 'var(--space-xs) var(--space-sm)',
                background: 'none',
                border: 'none',
                color: 'var(--color-text-secondary)',
                fontWeight: 'var(--weight-medium)',
                fontSize: 'var(--text-base)',
                cursor: 'pointer',
                borderRadius: 'var(--radius-lg)',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--color-accent)';
                e.currentTarget.style.background = 'var(--color-bg-muted)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--color-text-secondary)';
                e.currentTarget.style.background = 'none';
              }}
            >
              Progress
            </button>
            {user?.role === 'PARENT' && (
              <button
                onClick={() => router.push('/parent')}
                style={{
                  padding: 'var(--space-xs) var(--space-sm)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-secondary)',
                  fontWeight: 'var(--weight-medium)',
                  fontSize: 'var(--text-base)',
                  cursor: 'pointer',
                  borderRadius: 'var(--radius-lg)',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--color-accent)';
                  e.currentTarget.style.background = 'var(--color-bg-muted)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--color-text-secondary)';
                  e.currentTarget.style.background = 'none';
                }}
              >
                Parent Dashboard
              </button>
            )}
          </nav>

          {/* Desktop User Menu & Theme Toggle */}
          <div className="hidden md:flex" style={{ position: 'relative', alignItems: 'center', gap: 'var(--space-sm)' }}>
            <LanguageSelector />
            <ThemeToggle />
            <button
              onClick={() => setShowMenu(!showMenu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-xs)',
                background: 'var(--color-bg-muted)',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                padding: 'var(--space-xs) var(--space-md)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-bg-elevated)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--color-bg-muted)';
              }}
              aria-label="User menu"
            >
              <User className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
              <span className="hidden lg:inline" style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-secondary)',
              }}>
                {user?.email}
              </span>
            </button>

            {showMenu && (
              <>
                <div
                  style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 10,
                  }}
                  onClick={() => setShowMenu(false)}
                  aria-hidden="true"
                />
                <div className="surface-elevated animate-fade-in" style={{
                  position: 'absolute',
                  right: 0,
                  marginTop: 'var(--space-xs)',
                  width: '192px',
                  padding: 'var(--space-xs)',
                  zIndex: 20,
                }}>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      router.push('/settings');
                    }}
                    style={{
                      width: '100%',
                      padding: 'var(--space-sm) var(--space-md)',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-xs)',
                      background: 'none',
                      border: 'none',
                      borderRadius: 'var(--radius-lg)',
                      color: 'var(--color-text-primary)',
                      fontSize: 'var(--text-sm)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--color-bg-muted)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'none';
                    }}
                  >
                    <Settings className="w-4 h-4" aria-hidden="true" />
                    Settings
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      handleLogout();
                    }}
                    style={{
                      width: '100%',
                      padding: 'var(--space-sm) var(--space-md)',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-xs)',
                      background: 'none',
                      border: 'none',
                      borderRadius: 'var(--radius-lg)',
                      color: 'hsl(0, 70%, 55%)',
                      fontSize: 'var(--text-sm)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'hsla(0, 70%, 95%, 1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'none';
                    }}
                  >
                    <LogOut className="w-4 h-4" aria-hidden="true" />
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
