# API Endpoints for Flutter Customer App

## Base URL
```
http://localhost:3000/api
```
أو عند الرفع على السيرفر استخدم الدومين الخاص بك.

---

## 🔐 Authentication (المصادقة) - بدون كلمة مرور

### 1. تسجيل عميل جديد (الاسم ورقم الهاتف فقط)
```
POST /api/customer-api/register
```
**Body:**
```json
{
  "name": "أحمد محمد",
  "phone": "0512345678"
}
```
**ملاحظات:**
- رقم الهاتف يجب أن يكون بصيغة سعودية: `05xxxxxxxx` أو `9665xxxxxxxx` أو `+9665xxxxxxxx`
- سيتم تحويل الرقم تلقائياً للصيغة الموحدة: `05xxxxxxxx`
- ⚠️ **رقم الهاتف فريد**: لا يمكن التسجيل بنفس الرقم مرتين
- إذا كان الرقم مسجل مسبقاً، ستحصل على خطأ
- لا يوجد token - التسجيل مباشر

**Response (Success):**
```json
{
  "success": true,
  "message": "تم التسجيل بنجاح",
  "data": {
    "customer": {
      "id": "67123abc...",
      "name": "أحمد محمد",
      "phone": "0512345678",
      "city": null,
      "address": null,
      "email": null,
      "animals": []
    }
  }
}
```

**Response (Error - Duplicate Phone):**
```json
{
  "success": false,
  "message": "هذا الرقم مسجل مسبقاً. يرجى استخدام رقم آخر أو تسجيل الدخول."
}
```

**Response (Error - Invalid Format):**
```json
{
  "success": false,
  "message": "Invalid phone number format. Use Saudi format: 05xxxxxxxx"
}
```

---

### 2. تسجيل الدخول (رقم الهاتف فقط - بدون كلمة مرور)
```
POST /api/customer-api/login
```
**Body:**
```json
{
  "phone": "0512345678"
}
```
**ملاحظات:**
- يتم التحقق من رقم الهاتف فقط
- لا يوجد token - يتم إرجاع بيانات العميل مباشرة
- احفظ `customer.id` في التطبيق للاستخدام في باقي الطلبات

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "customer": {
      "id": "67123abc...",
      "name": "أحمد محمد",
      "phone": "0512345678",
      "city": "الرياض",
      "address": "حي النخيل",
      "email": "ahmed@example.com",
      "animals": [
        {
          "_id": "animal123",
          "name": "صقر",
          "type": "camel",
          "age": 3
        }
      ],
      "totalBookings": 5,
      "lastBookingDate": "2025-10-20T..."
    }
  }
}
```

---

### 3. الحصول على معلومات العميل
```
GET /api/customer-api/profile/:customerId
```
**مثال:**
```
GET /api/customer-api/profile/67123abc...
```
**Response:**
```json
{
  "success": true,
  "data": {
    "customer": {
      "id": "67123abc...",
      "name": "أحمد محمد",
      "phone": "0512345678",
      "city": "الرياض",
      "address": "حي النخيل، شارع الملك فهد",
      "email": "ahmed@example.com",
      "animals": [],
      "totalBookings": 5,
      "lastBookingDate": "2025-10-20T..."
    }
  }
}
```

---

### 4. تحديث معلومات العميل
```
PUT /api/customer-api/profile/:customerId
```
**Body:**
```json
{
  "name": "أحمد محمد السعيد",
  "email": "ahmed.new@example.com",
  "city": "جدة",
  "address": "حي الروضة"
}
```
**ملاحظة:** لا يمكن تغيير رقم الهاتف

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "customer": {
      "id": "67123abc...",
      "name": "أحمد محمد السعيد",
      "phone": "0512345678",
      "city": "جدة",
      "address": "حي الروضة",
      "email": "ahmed.new@example.com"
    }
  }
}
```

---

## 🐪 Animals (الحيوانات)

