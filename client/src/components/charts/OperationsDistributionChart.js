import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const colors = ['#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'];

const OperationsDistributionChart = ({ data }) => {
  const segments = data ? data.map((item, index) => ({
    name: item.name,
    value: item.value,
    color: colors[index % colors.length],
    percentage: item.percentage || Math.round((item.value / data.reduce((sum, d) => sum + d.value, 0)) * 100)
  })) : [
    { name: 'الإبل 🐪', value: 120, color: '#3b82f6', percentage: 45 },
    { name: 'الأغنام 🐑', value: 70, color: '#60a5fa', percentage: 30 },
    { name: 'الماعز 🐐', value: 40, color: '#93c5fd', percentage: 25 },
  ];

  const total = segments.reduce((s, x) => s + x.value, 0);

// SVG-based label callout attached to each arc
const renderCalloutLabel = (segments, total) => (props) => {
  const { cx, cy, midAngle, outerRadius, index } = props;
  const RAD = Math.PI / 180;
  const offset = 18; // distance from outerRadius
  const r = outerRadius + offset;
  const x = cx + r * Math.cos(-midAngle * RAD);
  const y = cy + r * Math.sin(-midAngle * RAD);

  const seg = segments[index];
  const pct = seg.percentage || Math.round((seg.value / total) * 100);

  const boxW = 78;
  const boxH = 24;
  const rx = 10;
  const bx = x - boxW / 2;
  const by = y - boxH / 2;

  return (
    <g>
      <rect x={bx} y={by} width={boxW} height={boxH} rx={rx} ry={rx} fill="#fff" stroke="#e5e7eb" />
      {/* dot */}
      <circle cx={bx + boxW - 10} cy={by + boxH / 2} r={3} fill={seg.color} />
      {/* text */}
      <text x={bx + 50} y={by + 14} fill="#374151" fontSize={10}>
        {seg.name.replace(':', '')}: {pct}%
      </text>
    </g>
  );
};

const CenterLabel = ({ left, right, subtitle }) => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
    <div className="text-center">
      <div className="text-3xl font-extrabold text-gray-900 tracking-tight">{left} / {right}</div>
      <div className="text-xs text-gray-500 mt-1">{subtitle}</div>
    </div>
  </div>
);
  return (
    <div style={{ width: '100%', height: 280 }} className="relative">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={segments}
            innerRadius={68}
            outerRadius={102}
            paddingAngle={2}
            cornerRadius={10}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCalloutLabel(segments, total)}
          >
            {segments.map((s, i) => (
              <Cell key={s.name} fill={s.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Center metric */}
      <CenterLabel
        left={segments[0]?.value || 0}
        right={segments[1]?.value || 0}
        subtitle={`${segments[0]?.name || 'الإبل'} / ${segments[1]?.name || 'الأغنام'}`}
      />

      {/* Bottom legend */}
      <div className={`grid grid-cols-${Math.min(segments.length, 3)} gap-4  text-sm`} dir="rtl">
        {segments.slice(0, 2).map((seg, index) => (
          <div key={seg.name} className="flex items-center justify-between">
            <div>
              <span className="text-gray-700">{seg.name}:</span>
              <span className="font-semibold mr-1">{seg.value} وحدة</span>
            </div>
            <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }}></span>
          </div>
        ))}
        {segments.length > 2 && (
          <div className="flex items-center justify-center gap-2 col-span-2">
            {segments.slice(2).map((seg, index) => (
              <div key={seg.name} className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }}></span>
                <span className="text-gray-700">{seg.name}:</span>
                <span className="font-semibold mr-1">{seg.value} وحدة</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OperationsDistributionChart;