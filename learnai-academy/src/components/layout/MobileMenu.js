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
        style={{
          padding: 'var(--space-xs)',
          borderRadius: 'var(--radius-lg)',
          background: 'none',
          border: 'none',
          color: 'var(--color-text-primary)',
          cursor: 'pointer',
          transition: 'all var(--transition-fast)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--color-bg-muted)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'none';
        }}
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 40,
            }}
            onClick={() => setIsOpen(false)}
          />

          {/* Slide-out Menu */}
          <div className="glass animate-slide-in-right" style={{
            position: 'fixed',
            top: 0,
            bottom: 0,
            right: 0,
            width: '256px',
            boxShadow: 'var(--shadow-xl)',
            zIndex: 50,
            overflowY: 'auto',
          }}>
            {/* Header */}
            <div style={{
              padding: 'var(--space-md)',
              borderBottom: '1px solid var(--color-border-subtle)',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 'var(--space-md)',
              }}>
                <span style={{
                  fontSize: 'var(--text-xl)',
                  fontWeight: 'var(--weight-bold)',
                  color: 'var(--color-text-primary)',
                }}>Menu</span>
                <button
                  onClick={() => setIsOpen(false)}
                  style={{
                    padding: 'var(--space-xs)',
                    borderRadius: 'var(--radius-lg)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-secondary)',
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
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-secondary)',
              }}>
                {user?.email}
              </div>
            </div>

            {/* Navigation */}
            <nav style={{
              padding: 'var(--space-md)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-xs)',
            }}>
              {navItems.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigate(item.path)}
                    className="animate-fade-in"
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-sm)',
                      padding: 'var(--space-sm) var(--space-md)',
                      borderRadius: 'var(--radius-lg)',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      color: 'var(--color-text-primary)',
                      fontSize: 'var(--text-base)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                      animationDelay: `${idx * 30}ms`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--color-bg-muted)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'none';
                    }}
                  >
                    <Icon className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              {/* Divider */}
              <div style={{
                height: '1px',
                background: 'var(--color-border-subtle)',
                margin: 'var(--space-md) 0',
              }} />

              {/* Settings */}
              <button
                onClick={() => {
                  handleNavigate('/settings');
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-sm)',
                  padding: 'var(--space-sm) var(--space-md)',
                  borderRadius: 'var(--radius-lg)',
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  color: 'var(--color-text-primary)',
                  fontSize: 'var(--text-base)',
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
                <Settings className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
                <span>Settings</span>
              </button>

              {/* Logout */}
              <button
                onClick={() => {
                  onLogout();
                  setIsOpen(false);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-sm)',
                  padding: 'var(--space-sm) var(--space-md)',
                  borderRadius: 'var(--radius-lg)',
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  color: 'hsl(0, 70%, 55%)',
                  fontSize: 'var(--text-base)',
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

