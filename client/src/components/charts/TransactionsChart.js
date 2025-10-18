import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = {
  revenue: '#10b981', // emerald for revenue
  transactions: '#3b82f6',   // blue for transaction count
};

const TransactionsChart = ({ data }) => {
  const chartData = data ? data.labels.map((label, index) => ({
    day: label,
    إيرادات: data.revenue[index] || 0,
    معاملات: data.transactions[index] || 0,
  })) : [
    {
      day: 'الإثنين',
      إيرادات: 12000,
      معاملات: 25,
    },
    {
      day: 'الثلاثاء',
      إيرادات: 15000,
      معاملات: 30,
    },
    {
      day: 'الأربعاء',
      إيرادات: 18000,
      معاملات: 35,
    },
    {
      day: 'الخميس',
      إيرادات: 20000,
      معاملات: 40,
    },
    {
      day: 'الجمعة',
      إيرادات: 17000,
      معاملات: 32,
    },
    {
      day: 'السبت',
      إيرادات: 22000,
      معاملات: 45,
    },
    {
      day: 'الأحد',
      إيرادات: 16000,
      معاملات: 28,
    },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-200">
          <p className="font-medium text-gray-900 mb-1">{label}</p>
          <div className="space-y-0.5 text-sm">
            {payload.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                <span>{entry.dataKey}: {
                  entry.dataKey === 'إيرادات' ? 
                    `${entry.value.toLocaleString('ar-SA')} ريال` : 
                    entry.value
                }</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height: 300 }} dir="rtl">
      <ResponsiveContainer>
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
          barCategoryGap="30%"
        >
          <CartesianGrid vertical={false} stroke="#f3f4f6" />
          <XAxis 
            dataKey="day" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f8' }} />
          <Bar 
            dataKey="إيرادات"
            fill={COLORS.revenue}
            radius={[6, 6, 0, 0]}
            maxBarSize={35}
          />
          <Bar 
            dataKey="معاملات"
            fill={COLORS.transactions}
            radius={[6, 6, 0, 0]}
            maxBarSize={35}
          />
        </BarChart>
      </ResponsiveContainer>
      
      {/* Legend */}
      <div className="flex justify-center items-center gap-6 mt-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.revenue }}></span>
          <span className="text-gray-700">الإيرادات</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.transactions }}></span>
          <span className="text-gray-700">المعاملات</span>
        </div>
      </div>
    </div>
  );
};

export default TransactionsChart;