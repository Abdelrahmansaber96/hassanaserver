import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../images/حصانة -لوقو 11 3.png';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  MapPin, 
  Phone, 
  Gift,
  Bell,
  Settings, 
  LogOut,
  X,
  Stethoscope,
  Syringe
} from 'lucide-react';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard, path: '/' },
    { id: 'customers', label: 'إدارة العملاء', icon: Users, path: '/customers' },
    { id: 'bookings', label: 'إدارة الحجوزات', icon: Calendar, path: '/bookings' },
    { id: 'vaccinations', label: 'إدارة التطعيمات', icon: Syringe, path: '/vaccinations' },
    { id: 'branches', label: 'إدارة الفروع', icon: MapPin, path: '/branches' },
    { id: 'doctors', label: 'إدارة الأطباء', icon: Stethoscope, path: '/doctors' },
    { id: 'consultations', label: 'الاستشارات', icon: Phone, path: '/consultations' },
    { id: 'notifications', label: 'الإشعارات', icon: Bell, path: '/notifications' },
    { id: 'settings', label: 'الإعدادات', icon: Settings, path: '/settings' },
  ];

  const handleItemClick = (item) => {
    navigate(item.path);
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
        initial={{ x: '100%' }}
        animate={{ x: sidebarOpen || window.innerWidth >= 1024 ? 0 : '100%' }}
        transition={{ duration: 0.3 }}
      >
        {/* Close button for mobile */}
        <div className="lg:hidden flex justify-start p-4">
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
          <div className="p-4 flex items-center justify-center gap-2">
            <img src={logo} alt="Logo" className="h-`11`" />
            <h2 className="text-lg blue-500 text-4xl text-blue-600 font-bold text-center">حصانة</h2>
          </div>
        {/* Navigation */}
        <nav className="mt-16 lg:mt-20 px-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleItemClick(item)}
                    className={`w-full flex items-center px-4 py-3 text-right rounded-xl transition-all duration-200 ${
                      active
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ml-3 ${active ? 'text-white' : 'text-gray-500'}`} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}
            
            {/* Logout Button */}
            <li className="pt-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-3 text-right rounded-xl transition-all duration-200 text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-5 h-5 ml-3" />
                <span className="font-medium">تسجيل الخروج</span>
              </button>
            </li>
          </ul>
        </nav>
      </motion.div>
    </>
  );
};

export default Sidebar;