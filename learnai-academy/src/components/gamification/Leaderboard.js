'use client';

import { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Crown, TrendingUp } from 'lucide-react';

const rankIcons = {
  1: { Icon: Crown, color: '#FBBF24', bg: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)' },
  2: { Icon: Trophy, color: '#94A3B8', bg: 'linear-gradient(135deg, #CBD5E1 0%, #94A3B8 100%)' },
  3: { Icon: Medal, color: '#CD7F32', bg: 'linear-gradient(135deg, #E5A872 0%, #CD7F32 100%)' },
};

export default function Leaderboard({ 
  entries = [], 
  currentUserId, 
  timeRange = 'week',
  maxEntries = 10 
}) {
  const [highlightedIndex, setHighlightedIndex] = useState(null);

  const getRankIcon = (rank) => {
    if (rank <= 3) {
      const config = rankIcons[rank];
      const { Icon, color, bg } = config;
      return (
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-full)',
            background: bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <Icon style={{ width: '18px', height: '18px', color: 'white' }} />
        </div>
      );
    }
    return (
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--color-bg-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--weight-bold)',
          color: 'var(--color-text-secondary)',
        }}
      >
        {rank}
      </div>
    );
  };

  const sortedEntries = [...entries]
    .sort((a, b) => (b.points || 0) - (a.points || 0))
    .slice(0, maxEntries);

  return (
    <div
      style={{
        background: 'var(--color-bg-elevated)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--color-border-subtle)',
        padding: 'var(--space-lg)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--space-lg)',
        }}
      >
        <h3
          style={{
            fontSize: 'var(--text-xl)',
            fontWeight: 'var(--weight-bold)',
            color: 'var(--color-text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-sm)',
          }}
        >
          <Trophy style={{ width: '24px', height: '24px', color: 'var(--color-accent)' }} />
          Leaderboard
        </h3>
        <div
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-tertiary)',
            textTransform: 'uppercase',
            fontWeight: 'var(--weight-semibold)',
            letterSpacing: '0.05em',
          }}
        >
          {timeRange === 'week' ? 'This Week' : timeRange === 'month' ? 'This Month' : 'All Time'}
        </div>
      </div>

      <div className="stack" style={{ gap: 'var(--space-xs)' }}>
        {sortedEntries.length === 0 ? (
          <div
            style={{
              padding: 'var(--space-xl)',
              textAlign: 'center',
              color: 'var(--color-text-secondary)',
            }}
          >
            No entries yet. Be the first!
          </div>
        ) : (
          sortedEntries.map((entry, index) => {
            const rank = index + 1;
            const isCurrentUser = entry.userId === currentUserId;
            const isHighlighted = highlightedIndex === index || isCurrentUser;

            return (
              <div
                key={entry.id || index}
                className={`leaderboard-entry ${isHighlighted ? 'highlighted' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-md)',
                  padding: 'var(--space-md)',
                  background: isCurrentUser
                    ? 'var(--color-accent-subtle)'
                    : isHighlighted
                    ? 'var(--color-bg-subtle)'
                    : 'transparent',
                  borderRadius: 'var(--radius-lg)',
                  border: isCurrentUser
                    ? '1px solid var(--color-accent)'
                    : '1px solid transparent',
                  transition: 'all var(--transition-base)',
                  cursor: 'pointer',
                  position: 'relative',
                }}
                onMouseEnter={() => setHighlightedIndex(index)}
                onMouseLeave={() => setHighlightedIndex(null)}
              >
                {/* Rank */}
                <div style={{ flexShrink: 0 }}>{getRankIcon(rank)}</div>

                {/* Avatar */}
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-full)',
                    background: isCurrentUser
                      ? 'var(--color-accent)'
                      : 'var(--color-bg-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--weight-bold)',
                    color: isCurrentUser ? 'white' : 'var(--color-text-primary)',
                    flexShrink: 0,
                  }}
                >
                  {entry.name?.charAt(0).toUpperCase() || '?'}
                </div>

                {/* Name and Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 'var(--text-base)',
                      fontWeight: isCurrentUser ? 'var(--weight-semibold)' : 'var(--weight-medium)',
                      color: 'var(--color-text-primary)',
                      marginBottom: 'var(--space-3xs)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2xs)',
                    }}
                  >
                    {entry.name || 'Anonymous'}
                    {isCurrentUser && (
                      <span
                        style={{
                          fontSize: 'var(--text-xs)',
                          color: 'var(--color-accent)',
                          fontWeight: 'var(--weight-semibold)',
                        }}
                      >
                        (You)
                      </span>
                    )}
                  </div>
                  {entry.gradeLevel && (
                    <div
                      style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--color-text-tertiary)',
                      }}
                    >
                      Grade {entry.gradeLevel}
                    </div>
                  )}
                </div>

                {/* Points */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: 'var(--space-3xs)',
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      fontSize: 'var(--text-lg)',
                      fontWeight: 'var(--weight-bold)',
                      color: 'var(--color-accent)',
                    }}
                  >
                    {entry.points?.toLocaleString() || 0}
                  </div>
                  <div
                    style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-tertiary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-3xs)',
                    }}
                  >
                    <TrendingUp style={{ width: '12px', height: '12px' }} />
                    {entry.streak || 0} day streak
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