### 5. إضافة حيوان جديد
```
POST /api/customer-api/:customerId/animals
```
**مثال:**
```
POST /api/customer-api/67123abc.../animals
```
**Body:**
```json
{
  "name": "صقر",
  "type": "camel",
  "count": 5,
  "breed": "مجاهيم",
  "age": 3,
  "weight": 450,
  "notes": "حيوانات نشيطة"
}
```
**الحقول المطلوبة:**
- `name` (string, مطلوب) - اسم الحيوان أو المجموعة
- `type` (string, مطلوب) - نوع الحيوان
- `count` (number, مطلوب) - عدد الحيوانات (على الأقل 1)

**أنواع الحيوانات المتاحة:**
- `camel` - إبل
- `sheep` - أغنام
- `goat` - ماعز
- `cow` - أبقار
- `horse` - خيول
- `other` - أخرى

---

### 6. الحصول على جميع حيوانات العميل
```
GET /api/customer-api/:customerId/animals
```
**مثال:**
```
GET /api/customer-api/67123abc.../animals
```
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "صقر",
      "type": "camel",
      "breed": "مجاهيم",
      "age": 3,
      "gender": "male",
      "vaccinations": []
    }
  ]
}
```

---

### 7. تحديث معلومات حيوان
```
PUT /api/customer-api/:customerId/animals/:animalId
```
**مثال:**
```
PUT /api/customer-api/67123abc.../animals/animal123
```
**Body:**
```json
{
  "name": "صقر المحدث",
  "age": 4,
  "weight": 460
}
```

---

### 8. حذف حيوان
```
DELETE /api/customer-api/:customerId/animals/:animalId
```
**مثال:**
```
DELETE /api/customer-api/67123abc.../animals/animal123
```

---

## 🏥 Branches (الفروع)

### 9. الحصول على جميع الفروع
```
GET /api/branches
```
**ملاحظة:** لا يحتاج authentication
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "فرع الرياض الرئيسي",
      "code": "RYD001",
      "city": "الرياض",
      "address": "حي النخيل، طريق الملك فهد",
      "phone": "0112345678",
      "email": "riyadh@clinic.com",
      "image": "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800",
      "workingHours": {
        "start": "08:00",
        "end": "20:00"
      },
      "workingDays": ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday"],
      "capacity": 100,
      "facilities": ["غرف فحص", "مختبر", "صيدلية", "موقف سيارات"],
      "services": ["تطعيمات الإبل", "تطعيمات الأغنام", "فحوصات طبية"],
      "rating": 4.5,
      "isActive": true,
      "coordinates": {
        "latitude": 24.7136,
        "longitude": 46.6753
      }
    }
  ]
}
```

---

### 11. الحصول على تفاصيل فرع معين
```
GET /branches/:branchId
```
**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 👨‍⚕️ Doctors (الأطباء)

### 12. الحصول على جميع الأطباء
```
GET /api/doctors
```
**ملاحظة:** لا يحتاج authentication ✅

