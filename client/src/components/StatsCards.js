import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, MessageCircle, CreditCard, Users, Sheet, List, BarChart } from 'lucide-react';

const StatsCards = ({ selectedDate }) => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

  const authorizedFetch = (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
      ...(options.headers || {}),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Extract month and year from selectedDate
        const month = selectedDate.getMonth(); // 0-11
        const year = selectedDate.getFullYear();
        
        const response = await authorizedFetch(`/api/dashboard/stats?month=${month}&year=${year}`);
        if (response.ok) {
          const data = await response.json();
          const quickStats = data.data.quickStats;

          // Get month name in Arabic
          const monthsAr = [
            'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
            'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
          ];
          const monthName = monthsAr[selectedDate.getMonth()];
          
          const statsData = [
            {
              id: 1,
              title: 'إجمالي العملاء',
              value: quickStats.totalCustomers?.toLocaleString('ar-SA') || '0',
              change: '+12%',
              changeType: 'increase',
              icon: Users,
              color: 'blue',
            },
            {
              id: 2,
              title: `حجوزات ${monthName}`,
              value: quickStats.todayBookings?.toLocaleString('ar-SA') || '0',
              change: '+8%',
              changeType: 'increase',
              icon: List,
              color: 'green',
            },
            {
              id: 3,
              title: `استشارات ${monthName}`,
              value: quickStats.todayConsultations?.toLocaleString('ar-SA') || '0',
              change: '+15%',
              changeType: 'increase',
              icon: Phone,
              color: 'purple',
            },
            {
              id: 4,
              title: `تطعيمات ${monthName}`,
              value: quickStats.todayVaccinations?.toLocaleString('ar-SA') || '0',
              change: '+15%',
              changeType: 'increase',
              icon: BarChart,
              color: 'red',
            },
            {
              id: 5,
              title: `إيرادات ${monthName}`,
              value: `${quickStats.todayRevenue?.toLocaleString('ar-SA') || '0'} ريال`,
              change: '+5%',
              changeType: 'increase',
              icon: CreditCard,
              color: 'orange',
            },
          ];
          setStats(statsData);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [selectedDate]);

  const getColorClasses = (color) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600',
      orange: 'from-orange-500 to-orange-600',
    };
    return colors[color] || colors.blue;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;

        return (
          <motion.div
            key={stat.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -5 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </p>
                <span className="inline-flex items-center text-sm font-medium text-green-600">
                  {stat.change}
                  <span className="mr-1">↗</span>
                </span>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-r ${getColorClasses(stat.color)}`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default StatsCards;