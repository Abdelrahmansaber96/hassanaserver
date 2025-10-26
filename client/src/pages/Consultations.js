import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Phone, Calendar, User, Clock } from 'lucide-react';

const Consultations = () => {
  const [consultations, setConsultations] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingConsultation, setEditingConsultation] = useState(null);
  const [formData, setFormData] = useState({
    customerId: '',
    doctorId: '',
    consultationType: '',
    scheduledDate: '',
    scheduledTime: '',
    duration: 30,
    notes: '',
    symptoms: '',
    diagnosis: '',
    recommendations: ''
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
      const [consultationsRes, customersRes, doctorsRes] = await Promise.all([
        authorizedFetch('/api/consultations'),
        authorizedFetch('/api/customers'),
        authorizedFetch('/api/doctors')
      ]);

      if (consultationsRes.ok) {
        const consultationsData = await consultationsRes.json();
        console.log('Consultations data:', consultationsData);
        setConsultations(consultationsData.data || consultationsData.consultations || []);
      } else {
        console.error('Consultations fetch failed:', consultationsRes.status);
      }
      
      if (customersRes.ok) {
        const customersData = await customersRes.json();
        console.log('Customers data:', customersData);
        setCustomers(customersData.data || customersData.customers || []);
      } else {
        console.error('Customers fetch failed:', customersRes.status);
      }
      
      if (doctorsRes.ok) {
        const doctorsData = await doctorsRes.json();
        console.log('Doctors data:', doctorsData);
        setDoctors(doctorsData.data || doctorsData.doctors || []);
      } else {
        console.error('Doctors fetch failed:', doctorsRes.status);
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

  // تصفية الاستشارات
  const filteredConsultations = consultations.filter(consultation => {
    const matchesSearch = 
      consultation.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.customer?.phone?.includes(searchTerm) ||
      consultation.consultationNumber?.includes(searchTerm) ||
      consultation.doctor?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || consultation.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // فتح نموذج إضافة/تعديل
  const openModal = (consultation = null) => {
    setEditingConsultation(consultation);
    setFormData(consultation ? {
      customerId: consultation.customer?._id || '',
      doctorId: consultation.doctor?._id || '',
      consultationType: consultation.consultationType || '',
      scheduledDate: consultation.scheduledDate ? new Date(consultation.scheduledDate).toISOString().split('T')[0] : '',
      scheduledTime: consultation.scheduledTime || '',
      duration: consultation.duration || 30,
      notes: consultation.notes || '',
      symptoms: consultation.symptoms || '',
      diagnosis: consultation.diagnosis || '',
      recommendations: consultation.recommendations || ''
    } : {
      customerId: '',
      doctorId: '',
      consultationType: '',
      scheduledDate: '',
      scheduledTime: '',
      duration: 30,
      notes: '',
      symptoms: '',
      diagnosis: '',
      recommendations: ''
    });
    setShowModal(true);
  };

  // حفظ الاستشارة
  const handleSave = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const url = editingConsultation 
        ? `${API_BASE_URL}/api/consultations/${editingConsultation._id}`
        : `${API_BASE_URL}/api/consultations`;
      
      const method = editingConsultation ? 'PUT' : 'POST';
      
      // تحويل أسماء الحقول لتتطابق مع الـ API
      const requestData = {
        customer: formData.customerId,
        doctor: formData.doctorId,
        consultationType: formData.consultationType,
        scheduledDate: formData.scheduledDate,
        scheduledTime: formData.scheduledTime,
        duration: formData.duration,
        notes: formData.notes,
        symptoms: formData.symptoms,
        diagnosis: formData.diagnosis,
        recommendations: formData.recommendations
      };
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        setShowModal(false);
        fetchData();
        alert(editingConsultation ? 'تم تحديث الاستشارة بنجاح' : 'تم إضافة الاستشارة بنجاح');
      } else {
        const errorData = await response.json();
        console.error('Error saving consultation:', errorData);
        alert(errorData.message || 'حدث خطأ أثناء الحفظ');
      }
    } catch (error) {
      console.error('Error saving consultation:', error);
      alert('حدث خطأ أثناء الحفظ');
    }
  };

  // تحديث حالة الاستشارة
  const updateConsultationStatus = async (consultationId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/consultations/${consultationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchData();
        alert('تم تحديث حالة الاستشارة بنجاح');
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        alert('حدث خطأ أثناء تحديث الحالة');
      }
    } catch (error) {
      console.error('Error updating consultation status:', error);
      alert('حدث خطأ أثناء تحديث الحالة');
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
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // دالة لتحويل الحالة إلى العربية
  const getStatusText = (status) => {
    switch (status) {
      case 'scheduled': return 'مجدولة';
      case 'in_progress': return 'جارية';
      case 'completed': return 'مكتملة';
      case 'cancelled': return 'ملغية';
      default: return status;
    }
  };

  // دالة لتحويل نوع الاستشارة إلى العربية
  const getConsultationTypeText = (type) => {
    switch (type) {
      case 'phone': return 'هاتفية';
      case 'video': return 'مرئية';
      case 'in-person': return 'حضورية';
      default: return type;
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
    <div className="p-6 mt-14">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة الاستشارات</h1>
          <p className="text-gray-600">إدارة جميع الاستشارات الطبية</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          استشارة جديدة
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="البحث عن استشارة (الاسم، الهاتف، رقم الاستشارة)"
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
          <option value="scheduled">مجدولة</option>
          <option value="in_progress">جارية</option>
          <option value="completed">مكتملة</option>
          <option value="cancelled">ملغية</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Phone className="h-6 w-6 text-blue-600" />
            </div>
            <div className="mr-4">
              <h3 className="text-lg font-semibold text-gray-900">{consultations.length}</h3>
              <p className="text-gray-600">إجمالي الاستشارات</p>
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
                {consultations.filter(c => c.status === 'scheduled').length}
              </h3>
              <p className="text-gray-600">مجدولة</p>
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
                {consultations.filter(c => c.status === 'in_progress').length}
              </h3>
              <p className="text-gray-600">جارية</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Phone className="h-6 w-6 text-green-600" />
            </div>
            <div className="mr-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {consultations.filter(c => c.status === 'completed').length}
              </h3>
              <p className="text-gray-600">مكتملة</p>
            </div>
          </div>
        </div>
      </div>

      {/* Consultations Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  رقم الاستشارة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  العميل
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الطبيب
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  النوع
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
              {filteredConsultations.map((consultation) => (
                <tr key={consultation._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    {consultation.consultationNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="mr-3">
                        <div className="text-sm font-medium text-gray-900">
                          {consultation.customer?.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {consultation.customer?.phone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {consultation.doctor?.name || 'غير محدد'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {getConsultationTypeText(consultation.consultationType)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="h-4 w-4 ml-2" />
                      {new Date(consultation.scheduledDate).toLocaleDateString('ar-SA')}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 ml-2" />
                      {consultation.scheduledTime}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(consultation.status)}`}>
                      {getStatusText(consultation.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {consultation.status === 'scheduled' && (
                        <button
                          onClick={() => updateConsultationStatus(consultation._id, 'in_progress')}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="بدء الاستشارة"
                        >
                          ▶
                        </button>
                      )}
                      {consultation.status === 'in_progress' && (
                        <button
                          onClick={() => updateConsultationStatus(consultation._id, 'completed')}
                          className="text-green-600 hover:text-green-900"
                          title="إنهاء الاستشارة"
                        >
                          ✓
                        </button>
                      )}
                      <button
                        onClick={() => openModal(consultation)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredConsultations.length === 0 && (
            <div className="text-center py-12">
              <Phone className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد استشارات</h3>
              <p className="mt-1 text-sm text-gray-500">ابدأ بإضافة استشارة جديدة</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingConsultation ? 'تعديل الاستشارة' : 'إضافة استشارة جديدة'}
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
                    الطبيب
                  </label>
                  <select
                    name="doctorId"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.doctorId}
                    onChange={handleChange}
                  >
                    <option value="">اختر الطبيب</option>
                    {doctors.map(doctor => (
                      <option key={doctor._id} value={doctor._id}>
                        {doctor.name} - {doctor.specialization}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    نوع الاستشارة
                  </label>
                  <select
                    name="consultationType"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.consultationType}
                    onChange={handleChange}
                  >
                    <option value="">اختر النوع</option>
                    <option value="phone">هاتفية</option>
                    <option value="video">مرئية</option>
                    <option value="in-person">حضورية</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    المدة (دقيقة)
                  </label>
                  <input
                    type="number"
                    name="duration"
                    min="15"
                    max="120"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.duration}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    تاريخ الموعد
                  </label>
                  <input
                    type="date"
                    name="scheduledDate"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.scheduledDate}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الوقت
                  </label>
                  <input
                    type="time"
                    name="scheduledTime"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.scheduledTime}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الأعراض
                </label>
                <textarea
                  name="symptoms"
                  rows="3"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.symptoms}
                  onChange={handleChange}
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  التشخيص
                </label>
                <textarea
                  name="diagnosis"
                  rows="3"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.diagnosis}
                  onChange={handleChange}
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  التوصيات
                </label>
                <textarea
                  name="recommendations"
                  rows="3"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.recommendations}
                  onChange={handleChange}
                ></textarea>
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
                  {editingConsultation ? 'تحديث' : 'إضافة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Consultations;