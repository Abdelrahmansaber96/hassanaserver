import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ServerStatusNotification from './components/ServerStatusNotification';
import Login from './pages/Login';
import Customers from './pages/Customers';
import Bookings from './pages/Bookings';
import BranchesNew from './pages/BranchesNew';
import Consultations from './pages/Consultations';
import Doctors from './pages/Doctors';
import Notifications from './pages/Notifications';
import Vaccinations from './pages/Vaccinations';

// مكون لحماية الصفحات (يتطلب تسجيل دخول)
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// مكون لتخطيط لوحة التحكم
const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Navbar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
      />
      
      <div className="flex">
        <Sidebar 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
        />
        
        <motion.main 
          className="flex-1 lg:mr-64 transition-all duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* صفحة تسجيل الدخول */}
          <Route path="/login" element={<Login />} />
          
          {/* الصفحات المحمية */}
          <Route path="/" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/customers" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Customers />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/bookings" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Bookings />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/branches" element={
            <ProtectedRoute>
              <DashboardLayout>
                <BranchesNew />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/consultations" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Consultations />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/doctors" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Doctors />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/notifications" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Notifications />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/vaccinations" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Vaccinations />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          {/* إعادة توجيه إلى الصفحة الرئيسية */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
      <ServerStatusNotification />
    </AuthProvider>
  );
}

export default App;