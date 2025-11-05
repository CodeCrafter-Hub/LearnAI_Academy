'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { format } from 'date-fns';

export default function ProgressChart({ data, type = 'line' }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        No data to display yet. Start learning to see your progress!
      </div>
    );
  }

  const formattedData = data.map(d => ({
    ...d,
    date: format(new Date(d.date), 'MMM dd'),
  }));

  if (type === 'bar') {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="minutes" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="minutes"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ fill: '#3b82f6' }}
        />
        <Line
          type="monotone"
          dataKey="points"
          stroke="#10b981"
          strokeWidth={2}
          dot={{ fill: '#10b981' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