**Query Parameters (اختياري):**
- `branch=BRANCH_ID` - تصفية حسب الفرع
- `specialization=تخصص` - تصفية حسب التخصص

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "د. محمد أحمد",
      "specialization": "طب بيطري عام",
      "phone": "0501234567",
      "email": "dr.mohamed@clinic.com",
      "branch": {
        "_id": "...",
        "name": "فرع الرياض",
        "city": "الرياض"
      },
      "rating": 4.5,
      "totalReviews": 25,
      "consultationFee": 200,
      "workingHours": {
        "start": "08:00",
        "end": "17:00"
      },
      "workingDays": ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس"],
      "bio": "طبيب بيطري متخصص في علاج الإبل"
    }
  ]
}
```

---

### 13. الحصول على تفاصيل طبيب معين
```
GET /api/doctors/:doctorId
```
**ملاحظة:** لا يحتاج authentication ✅

---

## 📅 Bookings (الحجوزات)

### 10. إنشاء حجز تطعيم جديد
```
POST /api/customer-api/:customerId/bookings
```
**مثال:**
```
POST /api/customer-api/67123abc.../bookings
```

**📋 البيانات المطلوبة (Required):**

| الحقل | النوع | الوصف | مثال |
|------|------|-------|------|
| `animalId` | String | معرف الحيوان من قائمة حيوانات العميل | `"67456def..."` |
| `vaccinationId` | String | معرف التطعيم من قائمة التطعيمات | `"671234..."` |
| `branchId` | String | معرف الفرع من قائمة الفروع | `"68df8e48..."` |
| `appointmentDate` | String | تاريخ الموعد (ISO 8601) | `"2025-10-25"` |
| `timeSlot` | String | الوقت المناسب للموعد | `"10:00"` |

**📝 البيانات الاختيارية (Optional):**

| الحقل | النوع | الوصف | مثال |
|------|------|-------|------|
| `notes` | String | ملاحظات إضافية | `"يرجى التعامل بحذر مع الحيوان"` |

**Request Body (مثال كامل):**
```json
{
  "animalId": "67456def89abc123",
  "vaccinationId": "671234567890abcd",
  "branchId": "68df8e48cd10e6f8",
  "appointmentDate": "2025-10-25",
  "timeSlot": "10:00",
  "notes": "الحيوان نشيط جداً، يرجى الحذر"
}
```

**⚠️ ملاحظات مهمة:**
1. **animalId**: يجب أن يكون الحيوان موجوداً في قائمة حيوانات العميل ونشط (`isActive: true`)
2. **vaccinationId**: يجب أن يكون التطعيم نشطاً (`isActive: true`) ومناسباً لنوع الحيوان
3. **branchId**: يجب أن يكون الفرع نشطاً (`isActive: true`)
4. **appointmentDate**: يجب أن يكون تاريخاً في المستقبل
5. **عدد الحيوانات (count)**: يتم جلبه تلقائياً من بيانات الحيوان المحفوظة في قائمة حيوانات العميل
6. **التحقق التلقائي**: السيرفر يتحقق من:
   - أن التطعيم مناسب لنوع الحيوان
   - أن جميع الـ IDs موجودة وصحيحة
   - أن الحيوان ينتمي للعميل فعلاً

**Response (Success):**
```json
{
  "success": true,
  "message": "Vaccination appointment booked successfully",
  "data": {
    "booking": {
      "_id": "671abc...",
      "bookingNumber": "BK000123",
      "customer": "67123abc...",
      "animal": {
        "id": "67456def...",
        "name": "صقر",
        "type": "camel",
        "age": 3,
        "weight": 450,
        "count": 5
      },
      "vaccination": {
        "id": "671234...",
        "name": "Rift Valley Fever",
        "nameAr": "حمى الوادي المتصدع",
        "price": 150,
        "duration": 30,
        "frequency": "annually",
        "frequencyMonths": 12
      },
      "branch": "68df8e48...",
      "appointmentDate": "2025-10-25T00:00:00.000Z",
      "timeSlot": "10:00",
      "status": "pending",
      "totalAmount": 150,
      "notes": "الحيوان نشيط جداً، يرجى الحذر",
      "customerPhone": "0512345678",
      "createdAt": "2025-10-24T10:30:00.000Z"
    }
  }
}
```

**Response (Error - Animal not found):**
```json
{
  "success": false,
  "message": "Animal not found"
}
```

**Response (Error - Vaccination not suitable):**
```json
{
  "success": false,
  "message": "This vaccination is not suitable for this animal type"
}
```

**Response (Error - Branch not found):**
```json
{
  "success": false,
  "message": "Branch not found"
}
```

**🔄 خطوات الحجز في التطبيق:**

```dart
// الخطوة 1: احصل على قائمة الحيوانات
final animals = await getAnimals(customerId);
final selectedAnimal = animals[0]; // اختر حيوان

// الخطوة 2: احصل على التطعيمات المناسبة للحيوان
final vaccinations = await getVaccinationsForAnimal(
  customerId: customerId,
  animalId: selectedAnimal['_id']
);
final selectedVaccination = vaccinations[0]; // اختر تطعيم

// الخطوة 3: احصل على الفروع
final branches = await getBranches();
final selectedBranch = branches[0]; // اختر فرع

