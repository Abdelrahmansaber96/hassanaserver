import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, MapPin, Edit, Trash2, Clock, Users, X, Upload, 
  Star, Navigation, Phone, Mail, Calendar, Heart, Eye, AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const BranchesNew = () => {
  const { user } = useAuth();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    city: '',
    province: '',
    phone: '',
    email: '',
    manager: '',
    capacity: '',
    workingHours: {
      start: '08:00',
      end: '17:00'
    },
    workingDays: [],
    services: [],
    image: '',
    rating: 0,
    description: '',
    coordinates: {
      lat: 0,
      lng: 0
    },
    isActive: true
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

  // جلب الفروع من API
  const fetchBranches = async () => {
    try {
      setLoading(true);
      const response = await authorizedFetch('/api/branches');
      
      if (response.ok) {
        const data = await response.json();
        setBranches(data.data || data);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  // تصفية الفروع
  const filteredBranches = branches.filter(branch =>
    branch.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // فتح نموذج إضافة/تعديل
  const openModal = (branch = null) => {
    if (!user || user.role !== 'admin') {
      alert('فقط المدير يمكنه إضافة أو تعديل الفروع');
      return;
    }

    setEditingBranch(branch);
    if (branch) {
      setFormData({
        name: branch.name || '',
        location: branch.location || '',
        city: branch.city || '',
        province: branch.province || '',
        phone: branch.phone || '',
        email: branch.email || '',
        manager: branch.manager || '',
        capacity: branch.capacity || '',
        workingHours: {
          start: branch.workingHours?.start || '08:00',
          end: branch.workingHours?.end || '17:00'
        },
        workingDays: branch.workingDays || [],
        services: branch.services || [],
        image: branch.image || '',
        rating: branch.rating || 0,
        description: branch.description || '',
        coordinates: branch.coordinates || { lat: 0, lng: 0 },
        isActive: branch.isActive !== undefined ? branch.isActive : true
      });
      setImagePreview(branch.image || '');
    } else {
      setFormData({
        name: '',
        location: '',
        city: '',
        province: '',
        phone: '',
        email: '',
        manager: '',
        capacity: '',
        workingHours: { start: '08:00', end: '17:00' },
        workingDays: [],
        services: [],
        image: '',
        rating: 0,
        description: '',
        coordinates: { lat: 0, lng: 0 },
        isActive: true
      });
      setImagePreview('');
    }
    setShowModal(true);
  };

  // حفظ الفرع
  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!user || user.role !== 'admin') {
      alert('فقط المدير يمكنه إضافة أو تعديل الفروع');
      return;
    }

    try {
      const url = editingBranch 
        ? `/api/branches/${editingBranch._id}`
        : '/api/branches';
      const method = editingBranch ? 'PUT' : 'POST';
      
      // تنظيف البيانات قبل الإرسال
      const branchData = { ...formData };
      
      // إزالة coordinates إذا كانت القيم الافتراضية (0, 0)
      if (branchData.coordinates && 
          branchData.coordinates.lat === 0 && 
          branchData.coordinates.lng === 0) {
        delete branchData.coordinates;
      }
      
      // إزالة الحقول الفارغة
      Object.keys(branchData).forEach(key => {
        if (branchData[key] === '' || branchData[key] === null || branchData[key] === undefined) {
          delete branchData[key];
        }
      });
      
      console.log('Sending branch data:', branchData);
      
      const response = await authorizedFetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(branchData)
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        await fetchBranches();
        setShowModal(false);
        setEditingBranch(null);
        alert(editingBranch ? 'تم تحديث الفرع بنجاح' : 'تم إضافة الفرع بنجاح');
      } else {
        const error = await response.json();
        console.error('Server error:', error);
        
        let errorMessage = 'حدث خطأ أثناء الحفظ';
        if (error.errors && Array.isArray(error.errors)) {
          errorMessage = error.errors.map(err => `${err.field}: ${err.message}`).join('\n');
        } else if (error.message) {
          errorMessage = error.message;
        }
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error saving branch:', error);
      alert('حدث خطأ أثناء الحفظ');
    }
  };

  // حذف الفرع
  const handleDelete = async (branchId) => {
    if (!user || user.role !== 'admin') {
      alert('فقط المدير يمكنه حذف الفروع');
      return;
    }

    if (!window.confirm('هل أنت متأكد من حذف هذا الفرع؟')) return;

    try {
      const response = await authorizedFetch(`/api/branches/${branchId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchBranches();
        alert('تم حذف الفرع بنجاح');
      } else {
        const error = await response.json();
        alert(error.message || 'حدث خطأ أثناء الحذف');
      }
    } catch (error) {
      console.error('Error deleting branch:', error);
      alert('حدث خطأ أثناء الحذف');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleArrayChange = (field, value) => {
    const currentArray = formData[field];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    setFormData(prev => ({
      ...prev,
      [field]: newArray
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 lg:mr-5" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b fixed top-16 left-0 right-0 lg:right-64 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => openModal()} className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                <Plus className="h-5 w-5" />
                <span className="font-medium">إضافة فرع جديد</span>
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="بحث"
                  className="w-64 rounded-xl border border-gray-200 pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-5 w-5 text-blue-600" />
                <span className="font-semibold">إدارة الفروع – المواقع وساعات العمل</span>
              </div>
            </div>

            <div className="text-sm text-gray-600">لوحة التحكم</div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Placeholder */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 h-[600px]">
              <div className="h-full bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl flex items-center justify-center relative overflow-hidden">
                {/* Map simulation */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-10 left-10 w-4 h-4 rounded-full bg-blue-600"></div>
                  <div className="absolute top-32 right-16 w-4 h-4 rounded-full bg-blue-600"></div>
                  <div className="absolute bottom-20 left-20 w-4 h-4 rounded-full bg-blue-600"></div>
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <path d="M 20,30 Q 40,5 60,30 T 100,30" stroke="#3b82f6" strokeWidth="0.5" fill="none" />
                    <path d="M 10,50 Q 30,40 50,60 T 90,50" stroke="#3b82f6" strokeWidth="0.5" fill="none" />
                    <path d="M 15,70 Q 45,60 65,80 T 95,70" stroke="#3b82f6" strokeWidth="0.5" fill="none" />
                  </svg>
                </div>
                <div className="text-center z-10">
                  <MapPin className="h-16 w-16 text-blue-600 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm">خريطة الفروع</p>
                </div>
              </div>
            </div>
          </div>

          {/* Branches List */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBranches.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد فروع</h3>
                <p className="text-gray-500 mb-6">ابدأ بإضافة أول فرع للعيادة</p>
                {user?.role === 'admin' && (
                  <button
                    onClick={() => openModal()}
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700"
                  >
                    <Plus className="h-5 w-5" />
                    إضافة فرع جديد
                  </button>
                )}
              </div>
            ) : (
              filteredBranches.map((branch, index) => (
                <motion.div
                  key={branch._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col">
                    {/* Branch Image - Square */}
                    <div className="w-full aspect-square bg-gradient-to-br from-blue-100 to-indigo-200 relative rounded-t-2xl overflow-hidden">
                      {branch.image ? (
                        <img src={branch.image} alt={branch.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <MapPin className="h-16 w-16 text-blue-600" />
                        </div>
                      )}
                      {branch.rating > 0 && (
                        <div className="absolute top-3 right-3 bg-blue-600 text-white px-2 py-1 rounded-lg text-xs flex items-center gap-1">
                          <Star className="h-3 w-3 fill-current" />
                          <span>{branch.rating}</span>
                        </div>
                      )}
                      <button className="absolute top-3 left-3 p-2 bg-white/80 backdrop-blur rounded-full hover:bg-white">
                        <Heart className="h-5 w-5 text-gray-600 hover:text-red-500" />
                      </button>
                    </div>

                    {/* Branch Details */}
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">{branch.name}</h3>
                          <p className="text-sm text-gray-600 flex items-center gap-1 line-clamp-1">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            {branch.city} - {branch.location}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Calendar className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
                          <span>الأيام: {branch.workingDays?.length || 0} أيام • ساعات العمل: {branch.workingHours?.start} - {branch.workingHours?.end}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Clock className="h-3.5 w-3.5 text-amber-500" />
                            <span>15 دقيقة</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Users className="h-3.5 w-3.5 text-purple-600" />
                            <span>عدد الأطباء: 8</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              branch.isActive 
                                ? 'bg-emerald-50 text-emerald-700' 
                                : 'bg-red-50 text-red-700'
                            }`}>
                              {branch.isActive ? 'الحالة : نشط' : 'الحالة : غير نشط'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-3 border-t">
                        <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium">
                          تفاصيل
                        </button>
                        <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-1">
                          <Navigation className="h-4 w-4" />
                          اتجاه
                        </button>
                      </div>

                      {user?.role === 'admin' && (
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => openModal(branch)}
                            className="flex-1 p-2 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center justify-center gap-1 text-sm"
                          >
                            <Edit className="h-4 w-4" />
                            تعديل
                          </button>
                          <button
                            onClick={() => handleDelete(branch._id)}
                            className="flex-1 p-2 text-red-600 hover:bg-red-50 rounded-lg flex items-center justify-center gap-1 text-sm"
                          >
                            <Trash2 className="h-4 w-4" />
                            حذف
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingBranch ? 'تعديل الفرع' : 'إضافة فرع جديد'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSave} className="p-6 space-y-6">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    صورة الفرع
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-32 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <Upload className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="branch-image"
                      />
                      <label
                        htmlFor="branch-image"
                        className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-100"
                      >
                        <Upload className="h-4 w-4" />
                        اختر الصورة
                      </label>
                      <p className="text-xs text-gray-500 mt-2">PNG, JPG حتى 5MB</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اسم الفرع *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="أدخل اسم الفرع"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      المدينة *
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="المدينة"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      المحافظة
                    </label>
                    <input
                      type="text"
                      name="province"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.province}
                      onChange={handleChange}
                      placeholder="المحافظة"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      العنوان التفصيلي *
                    </label>
                    <input
                      type="text"
                      name="location"
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="الشارع والمنطقة"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رقم الهاتف
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+966xxxxxxxxx"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      البريد الإلكتروني
                    </label>
                    <input
                      type="email"
                      name="email"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="branch@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      المدير
                    </label>
                    <input
                      type="text"
                      name="manager"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.manager}
                      onChange={handleChange}
                      placeholder="اسم المدير"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      السعة (عميل/يوم)
                    </label>
                    <input
                      type="number"
                      name="capacity"
                      min="1"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.capacity}
                      onChange={handleChange}
                      placeholder="24"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      بداية العمل
                    </label>
                    <input
                      type="time"
                      name="workingHours.start"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.workingHours.start}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نهاية العمل
                    </label>
                    <input
                      type="time"
                      name="workingHours.end"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.workingHours.end}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Working Days */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    أيام العمل
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map((day) => (
                      <label key={day} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.workingDays.includes(day)}
                          onChange={() => handleArrayChange('workingDays', day)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{day}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Services */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    الخدمات المتاحة
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['تطعيمات الإبل', 'تطعيمات الأغنام', 'تطعيمات الماعز', 'تطعيمات الماشية', 'تطعيمات الخيول', 'استشارات طبية', 'فحوصات طبية', 'جراحات بسيطة', 'رعاية طارئة'].map((service) => (
                      <label key={service} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.services.includes(service)}
                          onChange={() => handleArrayChange('services', service)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{service}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الوصف
                  </label>
                  <textarea
                    name="description"
                    rows="3"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="وصف مختصر عن الفرع..."
                  />
                </div>

                {/* Status */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isActive"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                    الفرع نشط ومتاح للحجوزات
                  </label>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    {editingBranch ? 'تحديث الفرع' : 'إضافة الفرع'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    
    </div>
  );
};

export default BranchesNew;
