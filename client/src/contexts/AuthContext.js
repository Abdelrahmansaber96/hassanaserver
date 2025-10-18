import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // تحقق من وجود token في localStorage عند تحميل التطبيق
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        
        // التحقق من صلاحية التوكن
        const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
        fetch(`${API_BASE_URL}/api/dashboard/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        .then(response => {
          if (response.status === 401) {
            // التوكن غير صالح، احذفه
            console.log('Token is invalid, clearing...');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          } else {
            // التوكن صالح
            setUser(parsedUser);
          }
        })
        .catch(error => {
          console.error('Error verifying token:', error);
          setUser(parsedUser); // استخدم البيانات المحفوظة
        });
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // دالة لإعادة المحاولة عند فشل الاتصال
  const fetchWithRetry = async (url, options, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, options);
        return response;
      } catch (error) {
        console.log(`Attempt ${i + 1} failed:`, error.message);
        if (i === retries - 1) throw error;
        // انتظار متزايد بين المحاولات
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  };

  // تسجيل الدخول
  const login = async (email, password) => {
    try {
      console.log('Attempting login with:', { email, password: '***' });
      
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      const response = await fetchWithRetry(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok && data.success) {
        console.log('Login successful, storing data...');
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        setUser(data.data.user);
        console.log('User set:', data.data.user);
        return { success: true };
      } else {
        console.log('Login failed:', data.message);
        return { success: false, message: data.message || 'خطأ في تسجيل الدخول' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'خطأ في الاتصال بالخادم' };
    }
  };

  // تسجيل الخروج
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // التحقق من صلاحية المستخدم
  const hasPermission = (permission) => {
    if (!user) return false;
    return user.permissions?.includes(permission) || user.role === 'admin';
  };

  const value = {
    user,
    login,
    logout,
    hasPermission,
    loading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};