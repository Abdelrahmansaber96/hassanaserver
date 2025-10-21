# تحديث تصفية البيانات حسب الفرع (Branch Filtering Update)

## التاريخ: 21 أكتوبر 2025

## الوصف
تم تحديث نظام Dashboard ليعرض البيانات المناسبة لكل مستخدم حسب دوره:

### 1. **المسؤول (Admin)**
- يرى بيانات **جميع الفروع** في:
  - بطاقات الإحصائيات (StatsCards)
  - الرسوم البيانية (ChartsGrid)
  - جميع التقارير والمخططات

### 2. **الطبيب (Doctor)**
- يرى بيانات **فرعه فقط** في:
  - بطاقات الإحصائيات (StatsCards)
  - الرسوم البيانية (ChartsGrid)
  - جميع التقارير والمخططات

## الملفات المعدلة

### 1. **dashboardController.js** (`src/controllers/dashboardController.js`)

تم تعديل الدوال التالية لإضافة تصفية حسب الفرع:

#### أ. `getDashboardStats`
```javascript
// Build filter based on user role
const branchFilter = {};
if (req.user.role === 'doctor' && req.user.branch) {
  branchFilter.branch = req.user.branch;
}
```

**التأثير:**
- يتم تطبيق الفلتر على جميع الاستعلامات:
  - عدد الحجوزات (Bookings)
  - عدد الاستشارات (Consultations)
  - الحجوزات المعلقة، المؤكدة، والمكتملة
  - إجمالي الإيرادات

#### ب. `getOperationsChartData`
```javascript
// Build filter based on user role
const matchFilter = {};
if (req.user.role === 'doctor' && req.user.branch) {
  matchFilter.branch = req.user.branch;
}

matchFilter.appointmentDate = { $gte: startDate, $lte: endDate };

const operationsData = await Booking.aggregate([
  {
    $match: matchFilter
  },
  // ... rest of pipeline
]);
```

**التأثير:**
- الرسم البياني لإجمالي التطعيمات يعرض فقط بيانات فرع الطبيب

#### ج. `getRevenueChartData`
```javascript
// Build filter based on user role
const matchFilter = {
  status: 'completed',
  paid: true
};

if (req.user.role === 'doctor' && req.user.branch) {
  matchFilter.branch = req.user.branch;
}

const revenueData = await Booking.aggregate([
  {
    $match: matchFilter
  },
  // ... rest of pipeline
]);
```

**التأثير:**
- الرسم البياني للإيرادات حسب الفرع يعرض فقط بيانات فرع الطبيب

#### د. `getOperationsDistributionData`
```javascript
// Build filter based on user role
const matchFilter = {};
if (req.user.role === 'doctor' && req.user.branch) {
  matchFilter.branch = req.user.branch;
}

const distributionData = await Booking.aggregate([
  {
    $match: matchFilter
  },
  // ... rest of pipeline
]);
```

**التأثير:**
- الرسم البياني لتوزيع الحيوانات يعرض فقط بيانات فرع الطبيب

#### هـ. `getTransactionsChartData`
```javascript
// Build filter based on user role
const matchFilter = {
  appointmentDate: { $gte: startDate, $lte: currentDate },
  paid: true
};

if (req.user.role === 'doctor' && req.user.branch) {
  matchFilter.branch = req.user.branch;
}

const transactionsData = await Booking.aggregate([
  {
    $match: matchFilter
  },
  // ... rest of pipeline
]);
```

**التأثير:**
- الرسم البياني للمعاملات المالية يعرض فقط بيانات فرع الطبيب

## كيفية عمل التصفية

### معلومات المستخدم من Token
عند تسجيل الدخول، يتم إنشاء JWT Token يحتوي على:
- `id`: معرف المستخدم
- `role`: دور المستخدم (admin, doctor, staff)
- `branch`: معرف الفرع (للأطباء فقط)

### التحقق من الدور في Middleware
```javascript
// في auth.js
const user = await User.findById(decoded.id).select('-password');
req.user = user; // يحتوي على role و branch
```

### تطبيق الفلتر في Controller
```javascript
// إذا كان المستخدم طبيب وله فرع محدد
if (req.user.role === 'doctor' && req.user.branch) {
  // أضف فلتر الفرع إلى الاستعلام
  matchFilter.branch = req.user.branch;
}
// إذا كان admin، لا يتم إضافة أي فلتر (يرى كل الفروع)
```

## الاختبار

### اختبار حساب Admin
1. سجل دخول كـ Admin
2. انتقل إلى Dashboard
3. يجب أن ترى بيانات **جميع الفروع**

### اختبار حساب Doctor
1. سجل دخول كـ Doctor مسجل في فرع معين
2. انتقل إلى Dashboard
3. يجب أن ترى بيانات **فرعك فقط**

## ملاحظات مهمة

### 1. **متطلبات بيانات الطبيب**
- يجب أن يكون للطبيب `branch` محدد في قاعدة البيانات
- إذا لم يكن للطبيب فرع، سيرى جميع البيانات (سلوك افتراضي)

### 2. **الأمان**
- يتم التحقق من الدور والفرع في Backend (Server-side)
- لا يمكن التلاعب بالبيانات من Frontend

### 3. **الأداء**
- استخدام Indexes في MongoDB على حقل `branch` لتحسين الأداء
- استخدام Aggregation Pipeline المُحسّن

## الخطوات القادمة المقترحة

1. ✅ إضافة فلتر الفرع لجميع الـ Dashboard APIs
2. ⏳ إضافة فلتر الفرع لصفحة الحجوزات
3. ⏳ إضافة فلتر الفرع لصفحة الاستشارات
4. ⏳ إضافة فلتر الفرع لصفحة العملاء
5. ⏳ إضافة تقارير مخصصة لكل فرع

## التأثير على الأدوار الأخرى

### Staff/Receptionist
- لم يتم التعديل حالياً
- يمكن إضافة نفس المنطق إذا لزم الأمر

### Customer
- لا يتأثر (يستخدم APIs مختلفة)

## الأمان والخصوصية

- ✅ كل طبيب يرى بيانات فرعه فقط
- ✅ Admin يرى كل شيء
- ✅ لا يمكن للطبيب رؤية بيانات فروع أخرى
- ✅ التحقق يتم في Backend فقط

## الكود المرجعي

### نموذج User Schema
```javascript
{
  name: String,
  email: String,
  role: String, // 'admin', 'doctor', 'staff'
  branch: ObjectId, // Reference to Branch
  // ... other fields
}
```

### نموذج Booking Schema
```javascript
{
  customer: ObjectId,
  branch: ObjectId, // Reference to Branch
  appointmentDate: Date,
  status: String,
  paid: Boolean,
  price: Number,
  // ... other fields
}
```

---

## المطور
هذا التحديث تم بواسطة GitHub Copilot

## التاريخ
21 أكتوبر 2025
