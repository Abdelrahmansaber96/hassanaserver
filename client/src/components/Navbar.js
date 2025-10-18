import React, { useState } from 'react';
import { Search, Bell, Settings, User, Menu, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 fixed w-full top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Right side - Logo and name */}
          <div className="flex items-center">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">🏥</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">حصانة</h1>
                <p className="text-sm text-gray-500">نظام إدارة العيادة</p>
              </div>
            </div>
          </div>

          {/* Center - Search bar */}
          <div className="flex-1 flex justify-center px-4">
            <div className="max-w-lg w-full">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="البحث..."
                  className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Left side - Icons and mobile menu */}
          <div className="flex items-center space-x-4 space-x-reverse">
            {/* User Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="hidden md:block text-right">
                    <div className="text-sm font-medium text-gray-900">{user?.name || 'المستخدم'}</div>
                    <div className="text-xs text-gray-500">{user?.role || 'موظف'}</div>
                  </div>
                </div>
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                    <div className="text-sm text-gray-500">{user?.email}</div>
                  </div>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/settings');
                    }}
                    className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <Settings className="w-4 h-4 ml-2" />
                    الإعدادات
                  </button>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      handleLogout();
                    }}
                    className="w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                  >
                    <LogOut className="w-4 h-4 ml-2" />
                    تسجيل الخروج
                  </button>
                </div>
              )}
            </div>
            
            {/* Notifications */}
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors relative">
              <Bell className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;