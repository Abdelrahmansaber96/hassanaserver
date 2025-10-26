import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Edit, Trash2, X, Upload, Star, Phone, Mail,
  User, Briefcase, Calendar, Clock, MapPin, Award, FileText
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Doctors = () => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [branches, setBranches] = useState([]); // إضافة state للفروع
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '', // إضافة حقل password
    specialization: '',
    branch: '',
    qualification: '',
    experience: '',
    consultationFee: '',
    workingHours: {
      start: '08:00',
      end: '17:00'
    },
    workingDays: [],
    languages: [],
    image: '',
    rating: 0,
    bio: '',
    licenseNumber: '',
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

  // جلب الأطباء من API
  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await authorizedFetch('/api/doctors');
      
      if (response.ok) {
        const result = await response.json();
        console.log('API Response:', result); // للتحقق من البيانات
        
        // معالجة البيانات حسب هيكل API
        if (result.success && result.data) {
          setDoctors(Array.isArray(result.data) ? result.data : []);
        } else if (Array.isArray(result)) {
          setDoctors(result);
        } else {
          console.log('Unexpected data structure:', result);
          setDoctors([]);
        }
      } else {
        console.error('Response not OK:', response.status);
        const error = await response.json();
        console.error('Error details:', error);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  // جلب الفروع من API
  const fetchBranches = async () => {
    try {
      const response = await authorizedFetch('/api/branches');
      if (response.ok) {
        const result = await response.json();
        setBranches(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  useEffect(() => {
    fetchDoctors();
    fetchBranches(); // جلب الفروع عند تحميل الصفحة
  }, []);

  // تصفية الأطباء
  const filteredDoctors = doctors.filter(doctor =>
    doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.branch?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // فتح نموذج إضافة/تعديل
  const openModal = (doctor = null) => {
    if (!user || user.role !== 'admin') {
      alert('فقط المدير يمكنه إضافة أو تعديل الأطباء');
      return;
    }

    setEditingDoctor(doctor);
    if (doctor) {
      setFormData({
        name: doctor.name || '',
        email: doctor.email || '',
        phone: doctor.phone || '',
        specialization: doctor.specialization || '',
        branch: doctor.branch?._id || '',
        qualification: doctor.qualification || '',
        experience: doctor.experience || '',
        consultationFee: doctor.consultationFee || '',
        workingHours: {
          start: doctor.workingHours?.start || '08:00',
          end: doctor.workingHours?.end || '17:00'
        },
        workingDays: doctor.workingDays || [],
        languages: doctor.languages || [],
        image: doctor.image || '',
        rating: doctor.rating || 0,
        bio: doctor.bio || '',
        licenseNumber: doctor.licenseNumber || '',
        isActive: doctor.isActive !== undefined ? doctor.isActive : true
      });
      setImagePreview(doctor.image || '');
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        specialization: '',
        branch: '',
        qualification: '',
        experience: '',
        consultationFee: '',
        workingHours: { start: '08:00', end: '17:00' },
        workingDays: [],
        languages: [],
        image: '',
        rating: 0,
        bio: '',
        licenseNumber: '',
        isActive: true
      });
      setImagePreview('');
    }
    setShowModal(true);
  };

  // إعادة تعيين النموذج
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '', // إضافة حقل password
      specialization: '',
      branch: '',
      qualification: '',
      experience: '',
      consultationFee: '',
      workingHours: { start: '08:00', end: '17:00' },
      workingDays: [],
      languages: [],
      image: '',
      rating: 0,
      bio: '',
      licenseNumber: '',
      isActive: true
    });
    setImagePreview('');
    setEditingDoctor(null);
  };

  // حفظ الطبيب
  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!user || user.role !== 'admin') {
      alert('فقط المدير يمكنه إضافة أو تعديل الأطباء');
      return;
    }

    try {
      const url = editingDoctor 
        ? `/api/doctors/${editingDoctor._id}`
        : '/api/doctors';
      const method = editingDoctor ? 'PUT' : 'POST';
      
      // تنظيف البيانات: إزالة الحقول الفارغة
      const doctorData = {
        ...formData,
        role: 'doctor'
      };
      
      // إزالة password عند التعديل (فقط للإضافة)
      if (editingDoctor) {
        delete doctorData.password;
      }
      
      // التحقق من أن الفرع محدد (مطلوب للطبيب)
      if (!doctorData.branch || doctorData.branch === '') {
        alert('الرجاء اختيار الفرع الذي يعمل به الطبيب');
        return;
      }
      
      // إزالة image إذا كان فارغاً
      if (!doctorData.image || doctorData.image === '') {
        delete doctorData.image;
      }
      
      // إزالة licenseNumber إذا كان فارغاً
      if (!doctorData.licenseNumber || doctorData.licenseNumber === '') {
        delete doctorData.licenseNumber;
      }

      console.log('Saving doctor data:', doctorData);

      const response = await authorizedFetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(doctorData)
      });

      const data = await response.json();
      console.log('Response:', data);

      if (response.ok) {
        await fetchDoctors();
        setShowModal(false);
        setEditingDoctor(null);
        resetForm();
        alert(editingDoctor ? 'تم تحديث بيانات الطبيب بنجاح' : 'تم إضافة الطبيب بنجاح');
      } else {
        let errorMessage = 'حدث خطأ أثناء الحفظ';
        if (data.errors && Array.isArray(data.errors)) {
          errorMessage = data.errors.map(err => `${err.field}: ${err.message}`).join('\n');
        } else if (data.message) {
          errorMessage = data.message;
        }
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error saving doctor:', error);
      alert('حدث خطأ أثناء الحفظ');
    }
  };

  // حذف الطبيب
  const handleDelete = async (doctorId) => {
    if (!user || user.role !== 'admin') {
      alert('فقط المدير يمكنه حذف الأطباء');
      return;
    }

    if (!window.confirm('هل أنت متأكد من حذف هذا الطبيب؟')) return;

    try {
      const response = await authorizedFetch(`/api/doctors/${doctorId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchDoctors();
        alert('تم حذف الطبيب بنجاح');
      } else {
        const data = await response.json();
        alert(data.message || 'حدث خطأ أثناء الحذف');
      }
    } catch (error) {
      console.error('Error deleting doctor:', error);
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
    <div className="min-h-screen bg-gray-50 pt-20 lg:mr-5 p-6" dir="rtl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">إدارة الأطباء وتنظيم بياناتهم في فروع حصانة</h1>
            <p className="text-sm text-gray-600 mt-1">إدارة جميع الأطباء وبياناتهم</p>
          </div>
          
          {user?.role === 'admin' && (
            <button
              onClick={() => openModal()}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-sm"
            >
              <Plus className="h-5 w-5" />
              إضافة طبيب جديد
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="بحث عن طبيب..."
            className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا يوجد أطباء</h3>
            <p className="text-gray-500 mb-6">ابدأ بإضافة أول طبيب</p>
            {user?.role === 'admin' && (
              <button
                onClick={() => openModal()}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700"
              >
                <Plus className="h-5 w-5" />
                إضافة طبيب جديد
              </button>
            )}
          </div>
        ) : (
          filteredDoctors.map((doctor, index) => (
            <motion.div
              key={doctor._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col">
                {/* Doctor Image */}
                <div className="w-full aspect-square bg-gradient-to-br from-blue-100 to-indigo-200 relative">
                  {doctor.image ? (
                    <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="h-24 w-24 text-blue-600" />
                    </div>
                  )}
                  {doctor.rating > 0 && (
                    <div className="absolute top-3 right-3 bg-amber-500 text-white px-2 py-1 rounded-lg text-xs flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current" />
                      <span>{doctor.rating}</span>
                    </div>
                  )}
                  <div className="absolute top-3 left-3 bg-blue-600 text-white px-2 py-1 rounded-lg text-xs">
                    {doctor.experience || '0'} سنوات خبرة
                  </div>
                </div>

                {/* Doctor Details */}
                <div className="p-5">
                  <div className="mb-3">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{doctor.name}</h3>
                    <p className="text-sm text-blue-600 font-medium">{doctor.specialization || 'طبيب بيطري'}</p>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Award className="h-3.5 w-3.5 text-purple-600 flex-shrink-0" />
                      <span>{doctor.qualification || 'بكالوريوس الطب البيطري'}</span>
                    </div>
                    {doctor.branch?.name && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <MapPin className="h-3.5 w-3.5 text-red-600 flex-shrink-0" />
                        <span>{doctor.branch.name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Phone className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                      <span>{doctor.phone || 'غير محدد'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Clock className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" />
                      <span>ساعات العمل: {doctor.workingHours?.start || '08:00'} - {doctor.workingHours?.end || '17:00'}</span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      doctor.isActive 
                        ? 'bg-emerald-50 text-emerald-700' 
                        : 'bg-red-50 text-red-700'
                    }`}>
                      {doctor.isActive ? 'نشط' : 'غير نشط'}
                    </span>
                    {doctor.consultationFee && (
                      <span className="text-sm font-bold text-blue-600">
                        {doctor.consultationFee} ريال
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t">
                    <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium">
                      تفاصيل
                    </button>
                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm font-medium">
                      تعديل
                    </button>
                  </div>

                  {user?.role === 'admin' && (
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => openModal(doctor)}
                        className="flex-1 p-2 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center justify-center gap-1 text-sm"
                      >
                        <Edit className="h-4 w-4" />
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDelete(doctor._id)}
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
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  {editingDoctor ? 'تعديل بيانات الطبيب' : 'إضافة طبيب جديد'}
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
                    صورة الطبيب
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-32 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <User className="h-12 w-12 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="doctor-image"
                      />
                      <label
                        htmlFor="doctor-image"
                        className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-100"
                      >
                        <Upload className="h-4 w-4" />
                        اختر الصورة الشخصية
                      </label>
                      <p className="text-xs text-gray-500 mt-2">PNG, JPG حتى 5MB</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اسم الطبيب *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="أدخل اسم الطبيب"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      البريد الإلكتروني *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="doctor@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رقم الهاتف *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+966xxxxxxxxx"
                    />
                  </div>

                  {/* حقل كلمة المرور - مطلوب فقط عند الإضافة */}
                  {!editingDoctor && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        كلمة المرور *
                      </label>
                      <input
                        type="password"
                        name="password"
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.password || ''}
                        onChange={handleChange}
                        placeholder="أدخل كلمة المرور (6 أحرف على الأقل)"
                        minLength={6}
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      التخصص *
                    </label>
                    <select
                      name="specialization"
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.specialization}
                      onChange={handleChange}
                    >
                      <option value="">اختر التخصص</option>
                      <option value="طبيب بيطري عام">طبيب بيطري عام</option>
                      <option value="جراحة بيطرية">جراحة بيطرية</option>
                      <option value="أمراض باطنية">أمراض باطنية</option>
                      <option value="طب الإبل">طب الإبل</option>
                      <option value="طب الأغنام والماعز">طب الأغنام والماعز</option>
                      <option value="طب الخيول">طب الخيول</option>
                      <option value="التطعيمات والوقاية">التطعيمات والوقاية</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الفرع *
                    </label>
                    <select
                      name="branch"
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.branch}
                      onChange={handleChange}
                    >
                      <option value="">اختر الفرع</option>
                      {branches.map(branch => (
                        <option key={branch._id} value={branch._id}>
                          {branch.name} - {branch.city}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      ⚠️ مطلوب: الطبيب يجب أن يكون مسجلاً في فرع محدد
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      المؤهل العلمي
                    </label>
                    <input
                      type="text"
                      name="qualification"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.qualification}
                      onChange={handleChange}
                      placeholder="بكالوريوس الطب البيطري"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      سنوات الخبرة
                    </label>
                    <input
                      type="number"
                      name="experience"
                      min="0"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.experience}
                      onChange={handleChange}
                      placeholder="5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رقم الترخيص
                    </label>
                    <input
                      type="text"
                      name="licenseNumber"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      placeholder="VET-12345"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رسوم الاستشارة (ريال)
                    </label>
                    <input
                      type="number"
                      name="consultationFee"
                      min="0"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.consultationFee}
                      onChange={handleChange}
                      placeholder="150"
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

                {/* Languages */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    اللغات
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['العربية', 'الإنجليزية', 'الفرنسية', 'الأردية', 'الهندية'].map((lang) => (
                      <label key={lang} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.languages.includes(lang)}
                          onChange={() => handleArrayChange('languages', lang)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{lang}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نبذة عن الطبيب
                  </label>
                  <textarea
                    name="bio"
                    rows="3"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="نبذة مختصرة عن الطبيب وخبراته..."
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
                    الطبيب نشط ومتاح للاستشارات
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
                    {editingDoctor ? 'تحديث البيانات' : 'إضافة الطبيب'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB Button */}
      {user?.role === 'admin' && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => openModal()}
          className="fixed bottom-8 left-8 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 z-40"
        >
          <Plus className="h-6 w-6" />
        </motion.button>
      )}
    </div>
  );
};

export default Doctors;
