import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Calendar, Filter, MoreVertical, Bell, Users, Clock, CheckCircle2, AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [customers, setCustomers] = useState([]); // إضافة state للعملاء
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('أكتوبر 2025');
  const [selectedFilter, setSelectedFilter] = useState('الكل');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'general',
    priority: 'medium',
    recipients: 'all', // all, customers, doctors, staff, admins, specific
    animalType: '', // تخصيص حسب نوع الحيوان (جديد)
    branchSpecific: false, // إرسال لعملاء الفرع فقط (جديد)
    specificRecipients: [],
    channels: ['app'],
    scheduledAt: '',
    status: 'draft'
  });

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

  // جلب الإشعارات من API
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await authorizedFetch('/api/notifications');
      
      console.log('Notifications response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Notifications response data:', data);
        const notificationsList = data.data?.notifications || data.data || data || [];
        console.log('Notifications list:', notificationsList);
        setNotifications(notificationsList);
      } else {
        console.error('Failed to fetch notifications:', response.status);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // جلب العملاء للتخصيص (للطبيب: عملاء فرعه فقط، للأدمن: كل العملاء)
  const fetchCustomers = async () => {
    try {
      const response = await authorizedFetch('/api/customers');
      if (response.ok) {
        const data = await response.json();
        setCustomers(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchCustomers(); // جلب العملاء عند تحميل الصفحة
  }, []);

  // إرسال إشعار جديد
  const handleSendNotification = async (e) => {
    e.preventDefault();
    
    // السماح للأدمن والطبيب بإرسال الإشعارات
    if (!user || (user.role !== 'admin' && user.role !== 'doctor')) {
      alert('ليس لديك صلاحية لإرسال الإشعارات');
      return;
    }

    try {
      // تجهيز البيانات للإرسال
      const notificationData = {
        ...formData,
        userRole: user.role, // إرسال دور المستخدم
        userBranch: user.branch || null // إرسال فرع الطبيب إن وجد
      };

      console.log('Sending notification data:', notificationData);
      
      const response = await authorizedFetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notificationData)
      });

      const data = await response.json();
      console.log('Response:', data);

      if (response.ok) {
        await fetchNotifications();
        setShowForm(false);
        setFormData({
          title: '',
          message: '',
          type: 'general',
          priority: 'medium',
          recipients: 'all',
          animalType: '',
          branchSpecific: false,
          specificRecipients: [],
          channels: ['app'],
          scheduledAt: '',
          status: 'draft'
        });
        alert('تم إرسال الإشعار بنجاح');
      } else {
        // عرض الأخطاء بالتفصيل
        let errorMessage = 'حدث خطأ أثناء الإرسال';
        if (data.errors && Array.isArray(data.errors)) {
          errorMessage = data.errors.map(err => `${err.field}: ${err.message}`).join('\n');
        } else if (data.message) {
          errorMessage = data.message;
        }
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('حدث خطأ أثناء الإرسال');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // تصفية الإشعارات
  const filteredNotifications = notifications.filter(notification => {
    if (selectedFilter === 'الكل') return true;
    if (selectedFilter === 'مُرسل') return notification.status === 'sent';
    if (selectedFilter === 'مجدول') return notification.status === 'scheduled';
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedNotifications = filteredNotifications.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 lg:mr-5 p-6" dir="rtl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">لوحة إدارة الإشعارات والتسجيل الخاص بها</h1>
            <p className="text-sm text-gray-600 mt-1">إرسال الإشعارات للعملاء وإدارة الإشعارات المرسلة</p>
          </div>
        </div>
      </div>

      {/* Notification Form Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Send className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">إرسال إشعار جديد</h2>
        </div>

        <form onSubmit={handleSendNotification} className="space-y-5">
          {/* عنوان الإشعار */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
              عنوان الإشعار
            </label>
            <input
              type="text"
              name="title"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
              value={formData.title}
              onChange={handleChange}
              placeholder="أدخل عنوان الإشعار"
            />
          </div>

          {/* النص */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
              النص
            </label>
            <textarea
              name="message"
              required
              rows="4"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-right resize-none"
              value={formData.message}
              onChange={handleChange}
              placeholder="اكتب نص الإشعار هنا..."
            />
          </div>

          {/* الفئة المستهدفة */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
              الفئة المستهدفة
            </label>
            <select
              name="recipients"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
              value={formData.recipients}
              onChange={handleChange}
            >
              <option value="all">الجميع</option>
              <option value="customers">العملاء فقط</option>
              <option value="doctors">الأطباء فقط</option>
              <option value="staff">الموظفين فقط</option>
              <option value="admins">المديرين فقط</option>
              <option value="specific">مستخدمين محددين</option>
            </select>
          </div>

          {/* تخصيص حسب نوع الحيوان (للعملاء فقط) */}
          {formData.recipients === 'customers' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                🐪 تخصيص حسب نوع الحيوان (اختياري)
              </label>
              <select
                name="animalType"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-right bg-white"
                value={formData.animalType}
                onChange={handleChange}
              >
                <option value="">جميع أنواع الحيوانات</option>
                <option value="camel">الإبل 🐪</option>
                <option value="sheep">الأغنام 🐑</option>
                <option value="goat">الماعز 🐐</option>
                <option value="cow">الأبقار 🐄</option>
                <option value="horse">الخيول 🐎</option>
              </select>
              <p className="text-xs text-blue-600 mt-2">
                💡 اختر نوع حيوان معين لإرسال الإشعار فقط لأصحاب هذا النوع
              </p>
            </div>
          )}

          {/* تخصيص حسب الفرع (للطبيب) */}
          {user?.role === 'doctor' && formData.recipients === 'customers' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="branchSpecific"
                  name="branchSpecific"
                  checked={formData.branchSpecific}
                  onChange={(e) => setFormData(prev => ({ ...prev, branchSpecific: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="branchSpecific" className="text-sm font-medium text-gray-700">
                  🏥 إرسال لعملاء فرعي فقط
                </label>
              </div>
              <p className="text-xs text-green-600 mt-2 mr-6">
                ✅ سيتم إرسال الإشعار للعملاء الذين لديهم حجوزات في فرعك فقط
              </p>
            </div>
          )}

          {/* معلومات للطبيب */}
          {user?.role === 'doctor' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                ℹ️ <strong>ملاحظة:</strong> كطبيب، يمكنك إرسال إشعارات للعملاء الذين يراجعون فرعك. 
                يمكنك تخصيص الإشعار حسب نوع الحيوان أو إرساله لجميع عملاء الفرع.
              </p>
            </div>
          )}

          {/* نوع الإشعار */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
              نوع الإشعار
            </label>
            <select
              name="type"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
              value={formData.type}
              onChange={handleChange}
            >
              <option value="general">عام</option>
              <option value="booking_reminder">تذكير بالحجز</option>
              <option value="booking_confirmed">تأكيد الحجز</option>
              <option value="consultation_scheduled">موعد استشارة</option>
              <option value="payment_received">استلام دفعة</option>
              <option value="offer">عرض خاص</option>
            </select>
          </div>

          {/* الأولوية */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
              الأولوية
            </label>
            <select
              name="priority"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
              value={formData.priority}
              onChange={handleChange}
            >
              <option value="low">منخفضة</option>
              <option value="medium">متوسطة</option>
              <option value="high">عالية</option>
              <option value="urgent">عاجلة</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={!user || (user.role !== 'admin' && user.role !== 'doctor')}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Send className="h-5 w-5" />
              {user?.role === 'doctor' ? 'إرسال لعملاء الفرع' : 'إرسال'}
            </button>
          </div>
        </form>
      </div>

      {/* Notifications History */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Toolbar */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-blue-600" />
              <h3 className="font-bold text-gray-900">سجل الإشعارات المرسلة</h3>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Month Filter */}
              <button className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 text-sm hover:bg-gray-50">
                <Calendar className="h-4 w-4 text-gray-600" />
                <span className="text-gray-700">{selectedMonth}</span>
              </button>

              {/* Status Filter */}
              <button className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 text-sm hover:bg-gray-50">
                <Filter className="h-4 w-4 text-gray-600" />
                <span className="text-gray-700">{selectedFilter}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  العنوان
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  التاريخ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الفئة المستهدفة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الموقع
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الخيارات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedNotifications.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">لا يوجد إشعارات مرسلة</p>
                  </td>
                </tr>
              ) : (
                paginatedNotifications.map((notification, index) => (
                  <tr key={notification._id || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {notification.title || 'موعد التطعيم'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>
                          {notification.createdAt 
                            ? new Date(notification.createdAt).toLocaleDateString('ar-SA')
                            : '12 أكتوبر 2025'
                          }
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {notification.recipients === 'all' && 'الجميع'}
                        {notification.recipients === 'customers' && 'العملاء'}
                        {notification.recipients === 'doctors' && 'الأطباء'}
                        {notification.recipients === 'staff' && 'الموظفين'}
                        {notification.recipients === 'admins' && 'المديرين'}
                        {notification.recipients === 'specific' && 'مستخدمين محددين'}
                      </div>
                      {notification.metadata?.animalType && (
                        <div className="text-xs text-blue-600 mt-1">
                          {notification.metadata.animalType === 'camel' && '🐪 الإبل'}
                          {notification.metadata.animalType === 'sheep' && '🐑 الأغنام'}
                          {notification.metadata.animalType === 'goat' && '🐐 الماعز'}
                          {notification.metadata.animalType === 'cow' && '🐄 الأبقار'}
                          {notification.metadata.animalType === 'horse' && '🐎 الخيول'}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {notification.metadata?.branch ? (
                          <span className="text-green-600">🏥 فرع محدد</span>
                        ) : (
                          'كل الفروع'
                        )}
                      </div>
                      {notification.metadata?.branchSpecific && (
                        <div className="text-xs text-green-600 mt-1">
                          ✅ عملاء الفرع فقط
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <MoreVertical className="h-5 w-5 text-gray-600" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                الصفحة {currentPage} من {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-sm">الأولى</span>
                </button>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  &lt;
                </button>

                {/* Page Numbers */}
                {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                  const pageNum = idx + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  &gt;
                </button>

                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-sm">الأخيرة</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">إجمالي الإشعارات</p>
              <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Bell className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">المرسلة اليوم</p>
              <p className="text-2xl font-bold text-gray-900">
                {notifications.filter(n => {
                  const today = new Date().toDateString();
                  const notifDate = new Date(n.createdAt).toDateString();
                  return today === notifDate;
                }).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">عدد المستلمين</p>
              <p className="text-2xl font-bold text-gray-900">
                {notifications.reduce((sum, n) => sum + (n.recipientsCount || 0), 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
