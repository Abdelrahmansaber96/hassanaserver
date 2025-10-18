import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area } from 'recharts';

// Fixed Area import issue
const OperationsChart = ({ data }) => {
  const chartData = data ? data.labels.map((label, index) => ({
    day: label,
    value: data.data[index] || 0
  })) : [
    { day: 'أكتوبر - 1', value: 35 },
    { day: 'أكتوبر - 2', value: 38 },
    { day: 'أكتوبر - 3', value: 40 },
    { day: 'أكتوبر - 4', value: 47 },
    { day: 'أكتوبر - 5', value: 44 },
    { day: 'أكتوبر - 6', value: 50 },
    { day: 'أكتوبر - 7', value: 62 },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-200">
          <p className="font-medium text-gray-900 mb-1">{`${label}`}</p>
          <div className="space-y-0.5 text-sm">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: '#22c55e' }}></span>
              <span>الحجوزات: {payload[0].value}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <LineChart data={chartData} margin={{ top: 10, right: 16, left: 12, bottom: 10 }}>
          <defs>
            <linearGradient id="opsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.04} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#f3f4f6" />
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6b7280' }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6b7280' }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#bfdbfe', strokeWidth: 1 }} />
          <Area type="monotone" dataKey="value" stroke="none" fill="url(#opsFill)" />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default OperationsChart;