// الخطوة 4: احجز الموعد
final booking = await createBooking(
  customerId: customerId,
  data: {
    'animalId': selectedAnimal['_id'],
    'vaccinationId': selectedVaccination['_id'],
    'branchId': selectedBranch['_id'],
    'appointmentDate': '2025-10-25',
    'timeSlot': '10:00',
    'notes': 'ملاحظات اختيارية'
  }
);
```

**حالات الحجز (Booking Status):**
- `pending` - قيد الانتظار (الحالة الافتراضية عند الإنشاء)
- `confirmed` - مؤكد
- `in_progress` - جاري
- `completed` - مكتمل
- `cancelled` - ملغي

---

### 11. الحصول على حجوزات العميل
```
GET /api/customer-api/:customerId/bookings
```
**مثال:**
```
GET /api/customer-api/67123abc.../bookings
```
**Query Parameters (اختياري):**
- `status=pending` - تصفية حسب الحالة
- `limit=10` - عدد النتائج
- `page=1` - رقم الصفحة

**الحالات المتاحة:**
- `pending` - قيد الانتظار
- `confirmed` - مؤكد
- `in_progress` - جاري
- `completed` - مكتمل
- `cancelled` - ملغي

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "bookingNumber": "BK-2025-001",
      "branch": {
        "_id": "...",
        "name": "فرع الرياض",
        "phone": "0112345678"
      },
      "doctor": {
        "_id": "...",
        "name": "د. محمد أحمد",
        "phone": "0501234567"
      },
      "animal": {
        "name": "صقر",
        "type": "camel",
        "age": 3
      },
      "vaccination": {
        "name": "Anthrax Vaccine",
        "nameAr": "تطعيم الجمرة الخبيثة",
        "price": 200,
        "duration": 45,
        "frequency": "annually",
        "frequencyMonths": 12
      },
      "appointmentDate": "2025-10-25T00:00:00.000Z",
      "appointmentTime": "10:00",
      "serviceType": "vaccination",
      "vaccinationType": "حمى الوادي المتصدع",
      "status": "confirmed",
      "createdAt": "2025-10-22T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 10,
    "page": 1,
    "pages": 1
  }
}
```

---

### 12. إلغاء حجز
```
PUT /api/customer-api/:customerId/bookings/:bookingId/cancel
```
**مثال:**
```
PUT /api/customer-api/67123abc.../bookings/booking123/cancel
```

---

## 💉 Vaccinations (التطعيمات)

### 18. الحصول على التطعيمات المناسبة لحيوان معين
```
GET /api/customer-api/:customerId/animals/:animalId/vaccinations
```
**مثال:**
```
GET /api/customer-api/67123abc.../animals/67456def.../vaccinations
```

**الوصف:**
- يجلب جميع التطعيمات المناسبة للحيوان المحدد
- يقوم بالفلترة التلقائية حسب نوع الحيوان وعمره

**الفلترة التلقائية:**
1. **حسب نوع الحيوان**: يعرض فقط التطعيمات المناسبة لنوع الحيوان (`camel`, `sheep`, `goat`, `cow`, `horse`)
2. **حسب العمر**: إذا كان للتطعيم نطاق عمري محدد (`ageRange`) ولدى الحيوان عمر محدد، يتم الفلترة تلقائياً

**Response:**
```json
{
  "success": true,
  "data": {
    "animal": {
      "id": "67456def...",
      "name": "صقر",
      "type": "camel",
      "age": 3
    },
    "vaccinations": [
      {
        "_id": "671234...",
        "name": "Rift Valley Fever",
        "nameAr": "حمى الوادي المتصدع",
        "description": "Vaccination against Rift Valley Fever",
        "descriptionAr": "تطعيم ضد حمى الوادي المتصدع",
        "price": 150,
        "frequency": "annually",
        "sideEffects": ["Mild fever", "Temporary loss of appetite"],
        "animalTypes": ["camel", "sheep", "cow"],
        "ageRange": {
          "min": 1,
          "max": 20
        },
        "isActive": true
      },
      {
        "_id": "671235...",
        "name": "Anthrax Vaccine",
        "nameAr": "تطعيم الجمرة الخبيثة",
        "description": "Protection against anthrax",
        "descriptionAr": "حماية من الجمرة الخبيثة",
        "price": 200,
        "frequency": "annually",
        "animalTypes": ["camel", "sheep", "goat", "cow"],
        "ageRange": {
          "min": 6,
          "max": 25
        },
        "isActive": false
      }
    ],
    "customer": {
      "id": "67123abc...",
      "name": "أحمد محمد السعيد",
      "phone": "0512345678"
    }
  }
}
```

