import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Syringe, Filter, X } from 'lucide-react';

const Vaccinations = () => {
  const [vaccinations, setVaccinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentVaccination, setCurrentVaccination] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnimalType, setFilterAnimalType] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    description: '',
    descriptionAr: '',
    animalTypes: [],
    price: '',
    duration: 30,
    frequency: 'once',
    frequencyMonths: 12,
    ageRange: {
      min: 0,
      max: 20
    },
    sideEffects: [],
    sideEffectsAr: [],
    instructions: '',
    instructionsAr: '',
    isActive: true
  });

  const animalTypesOptions = [
    { value: 'camel', label: 'إبل' },
    { value: 'sheep', label: 'أغنام' },
    { value: 'goat', label: 'ماعز' },
    { value: 'cow', label: 'ماشية' },
    { value: 'horse', label: 'خيول' },
    { value: 'other', label: 'أخرى' }
  ];

  const frequencyOptions = [
    { value: 'once', label: 'مرة واحدة' },
    { value: 'annually', label: 'سنوياً' },
    { value: 'biannually', label: 'كل 6 أشهر' },
    { value: 'monthly', label: 'شهرياً' },
    { value: 'custom', label: 'مخصص' }
  ];

  // Fetch vaccinations
  const fetchVaccinations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/vaccinations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Vaccinations data:', data);
        setVaccinations(data.data?.vaccinations || data.data || []);
      } else {
        setError('فشل في جلب التطعيمات');
      }
    } catch (error) {
      console.error('Error fetching vaccinations:', error);
      setError('حدث خطأ في جلب التطعيمات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVaccinations();
  }, []);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: type === 'number' ? parseFloat(value) : value
        }
      });
    } else if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else if (type === 'number') {
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle animal types selection
  const handleAnimalTypeChange = (animalType) => {
    const currentTypes = formData.animalTypes;
    if (currentTypes.includes(animalType)) {
      setFormData({
        ...formData,
        animalTypes: currentTypes.filter(type => type !== animalType)
      });
    } else {
      setFormData({
        ...formData,
        animalTypes: [...currentTypes, animalType]
      });
    }
  };

  // Handle arrays (side effects)
  const handleArrayInput = (fieldName, value) => {
    setFormData({
      ...formData,
      [fieldName]: value.split(',').map(item => item.trim()).filter(item => item)
    });
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      nameAr: '',
      description: '',
      descriptionAr: '',
      animalTypes: [],
      price: '',
      duration: 30,
      frequency: 'once',
      frequencyMonths: 12,
      ageRange: {
        min: 0,
        max: 20
      },
      sideEffects: [],
      sideEffectsAr: [],
      instructions: '',
      instructionsAr: '',
      isActive: true
    });
    setError('');
  };

  // Open modal for new vaccination
  const handleAddNew = () => {
    resetForm();
    setEditMode(false);
    setCurrentVaccination(null);
    setShowModal(true);
  };

  // Open modal for editing
  const handleEdit = (vaccination) => {
    setFormData({
      name: vaccination.name || '',
      nameAr: vaccination.nameAr || '',
      description: vaccination.description || '',
      descriptionAr: vaccination.descriptionAr || '',
      animalTypes: vaccination.animalTypes || [],
      price: vaccination.price || '',
      duration: vaccination.duration || 30,
      frequency: vaccination.frequency || 'once',
      frequencyMonths: vaccination.frequencyMonths || 12,
      ageRange: {
        min: vaccination.ageRange?.min || 0,
        max: vaccination.ageRange?.max || 20
      },
      sideEffects: vaccination.sideEffects || [],
      sideEffectsAr: vaccination.sideEffectsAr || [],
      instructions: vaccination.instructions || '',
      instructionsAr: vaccination.instructionsAr || '',
      isActive: vaccination.isActive !== undefined ? vaccination.isActive : true
    });
    setEditMode(true);
    setCurrentVaccination(vaccination);
    setShowModal(true);
  };

  // Handle save (create or update)
  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.nameAr || !formData.name) {
      setError('الرجاء إدخال اسم التطعيم بالعربي والإنجليزي');
      return;
    }

    if (formData.animalTypes.length === 0) {
      setError('الرجاء اختيار نوع حيوان واحد على الأقل');
      return;
    }

    if (!formData.price || formData.price <= 0) {
      setError('الرجاء إدخال سعر صحيح');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const url = editMode
        ? `http://localhost:3000/api/vaccinations/${currentVaccination._id}`
        : 'http://localhost:3000/api/vaccinations';

      const method = editMode ? 'PUT' : 'POST';

      console.log('Sending vaccination data:', formData);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      console.log('Response:', data);

      if (response.ok) {
        setShowModal(false);
        resetForm();
        fetchVaccinations();
      } else {
        // عرض الأخطاء بالتفصيل
        if (data.errors && Array.isArray(data.errors)) {
          const errorMessages = data.errors.map(err => err.message || err).join('\n');
          setError(errorMessages);
        } else {
          setError(data.message || 'فشل في حفظ التطعيم');
        }
      }
    } catch (error) {
      console.error('Error saving vaccination:', error);
      setError('حدث خطأ أثناء حفظ التطعيم');
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا التطعيم؟')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/vaccinations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchVaccinations();
      } else {
        setError('فشل في حذف التطعيم');
      }
    } catch (error) {
      console.error('Error deleting vaccination:', error);
      setError('حدث خطأ أثناء حذف التطعيم');
    }
  };

  // Translate animal type
  const translateAnimalType = (type) => {
    const translation = {
      camel: 'إبل',
      sheep: 'أغنام',
      goat: 'ماعز',
      cow: 'ماشية',
      horse: 'خيول',
      other: 'أخرى'
    };
    return translation[type] || type;
  };

  // Translate frequency
  const translateFrequency = (freq) => {
    const translation = {
      once: 'مرة واحدة',
      annually: 'سنوياً',
      biannually: 'كل 6 أشهر',
      monthly: 'شهرياً',
      custom: 'مخصص'
    };
    return translation[freq] || freq;
  };

  // Filter vaccinations
  const filteredVaccinations = Array.isArray(vaccinations) ? vaccinations.filter(vaccination => {
    const matchesSearch = 
      vaccination.nameAr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vaccination.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAnimalType = 
      !filterAnimalType || 
      (vaccination.animalTypes && vaccination.animalTypes.includes(filterAnimalType));

    return matchesSearch && matchesAnimalType;
  }) : [];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="p-6 mt-14">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Syringe className="h-8 w-8 text-blue-600" />
          إدارة التطعيمات
        </h1>
        <p className="text-gray-600 mt-1">إدارة التطعيمات المتاحة للحيوانات المختلفة</p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="البحث عن تطعيم..."
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Animal Type Filter */}
          <div className="relative">
            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterAnimalType}
              onChange={(e) => setFilterAnimalType(e.target.value)}
            >
              <option value="">كل أنواع الحيوانات</option>
              {animalTypesOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Add Button */}
          <button
            onClick={handleAddNew}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            إضافة تطعيم جديد
          </button>
        </div>
      </div>

      {/* Vaccinations Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  اسم التطعيم
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  أنواع الحيوانات
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  السعر
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المدة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  التكرار
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الفئة العمرية
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
              {Array.isArray(filteredVaccinations) && filteredVaccinations.map((vaccination) => (
                <tr key={vaccination._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{vaccination.nameAr}</div>
                      <div className="text-sm text-gray-500">{vaccination.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(vaccination.animalTypes) && vaccination.animalTypes.map((type, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {translateAnimalType(type)}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {vaccination.price} ريال
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {vaccination.duration} دقيقة
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {translateFrequency(vaccination.frequency)}
                    {vaccination.frequency === 'custom' && ` (${vaccination.frequencyMonths} شهر)`}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {vaccination.ageRange?.min} - {vaccination.ageRange?.max} سنة
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        vaccination.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {vaccination.isActive ? 'نشط' : 'غير نشط'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(vaccination)}
                        className="text-blue-600 hover:text-blue-900"
                        title="تعديل"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(vaccination._id)}
                        className="text-red-600 hover:text-red-900"
                        title="حذف"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredVaccinations.length === 0 && (
            <div className="text-center py-12">
              <Syringe className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد تطعيمات</h3>
              <p className="mt-1 text-sm text-gray-500">ابدأ بإضافة تطعيم جديد</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editMode ? 'تعديل التطعيم' : 'إضافة تطعيم جديد'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              {/* Names */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    اسم التطعيم (عربي) *
                  </label>
                  <input
                    type="text"
                    name="nameAr"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.nameAr}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    اسم التطعيم (إنجليزي) *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الوصف (عربي)
                  </label>
                  <textarea
                    name="descriptionAr"
                    rows="3"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.descriptionAr}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الوصف (إنجليزي)
                  </label>
                  <textarea
                    name="description"
                    rows="3"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Animal Types */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  أنواع الحيوانات المناسبة *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {animalTypesOptions.map(option => (
                    <label key={option.value} className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.animalTypes.includes(option.value)}
                        onChange={() => handleAnimalTypeChange(option.value)}
                        className="rounded"
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price, Duration, Frequency */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    السعر (ريال) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    required
                    min="0"
                    step="0.01"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.price}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    المدة (دقيقة)
                  </label>
                  <input
                    type="number"
                    name="duration"
                    min="5"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.duration}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    التكرار
                  </label>
                  <select
                    name="frequency"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.frequency}
                    onChange={handleChange}
                  >
                    {frequencyOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Custom Frequency */}
              {formData.frequency === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    التكرار المخصص (بالأشهر)
                  </label>
                  <input
                    type="number"
                    name="frequencyMonths"
                    min="1"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.frequencyMonths}
                    onChange={handleChange}
                  />
                </div>
              )}

              {/* Age Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الحد الأدنى للعمر (سنة)
                  </label>
                  <input
                    type="number"
                    name="ageRange.min"
                    min="0"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.ageRange.min}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الحد الأقصى للعمر (سنة)
                  </label>
                  <input
                    type="number"
                    name="ageRange.max"
                    min="0"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.ageRange.max}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Side Effects */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الآثار الجانبية (عربي) - مفصولة بفاصلة
                  </label>
                  <textarea
                    name="sideEffectsAr"
                    rows="2"
                    placeholder="حمى خفيفة, ألم في مكان الحقن, خمول"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.sideEffectsAr.join(', ')}
                    onChange={(e) => handleArrayInput('sideEffectsAr', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الآثار الجانبية (إنجليزي) - مفصولة بفاصلة
                  </label>
                  <textarea
                    name="sideEffects"
                    rows="2"
                    placeholder="Mild fever, Injection site pain, Lethargy"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.sideEffects.join(', ')}
                    onChange={(e) => handleArrayInput('sideEffects', e.target.value)}
                  />
                </div>
              </div>

              {/* Instructions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    التعليمات (عربي)
                  </label>
                  <textarea
                    name="instructionsAr"
                    rows="3"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.instructionsAr}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    التعليمات (إنجليزي)
                  </label>
                  <textarea
                    name="instructions"
                    rows="3"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.instructions}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Active Status */}
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">تطعيم نشط</span>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editMode ? 'تحديث' : 'إضافة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vaccinations;
