import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Calendar, Clock, User, MapPin } from 'lucide-react';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [formData, setFormData] = useState({
    customerId: '',
    animalName: '',
    animalType: '',
    vaccinationId: '',
    branchId: '',
    appointmentDate: '',
    timeSlot: '',
    notes: ''
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

  // جلب البيانات من API
  const fetchData = async () => {
    try {
      const [bookingsRes, customersRes, vaccinationsRes, branchesRes] = await Promise.all([
        authorizedFetch('/api/bookings'),
        authorizedFetch('/api/customers'),
        authorizedFetch('/api/vaccinations'),
        authorizedFetch('/api/branches')
      ]);

      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        setBookings(bookingsData.data.bookings || []);
      }

      if (customersRes.ok) {
        const customersData = await customersRes.json();
        setCustomers(customersData.data.customers || []);
      }

      if (vaccinationsRes.ok) {
        const vaccinationsData = await vaccinationsRes.json();
        setVaccinations(vaccinationsData.data.vaccinations || []);
      }

      if (branchesRes.ok) {
        const branchesData = await branchesRes.json();
        setBranches(branchesData.data.branches || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // تصفية الحجوزات
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch =
      booking.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer?.phone?.includes(searchTerm) ||
      booking.animal?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.bookingNumber?.includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // فتح نموذج إضافة/تعديل
  const openModal = (booking = null) => {
    setEditingBooking(booking);
    setFormData(booking ? {
      customerId: booking.customer?._id || '',
      animalName: booking.animal?.name || '',
      animalType: booking.animal?.type || '',
      vaccinationId: booking.vaccination?._id || '',
      branchId: booking.branch?._id || '',
      appointmentDate: booking.appointmentDate ? new Date(booking.appointmentDate).toISOString().split('T')[0] : '',
      timeSlot: booking.appointmentTime || '',
      notes: booking.notes || ''
    } : {
      customerId: '',
      animalName: '',
      animalType: '',
      vaccinationId: '',
      branchId: '',
      appointmentDate: '',
      timeSlot: '',
      notes: ''
    });
    setShowModal(true);
  };

  // حفظ الحجز
  const handleSave = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const url = editingBooking 
        ? `/api/bookings/${editingBooking._id}`
        : '/api/bookings';
      
      const method = editingBooking ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          customer: formData.customerId,
          animal: {
            name: formData.animalName,
            type: formData.animalType
          },
          vaccination: formData.vaccinationId,
          branch: formData.branchId,
          appointmentDate: formData.appointmentDate,
          appointmentTime: formData.timeSlot,
          notes: formData.notes
        })
      });

      if (response.ok) {
        setShowModal(false);
        fetchData();
        alert(editingBooking ? 'تم تحديث الحجز بنجاح' : 'تم إضافة الحجز بنجاح');
      }
    } catch (error) {
      console.error('Error saving booking:', error);
      alert('حدث خطأ أثناء الحفظ');
    }
  };

  // تحديث حالة الحجز
  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchData();
        alert('تم تحديث حالة الحجز بنجاح');
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert('حدث خطأ أثناء تحديث الحالة');
    }
  };

  // حذف الحجز
  const handleDelete = async (bookingId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الحجز؟')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchData();
        alert('تم حذف الحجز بنجاح');
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('حدث خطأ أثناء الحذف');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // دالة لتحديد لون الحالة
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // دالة لتحويل الحالة إلى العربية
  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return 'مؤكد';
      case 'pending': return 'في الانتظار';
      case 'completed': return 'مكتمل';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة الحجوزات</h1>
          <p className="text-gray-600">إدارة جميع حجوزات التطعيمات</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          حجز جديد
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="البحث عن حجز (الاسم، الهاتف، رقم الحجز)"
            className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">جميع الحالات</option>
          <option value="pending">في الانتظار</option>
          <option value="confirmed">مؤكد</option>
          <option value="completed">مكتمل</option>
          <option value="cancelled">ملغي</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="mr-4">
              <h3 className="text-lg font-semibold text-gray-900">{bookings.length}</h3>
              <p className="text-gray-600">إجمالي الحجوزات</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="mr-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {bookings.filter(b => b.status === 'pending').length}
              </h3>
              <p className="text-gray-600">في الانتظار</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div className="mr-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {bookings.filter(b => b.status === 'confirmed').length}
              </h3>
              <p className="text-gray-600">مؤكد</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="mr-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {bookings.filter(b => b.status === 'completed').length}
              </h3>
              <p className="text-gray-600">مكتمل</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  رقم الحجز
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  العميل
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الحيوان
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  التطعيم
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  التاريخ والوقت
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الحالة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr key={booking._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    {booking.bookingNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="mr-3">
                        <div className="text-sm font-medium text-gray-900">
                          {booking.customer?.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.customer?.phone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{booking.animal?.name}</div>
                    <div className="text-sm text-gray-500">{booking.animal?.type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{booking.vaccination?.name}</div>
                    <div className="text-sm text-gray-500">{booking.vaccination?.price} ريال</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="h-4 w-4 ml-2" />
                      {new Date(booking.appointmentDate).toLocaleDateString('ar-SA')}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 ml-2" />
                      {booking.appointmentTime}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                      {getStatusText(booking.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {booking.status === 'pending' && (
                        <button
                          onClick={() => updateBookingStatus(booking._id, 'confirmed')}
                          className="text-green-600 hover:text-green-900"
                          title="تأكيد الحجز"
                        >
                          ✓
                        </button>
                      )}
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => updateBookingStatus(booking._id, 'completed')}
                          className="text-blue-600 hover:text-blue-900"
                          title="إكمال الحجز"
                        >
                          ✓✓
                        </button>
                      )}
                      <button
                        onClick={() => openModal(booking)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(booking._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredBookings.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد حجوزات</h3>
              <p className="mt-1 text-sm text-gray-500">ابدأ بإضافة حجز جديد</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingBooking ? 'تعديل الحجز' : 'إضافة حجز جديد'}
            </h3>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    العميل
                  </label>
                  <select
                    name="customerId"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.customerId}
                    onChange={handleChange}
                  >
                    <option value="">اختر العميل</option>
                    {customers.map(customer => (
                      <option key={customer._id} value={customer._id}>
                        {customer.name} - {customer.phone}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    اسم الحيوان
                  </label>
                  <input
                    type="text"
                    name="animalName"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.animalName}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    نوع الحيوان
                  </label>
                  <select
                    name="animalType"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.animalType}
                    onChange={handleChange}
                  >
                    <option value="">اختر النوع</option>
                    <option value="camel">إبل</option>
                    <option value="sheep">أغنام</option>
                    <option value="goat">ماعز</option>
                    <option value="cow">ماشية</option>
                    <option value="horse">خيول</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    التطعيم
                  </label>
                  <select
                    name="vaccinationId"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.vaccinationId}
                    onChange={handleChange}
                  >
                    <option value="">اختر التطعيم</option>
                    {vaccinations.map(vaccination => (
                      <option key={vaccination._id} value={vaccination._id}>
                        {vaccination.name} - {vaccination.price} ريال
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الفرع
                  </label>
                  <select
                    name="branchId"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.branchId}
                    onChange={handleChange}
                  >
                    <option value="">اختر الفرع</option>
                    {branches.map(branch => (
                      <option key={branch._id} value={branch._id}>
                        {branch.name} - {branch.location}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    تاريخ الموعد
                  </label>
                  <input
                    type="date"
                    name="appointmentDate"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.appointmentDate}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الوقت
                  </label>
                  <select
                    name="timeSlot"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.timeSlot}
                    onChange={handleChange}
                  >
                    <option value="">اختر الوقت</option>
                    <option value="09:00">09:00 صباحاً</option>
                    <option value="10:00">10:00 صباحاً</option>
                    <option value="11:00">11:00 صباحاً</option>
                    <option value="12:00">12:00 ظهراً</option>
                    <option value="13:00">01:00 ظهراً</option>
                    <option value="14:00">02:00 ظهراً</option>
                    <option value="15:00">03:00 عصراً</option>
                    <option value="16:00">04:00 عصراً</option>
                    <option value="17:00">05:00 عصراً</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ملاحظات
                </label>
                <textarea
                  name="notes"
                  rows="3"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.notes}
                  onChange={handleChange}
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingBooking ? 'تحديث' : 'حجز'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;