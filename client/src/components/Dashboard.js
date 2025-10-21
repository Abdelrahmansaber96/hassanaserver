import React, { useState } from 'react';
import { motion } from 'framer-motion';
import StatsCards from './StatsCards';
import ChartsGrid from './ChartsGrid';
import CustomersTableCard from './CustomersTableCard';
import CalendarSlider from './CalendarSlider';

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };

  return (
    <div className="p-6 pt-24 mt-10">
      {/* Page Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-gray-600 mb-2">لوحة التحكم</p>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">لوحة التحكم الخاصة بحصانة</h1>
          </div>
          <CalendarSlider 
            className="w-auto" 
            value={selectedDate}
            onChange={handleDateChange}
          />
        </div>
       
      </motion.div>

      {/* Stats Cards */}
      <StatsCards selectedDate={selectedDate} />

      {/* Charts Grid */}
      <ChartsGrid selectedDate={selectedDate} />

      {/* Customers table card */}
      <div className="mt-6">
        <CustomersTableCard />
      </div>
    </div>
  );
};

export default Dashboard;