import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import OperationsChart from './charts/OperationsChart';
import OperationsDistributionChart from './charts/OperationsDistributionChart';
import RevenueChart from './charts/RevenueChart';
import TransactionsChart from './charts/TransactionsChart';
import { RefreshCcw, TrendingUp } from 'lucide-react';

const ChartsGrid = ({ selectedDate }) => {
  const [chartsData, setChartsData] = useState({
    operations: null,
    revenue: null,
    distribution: null,
    transactions: null
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  const fetchChartsData = async () => {
    try {
      // Extract month and year from selectedDate
      const month = selectedDate.getMonth(); // 0-11
      const year = selectedDate.getFullYear();
      
      const [operationsRes, revenueRes, distributionRes, transactionsRes] = await Promise.all([
        authorizedFetch(`/api/dashboard/charts/operations?month=${month}&year=${year}`),
        authorizedFetch('/api/dashboard/charts/revenue'),
        authorizedFetch('/api/dashboard/charts/operations-distribution'),
        authorizedFetch('/api/dashboard/charts/transactions?period=7days')
      ]);

      const operations = operationsRes.ok ? await operationsRes.json() : null;
      const revenue = revenueRes.ok ? await revenueRes.json() : null;
      const distribution = distributionRes.ok ? await distributionRes.json() : null;
      const transactions = transactionsRes.ok ? await transactionsRes.json() : null;

      setChartsData({
        operations: operations?.data || null,
        revenue: revenue?.data || null,
        distribution: distribution?.data || null,
        transactions: transactions?.data || null
      });
    } catch (error) {
      console.error('Error fetching charts data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchChartsData();
  }, [selectedDate]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchChartsData();
  };

  const totalVaccinations = chartsData?.distribution?.reduce((sum, item) => sum + item.value, 0) || 0;
  
  // Get month name in Arabic
  const getMonthName = () => {
    const monthsAr = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    return monthsAr[selectedDate.getMonth()];
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Operations Line Chart */}
      <motion.div
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="mb-4 flex items-start justify-between gap-4" dir="rtl">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">إجمالي التطعيمات الكلي </h3>
            <div className="flex items-center gap-4 text-sm">
             <div className="text-right">
            <div className='flex justify-center items-center'>
              <div className="text-3xl font-extrabold text-emerald-600 me-4">
                {chartsData?.operations?.data?.reduce((sum, val) => sum + val, 0) || 0}
              </div>
              <div className="text-xs text-gray-500 mb-1">حجز شهر {getMonthName()}</div>
            </div>
          </div>
            </div>
          </div>
           <div>
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-1 text-blue-600 mb-4 hover:text-blue-700 disabled:opacity-50"
            >
               {refreshing ? 'جاري التحديث...' : 'تحديث'}
                <RefreshCcw className={`mr-1 ${refreshing ? 'animate-spin' : ''}`} size={14} />
              </button>
              <span className="flex items-center gap-1 text-green-600">
                % 12.5+
                <TrendingUp className='mr-1' size={14} />
              </span>
           </div>
        </div>
        <OperationsChart data={chartsData?.operations} />
      </motion.div>

      {/* Operations Distribution Pie Chart */}
      <motion.div
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="mb-4 flex items-start justify-between gap-4" dir="rtl">
          <div className="text-right">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">نسبة توزيع الحيوانات</h3>
            <div className="text-xs text-gray-500">إجمالي الحجوزات حسب نوع الحيوان</div>
          </div>
          <div className="text-left text-sm text-blue-600 flex items-center gap-1">
            {totalVaccinations} إجمالي
          </div>
        </div>
        <OperationsDistributionChart data={chartsData?.distribution} />
      </motion.div>

      {/* Revenue Donut Chart */}
      <motion.div
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="mb-4 flex items-start justify-between gap-4" dir="rtl">
          <div className="text-right">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">الإيرادات حسب الفرع</h3>
            <div className="text-xs text-gray-500">
              {chartsData?.revenue?.totalRevenue ? 
                `إجمالي: ${chartsData.revenue.totalRevenue.toLocaleString('ar-SA')} ${chartsData.revenue.currency}` : 
                'لا توجد بيانات'
              }
            </div>
          </div>
          <div className="text-left text-sm text-green-600 flex items-center gap-1">
            % {chartsData?.revenue?.data?.[0]?.value || 0} الأعلى
          </div>
        </div>
        <RevenueChart data={chartsData?.revenue} />
      </motion.div>

      {/* Transactions Bar Chart */}
      <motion.div
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <div className="mb-4 flex items-start justify-between gap-4" dir="rtl">
          <div className="text-right">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">المعاملات المالية</h3>
            <div className="text-xs text-gray-500">
              {chartsData?.transactions?.revenue ? 
                `إجمالي الأسبوع: ${chartsData.transactions.revenue.reduce((sum, val) => sum + val, 0).toLocaleString('ar-SA')} ${chartsData.transactions.currency}` : 
                'آخر 7 أيام'
              }
            </div>
          </div>
          <div className="text-left text-sm text-blue-600 flex items-center gap-1">
            {chartsData?.transactions?.transactions?.reduce((sum, val) => sum + val, 0) || 0} معاملة
          </div>
        </div>
        <TransactionsChart data={chartsData?.transactions} />
      </motion.div>
    </div>
  );
};

export default ChartsGrid;