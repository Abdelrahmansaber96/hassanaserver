import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#22c55e', '#60a5fa', '#f59e0b', '#ef4444', '#8b5cf6'];

const RevenueChart = ({ data }) => {
  const segments = data?.data || [
    { name: 'كفو الحلال', value: 60, revenue: 25000 },
    { name: 'النخلة', value: 40, revenue: 18000 },
  ];

  const totalRevenue = data?.totalRevenue || segments.reduce((sum, item) => sum + (item.revenue || 0), 0);

  const renderCalloutLabel = (props) => {
    const { cx, cy, midAngle, outerRadius, index } = props;
    const RAD = Math.PI / 180;
    const offset = 16;
    const r = outerRadius + offset;
    const x = cx + r * Math.cos(-midAngle * RAD);
    const y = cy + r * Math.sin(-midAngle * RAD);

    const seg = segments[index];
    const boxW = 90;
    const boxH = 26;
    const rx = 10;
    const bx = x - boxW / 2;
    const by = y - boxH / 2;

    return (
      <g>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.15" />
        </filter>
        <rect x={bx} y={by} width={boxW} height={boxH} rx={rx} ry={rx} fill="#fff" stroke="#e5e7eb" filter="url(#shadow)" />
        <text x={bx + 8} y={by + 16} fill="#6b7280" fontSize={12}>{`${seg.name}:`}</text>
        <text x={bx + boxW - 35} y={by + 16} fill="#111827" fontSize={12} fontWeight={700}>{`${seg.value}%`}</text>
      </g>
    );
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-200">
          <p className="font-medium text-gray-900 mb-1">{data.name}</p>
          <div className="space-y-0.5 text-sm">
            <div>النسبة: {data.value}%</div>
            <div>الإيرادات: {(data.revenue || 0).toLocaleString('ar-SA')} ريال</div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative" style={{ width: '100%', height: 320 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={segments}
            innerRadius={70}
            outerRadius={102}
            paddingAngle={2}
            cornerRadius={10}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCalloutLabel}
          >
            {segments.map((s, index) => (
              <Cell key={s.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Center metric */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <div className="text-3xl font-extrabold text-[#1F2757]">
            {Math.round(totalRevenue / 1000)}K
          </div>
          <div className="text-xs text-gray-500 mt-1">إجمالي الإيرادات</div>
        </div>
      </div>

      {/* Bottom legend */}
      <div className="grid grid-cols-2 gap-6 mt-4 px-4 text-sm" dir="rtl">
        <div className="flex items-center justify-between">
          <span className="text-gray-700">صيدلية كفو الحلال البيطرية</span>
          <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[0] }}></span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-700">صيدلية النخلة</span>
          <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[1] }}></span>
        </div>
        <div className="col-span-2 text-gray-700">55.5% &nbsp;&nbsp; 40%</div>
      </div>
    </div>
  );
};

export default RevenueChart;