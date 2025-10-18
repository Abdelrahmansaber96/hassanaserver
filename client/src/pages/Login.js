import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Activity } from 'lucide-react';
import logo from '../images/حصانة -لوقو 11 3.png';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // إذا كان المستخدم مسجل دخول بالفعل، إعادة توجيه إلى لوحة التحكم
  useEffect(() => {
    console.log('Login useEffect - isAuthenticated:', isAuthenticated);
    if (isAuthenticated) {
      console.log('User is authenticated, navigating to dashboard...');
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('Submitting login form...');
    const result = await login(formData.email, formData.password);
    console.log('Login result:', result);
    
    if (result.success) {
      // التحويل إلى لوحة التحكم عند نجاح تسجيل الدخول
      console.log('Login successful, navigating to dashboard...');
      navigate('/');
    } else {
      console.log('Login failed:', result.message);
      setError(result.message);
    }
    
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // حسابات تجريبية للاختبار السريع
  const testAccounts = [
    { email: 'admin@clinic.com', password: 'password123', role: 'مدير النظام' },
    { email: 'doctor1@clinic.com', password: 'password123', role: 'طبيب' },
    { email: 'staff1@clinic.com', password: 'password123', role: 'موظف' }
  ];

  const handleTestLogin = (account) => {
    setFormData({
      email: account.email,
      password: account.password
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
          <div className="flex justify-center mb-6">
            <div >
              <img src={logo} className="img-fluid rounded-full" alt="Logo" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            سجّل الدخول إلى حصانة الآن
          </h2>
         
        </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                البريد الإلكتروني
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="أدخل البريد الإلكتروني"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 pl-10"
                  placeholder="أدخل كلمة المرور"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute left-3 top-2.5 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <LogIn className="h-5 w-5 ml-2" />
                  تسجيل الدخول
                </>
              )}
            </button>
          </form>

          {/* Test Accounts */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-4">حسابات تجريبية للاختبار:</h3>
            <div className="space-y-2">
              {testAccounts.map((account, index) => (
                <button
                  key={index}
                  onClick={() => handleTestLogin(account)}
                  className="w-full text-right p-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <div className="text-sm font-medium text-gray-900">{account.role}</div>
                  <div className="text-xs text-gray-600">{account.email}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;