'use client';

import { useEffect, useRef, useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function ProgressChart({ data, type = 'line', height = 200, showTrend = true }) {
  const canvasRef = useRef(null);
  const [trend, setTrend] = useState(null);

  useEffect(() => {
    if (!canvasRef.current || !data || data.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${height}px`;

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, height);

    // Calculate trend
    if (data.length >= 2) {
      const first = data[0].value;
      const last = data[data.length - 1].value;
      const change = ((last - first) / first) * 100;
      setTrend(change > 0 ? 'up' : change < 0 ? 'down' : 'neutral');
    }

    // Prepare data
    const values = data.map(d => d.value);
    const maxValue = Math.max(...values, 1);
    const minValue = Math.min(...values, 0);
    const range = maxValue - minValue || 1;
    const padding = 20;
    const chartWidth = rect.width - padding * 2;
    const chartHeight = height - padding * 2;

    // Draw grid
    ctx.strokeStyle = 'var(--color-border-subtle)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(rect.width - padding, y);
      ctx.stroke();
    }

    if (type === 'line') {
      // Draw line chart
      ctx.strokeStyle = 'var(--color-accent)';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();

      data.forEach((point, index) => {
        const x = padding + (chartWidth / (data.length - 1 || 1)) * index;
        const y = padding + chartHeight - ((point.value - minValue) / range) * chartHeight;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();

      // Draw points
      ctx.fillStyle = 'var(--color-accent)';
      data.forEach((point, index) => {
        const x = padding + (chartWidth / (data.length - 1 || 1)) * index;
        const y = padding + chartHeight - ((point.value - minValue) / range) * chartHeight;
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw gradient fill
      const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
      gradient.addColorStop(0, 'rgba(139, 92, 246, 0.2)');
      gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(padding, height - padding);
      
      data.forEach((point, index) => {
        const x = padding + (chartWidth / (data.length - 1 || 1)) * index;
        const y = padding + chartHeight - ((point.value - minValue) / range) * chartHeight;
        ctx.lineTo(x, y);
      });
      
      ctx.lineTo(rect.width - padding, height - padding);
      ctx.closePath();
      ctx.fill();
    } else if (type === 'bar') {
      // Draw bar chart
      const barWidth = chartWidth / data.length;
      const barSpacing = barWidth * 0.2;

      data.forEach((point, index) => {
        const barHeight = ((point.value - minValue) / range) * chartHeight;
        const x = padding + index * barWidth + barSpacing;
        const y = padding + chartHeight - barHeight;
        const width = barWidth - barSpacing * 2;

        // Gradient for bars
        const gradient = ctx.createLinearGradient(0, y, 0, height - padding);
        gradient.addColorStop(0, 'var(--color-accent)');
        gradient.addColorStop(1, 'var(--color-primary)');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, width, barHeight);
      });
    }

    // Draw labels
    ctx.fillStyle = 'var(--color-text-tertiary)';
    ctx.font = '12px Inter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    data.forEach((point, index) => {
      const x = padding + (chartWidth / (data.length - 1 || 1)) * index;
      if (point.label) {
        ctx.fillText(point.label, x, height - padding + 8);
      }
    });

  }, [data, type, height]);

  return (
    <div
      style={{
        position: 'relative',
        background: 'var(--color-bg-elevated)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-lg)',
        border: '1px solid var(--color-border-subtle)',
      }}
    >
      {showTrend && trend && (
        <div
          style={{
            position: 'absolute',
            top: 'var(--space-md)',
            right: 'var(--space-md)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2xs)',
            padding: 'var(--space-2xs) var(--space-sm)',
            background: trend === 'up' 
              ? 'var(--color-success-subtle)' 
              : trend === 'down' 
              ? 'var(--color-error-subtle)' 
              : 'var(--color-bg-muted)',
            borderRadius: 'var(--radius-full)',
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--weight-semibold)',
            color: trend === 'up' 
              ? 'var(--color-success)' 
              : trend === 'down' 
              ? 'var(--color-error)' 
              : 'var(--color-text-secondary)',
          }}
        >
          {trend === 'up' && <TrendingUp style={{ width: '14px', height: '14px' }} />}
          {trend === 'down' && <TrendingDown style={{ width: '14px', height: '14px' }} />}
          {trend === 'neutral' && <Minus style={{ width: '14px', height: '14px' }} />}
          <span>
            {data.length >= 2 && (
              <>
                {trend === 'up' ? '+' : ''}
                {(((data[data.length - 1].value - data[0].value) / data[0].value) * 100).toFixed(1)}%
              </>
            )}
          </span>
        </div>
      )}

      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: `${height}px`,
          display: 'block',
        }}
      />
    </div>
  );
}