**ملاحظات:**
- ✅ لا يحتاج authentication
- ✅ يعرض **جميع** التطعيمات (النشطة وغير النشطة)
- ✅ حقل `isActive` يوضح حالة التطعيم:
  - `true` = تطعيم نشط ومتاح للحجز
  - `false` = تطعيم غير نشط (متوقف مؤقتاً)
- ✅ الفلترة تتم تلقائياً حسب نوع الحيوان وعمره
- ✅ يمكن استخدامها لعرض قائمة التطعيمات المتاحة قبل الحجز
- ⚠️ **في التطبيق:** يمكنك عرض التطعيمات غير النشطة بلون مختلف أو علامة "غير متاح"
- ⚠️ **تأكد من إرسال `animalId` صحيح** - لا يمكن أن يكون فارغاً أو `null`

**أخطاء شائعة:**

❌ **خطأ: animalId فارغ**
```
/api/customer-api/68f93996.../animals//vaccinations
                                     ↑↑ فارغ!
```
**الحل:** تأكد من الحصول على `animalId` من قائمة الحيوانات أولاً:
```dart
// 1. احصل على الحيوانات أولاً
final animals = await CustomerService.getAnimals(customerId);

// 2. اختر حيوان من القائمة
if (animals.isNotEmpty) {
  final animalId = animals[0]['_id']; // ✅ تأكد أنه ليس null
  
  // 3. الآن اجلب التطعيمات
  final result = await CustomerService.getVaccinationsForAnimal(
    customerId: customerId,
    animalId: animalId,  // ✅ animalId صحيح
  );
}
```

---

## 📞 Consultations (الاستشارات)

### 20. حجز استشارة
```
POST /api/customer-api/consultations
```
**ملاحظة:** لا يحتاج authentication ✅

**Body:**
```json
{
  "customer": "CUSTOMER_ID",
  "doctor": "DOCTOR_ID",
  "consultationType": "phone",
  "scheduledDate": "2025-10-28",
  "scheduledTime": "14:00",
  "duration": 30,
  "symptoms": "الحيوان يعاني من فقدان الشهية وارتفاع في درجة الحرارة",
  "animalName": "صقر",
  "animalType": "camel",
  "animalAge": 3,
  "price": 100,
  "notes": "استشارة عاجلة"
}
```
**الحقول المطلوبة:**
- `customer` (مطلوب) - معرف العميل
- `doctor` (مطلوب) - معرف الطبيب
- `scheduledDate` (مطلوب) - تاريخ الاستشارة (YYYY-MM-DD)
- `scheduledTime` (مطلوب) - وقت الاستشارة (HH:MM)
- `symptoms` (مطلوب) - وصف الأعراض

**الحقول الاختيارية:**
- `consultationType` - نوع الاستشارة (افتراضي: "phone")
  - **القيم المقبولة:** `phone`, `video`, `emergency`
  - **ملاحظة:** إذا أرسلت `call` سيتم تحويلها تلقائياً إلى `phone` ✅
- `duration` - مدة الاستشارة (دقائق، افتراضي: 30)
- `price` - سعر الاستشارة (افتراضي: 100)
- `animalName` - اسم الحيوان (اختياري، افتراضي: "Not specified")
- `animalType` - نوع الحيوان (اختياري، افتراضي: "other")
  - الأنواع المتاحة: `camel`, `sheep`, `goat`, `cow`, `other`
- `animalAge` - عمر الحيوان (اختياري، افتراضي: 0)
- `notes` - ملاحظات إضافية

**أنواع الاستشارات:**
- `phone` - هاتفية
- `video` - مرئية
- `in-person` - حضورية

**Response:**
```json
{
  "success": true,
  "message": "Consultation booked successfully",
  "data": {
    "_id": "...",
    "consultationNumber": "CONS-2025-001",
    "customer": {
      "_id": "...",
      "name": "أحمد محمد",
      "phone": "0512345678"
    },
    "doctor": {
      "_id": "...",
      "name": "د. محمد أحمد",
      "specialization": "طب بيطري"
    },
    "consultationType": "phone",
    "scheduledDate": "2025-10-28T00:00:00.000Z",
    "scheduledTime": "14:00",
    "duration": 30,
    "status": "scheduled",
    "symptoms": "فقدان الشهية",
    "notes": "استشارة عاجلة"
  }
}
```

---

### 21. الحصول على استشارات العميل
```
GET /api/customer-api/consultations?customerId=CUSTOMER_ID
```
**ملاحظة:** لا يحتاج authentication ✅

**Query Parameters:**
- `customerId` (مطلوب) - معرف العميل

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "consultationNumber": "CONS-2025-001",
      "doctor": {
        "_id": "...",
        "name": "د. محمد أحمد",
        "specialization": "طب بيطري"
      },
      "consultationType": "phone",
      "scheduledDate": "2025-10-25T00:00:00.000Z",
      "scheduledTime": "14:00",
      "duration": 30,
      "status": "scheduled",
      "symptoms": "فقدان الشهية",
      "diagnosis": "",
      "recommendations": ""
    }
  ]
}
```

---

### 22. إضافة تقييم للطبيب بعد الاستشارة
```
POST /api/consultations/:consultationId/review
```
**ملاحظة:** لا يحتاج authentication ✅

**Body:**
```json
{
  "rating": 5,
  "comment": "طبيب ممتاز وخدمة رائعة"
}
```
**ملاحظة:** يمكن التقييم فقط للاستشارات المكتملة.

---

## 🎁 Offers (العروض)

### 23. الحصول على جميع العروض النشطة
```
GET /api/offers?isActive=true
```
**ملاحظة:** لا يحتاج authentication ✅

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "title": "خصم 20% على التطعيمات",
      "description": "احصل على خصم 20% على جميع أنواع التطعيمات",
      "discountPercentage": 20,
      "startDate": "2025-10-01T00:00:00.000Z",
      "endDate": "2025-10-31T23:59:59.999Z",
      "isActive": true,
      "applicableServices": ["vaccination"],
      "image": "offer-image-url.jpg"
    }
  ]
}
```

---

## 🔔 Notifications (الإشعارات)

### 24. الحصول على إشعارات العميل
```
GET /customer-api/notifications
```
**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```
**Query Parameters (اختياري):**
- `limit=20` - عدد الإشعارات
- `page=1` - رقم الصفحة

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "title": "تذكير بموعد الحجز",
      "message": "لديك موعد غداً في الساعة 10:00 صباحاً",
      "type": "booking_reminder",
      "priority": "high",
      "isRead": false,
      "createdAt": "2025-10-22T08:00:00.000Z",
      "relatedEntity": {
        "entityType": "booking",
        "entityId": "BOOKING_ID"
      }
    }
  ]
}
```

---

### 25. تحديد إشعار كمقروء
```
PATCH /notifications/:notificationId/read
```
**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

---

### 26. الحصول على عدد الإشعارات غير المقروءة
```
GET /notifications/unread-count
```
**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```
**Response:**
```json
{
  "success": true,
  "data": {
    "count": 5
  }
}
```

---

## 📊 Dashboard Statistics (إحصائيات العميل)

### 27. الحصول على إحصائيات العميل
```
GET /customer-api/dashboard/stats
```
**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```
**Response:**
```json
{
  "success": true,
  "data": {
    "totalAnimals": 5,
    "totalBookings": 12,
    "upcomingBookings": 2,
    "completedBookings": 8,
    "totalVaccinations": 15,
    "upcomingVaccinations": 3
  }
}
```

---

## 🔍 Search (البحث)

### 28. البحث عن أطباء
```
GET /doctors?search=محمد
```
**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

---

### 29. البحث عن فروع
```
GET /branches?search=الرياض
```
**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## ⚠️ Error Handling (معالجة الأخطاء)

جميع الـ endpoints ترجع أخطاء بالشكل التالي:

```json
{
  "success": false,
  "message": "وصف الخطأ بالعربية",
  "errors": [
    {
      "field": "phone",
      "message": "رقم الهاتف مطلوب"
    }
  ]
}
```

### أخطاء شائعة:

#### 1. رقم هاتف مكرر (400)
```json
{
  "success": false,
  "message": "هذا الرقم مسجل مسبقاً. يرجى استخدام رقم آخر أو تسجيل الدخول."
}
```
**الحل:** استخدم تسجيل الدخول بدلاً من التسجيل، أو استخدم رقم هاتف آخر.

#### 2. رقم هاتف غير صالح (400)
```json
{
  "success": false,
  "message": "Invalid phone number format. Use Saudi format: 05xxxxxxxx"
}
```
**الحل:** تأكد أن الرقم بصيغة سعودية صحيحة.

#### 3. عميل غير موجود (404)
```json
{
  "success": false,
  "message": "Customer not found. Please register first."
}
```
**الحل:** استخدم التسجيل أولاً قبل تسجيل الدخول.

#### 4. حقول مطلوبة (400)
```json
{
  "success": false,
  "message": "Name and phone are required"
}
```
**الحل:** تأكد من إرسال جميع الحقول المطلوبة.

### HTTP Status Codes المستخدمة:
- `200` - نجح الطلب
- `201` - تم الإنشاء بنجاح
- `400` - خطأ في البيانات المرسلة (مثل: رقم مكرر، صيغة خاطئة)
- `403` - ممنوع (حساب غير مفعل)
- `404` - غير موجود (عميل غير مسجل)
- `500` - خطأ في السيرفر

---

## 🔐 No Authentication Required!

**جميع الـ endpoints لا تحتاج إلى Token أو Headers خاصة!**

فقط:
```dart
headers: {
  'Content-Type': 'application/json',
}
```

**مهم جداً:**
1. بعد تسجيل الدخول، احفظ `customer.id` في التطبيق
2. استخدم `customer.id` في جميع الطلبات التي تحتاج `customerId`
3. مثال: `POST /api/customer-api/67123abc.../bookings`

---

## 📱 Pagination (الترقيم)

معظم الـ endpoints تدعم الترقيم:

```
GET /endpoint?page=1&limit=10
```

Response:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 50,
    "page": 1,
    "pages": 5,
    "limit": 10
  }
}
```

---

## 🎯 Important Notes (ملاحظات مهمة)

1. **Customer ID Storage**: احفظ `customer.id` بعد تسجيل الدخول في shared preferences أو secure storage
2. **No Token**: لا يوجد token - النظام يعتمد على customer ID فقط
3. **Auto Login**: يمكنك حفظ رقم الهاتف وعمل auto-login عند فتح التطبيق
4. **Date Format**: التواريخ بصيغة ISO 8601: `2025-10-25T10:30:00.000Z`
5. **Phone Format**: أرقام الهواتف السعودية: `05xxxxxxxx` أو `9665xxxxxxxx` أو `+9665xxxxxxxx`
6. **Phone Normalization**: السيرفر يحول الأرقام تلقائياً للصيغة: `05xxxxxxxx`
7. **Images**: في حالة إضافة صور، استخدم `multipart/form-data`

---

## 📞 Support

في حالة وجود مشاكل أو أسئلة:
- Email: support@clinic.com
- Phone: 0112345678

---

**تم إنشاء الملف بواسطة: GitHub Copilot**
**التاريخ: 22 أكتوبر 2025**
