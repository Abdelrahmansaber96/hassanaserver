# ✅ إضافة حقل عدد الحيوانات (Count Field)

## 📋 التحديثات المنفذة

### 1. تحديث Model (Customer.js)
تم إضافة حقل `count` إلى animals subdocument:
```javascript
animals: [{
  name: { type: String, required: true },
  type: { type: String, enum: [...], required: true },
  count: {
    type: Number,
    required: [true, 'Count is required'],
    min: [1, 'Count must be at least 1'],
    default: 1
  },
  age: { type: Number },
  weight: { type: Number },
  breed: { type: String },
  isActive: { type: Boolean, default: true }
}]
```

### 2. تحديث Validators (index.js)
#### Animal Validator للـ Customer API:
```javascript
const animalValidator = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  type: Joi.string().valid('camel', 'sheep', 'goat', 'cow', 'horse', 'other').required(),
  count: Joi.number().min(1).max(1000).required(),
  age: Joi.number().min(0).max(50).optional(),
  weight: Joi.number().min(0).max(2000).optional(),
  breed: Joi.string().max(100).optional(),
  notes: Joi.string().max(500).optional()
});
```

#### Animal Schema للـ Dashboard:
```javascript
const animalSchema = Joi.object({
  name: Joi.string().min(1).max(50).required(),
  type: Joi.string().valid('camel', 'sheep', 'goat', 'cow', 'other').required(),
  count: Joi.number().min(1).max(1000).optional().default(1),
  // ... باقي الحقول
});
```

### 3. تحديث Controller (customerApiController.js)
#### إضافة حيوان - addAnimal:
```javascript
const addAnimal = asyncHandler(async (req, res) => {
  const { customerId } = req.params;
  const { name, type, count, age, weight, breed, notes } = req.body;

  // التحقق من الـ count
  if (!count || count < 1) {
    return sendError(res, 'Count must be at least 1', 400);
  }

  // إضافة الحيوان مع الـ count
  const newAnimal = {
    name,
    type,
    count: count || 1,
    age: age || 0,
    weight: weight || 0,
    breed: breed || '',
    notes: notes || '',
    isActive: true
  };

  customer.animals.push(newAnimal);
  await customer.save();
  // ...
});
```

#### تعديل حيوان - updateAnimal:
```javascript
const updateAnimal = asyncHandler(async (req, res) => {
  const { customerId, animalId } = req.params;
  const { name, type, count, age, weight, breed, notes } = req.body;

  // التحقق من الـ count عند التعديل
  if (count !== undefined && count < 1) {
    return sendError(res, 'Count must be at least 1', 400);
  }

  // تحديث الحيوان
  if (name) animal.name = name;
  if (type) animal.type = type;
  if (count !== undefined) animal.count = count;
  // ... باقي الحقول
});
```

### 4. تحديث التوثيق

#### FLUTTER_API_ENDPOINTS.md:
```markdown
### إضافة حيوان جديد
POST /api/customer-api/:customerId/animals

Body:
{
  "name": "صقر",
  "type": "camel",
  "count": 5,          // ⭐ حقل جديد مطلوب
  "breed": "مجاهيم",
  "age": 3,
  "weight": 450,
  "notes": "حيوانات نشيطة"
}
```

#### FLUTTER_EXAMPLES.md:
```dart
static Future<Map<String, dynamic>> addAnimal({
  required String customerId,
  required String name,
  required String type,
  required int count,     // ⭐ حقل جديد مطلوب
  int? age,
  double? weight,
  String? breed,
  String? notes,
}) async {
  // ...
  body: jsonEncode({
    'name': name,
    'type': type,
    'count': count,       // ⭐ إرسال العدد
    'age': age,
    'weight': weight,
    'breed': breed,
    'notes': notes,
  }),
}
```

## 📝 كيفية الاستخدام

### مثال 1: إضافة مجموعة من الإبل
```json
POST /api/customer-api/67123abc.../animals

{
  "name": "إبل المزرعة الشمالية",
  "type": "camel",
  "count": 15,
  "breed": "مجاهيم",
  "age": 4,
  "notes": "إبل للحليب"
}
```

### مثال 2: إضافة قطيع من الأغنام
```json
POST /api/customer-api/67123abc.../animals

{
  "name": "أغنام الربيع",
  "type": "sheep",
  "count": 50,
  "breed": "نجدي",
  "age": 2
}
```

### مثال 3: إضافة حيوان واحد
```json
POST /api/customer-api/67123abc.../animals

{
  "name": "الصقر",
  "type": "horse",
  "count": 1,
  "breed": "عربي أصيل",
  "age": 5,
  "weight": 450
}
```

### مثال 4: تعديل عدد الحيوانات
```json
PUT /api/customer-api/67123abc.../animals/67456def...

{
  "count": 20
}
```

## ✅ التحقق من الصحة

### قواعد الـ count:
- ✅ **مطلوب** (required) عند إضافة حيوان جديد
- ✅ يجب أن يكون **على الأقل 1**
- ✅ لا يمكن أن يتجاوز **1000**
- ✅ يمكن تعديله عند تحديث بيانات الحيوان
- ✅ القيمة الافتراضية: **1**

### رسائل الخطأ:
```json
// عند إرسال count أقل من 1
{
  "success": false,
  "message": "Count must be at least 1"
}

// عند عدم إرسال count (من الـ validator)
{
  "success": false,
  "message": "Validation failed",
  "errors": [{
    "field": "count",
    "message": "Count is required"
  }]
}

// عند إرسال count أكثر من 1000 (من الـ validator)
{
  "success": false,
  "message": "Validation failed",
  "errors": [{
    "field": "count",
    "message": "Count cannot exceed 1000"
  }]
}
```

## 🎯 الفائدة من الحقل

### 1. **التعامل مع القطعان**
- يمكن للعميل تسجيل قطيع كامل بدلاً من تسجيل كل حيوان على حدة
- مثال: 50 رأس من الأغنام بدلاً من 50 سجل منفصل

### 2. **سهولة الحجز**
- عند حجز تطعيم، يمكن للنظام حساب التكلفة حسب العدد
- مثال: تطعيم × 15 إبل = التكلفة الإجمالية

### 3. **الإحصائيات الدقيقة**
- يمكن حساب إجمالي عدد الحيوانات المسجلة في النظام
- مثال: عميل لديه 3 سجلات (15 إبل + 50 غنم + 1 حصان) = 66 حيوان

### 4. **المرونة في الإدارة**
- يمكن تحديث العدد عند الزيادة أو النقصان
- مثال: ولادة 5 حملان جدد → تحديث count من 50 إلى 55

## 🔄 الحالات القديمة

### للسجلات القديمة التي لا تحتوي على count:
```javascript
// القيمة الافتراضية في الـ Model
count: {
  type: Number,
  required: [true, 'Count is required'],
  min: [1, 'Count must be at least 1'],
  default: 1                               // ⭐ قيمة افتراضية
}
```

- جميع الحيوانات القديمة ستأخذ القيمة الافتراضية: **1**
- يمكن تحديثها لاحقاً حسب الحاجة

## 📊 أمثلة استخدام في Flutter

```dart
// إضافة قطيع كبير
final result = await CustomerService.addAnimal(
  customerId: customerId,
  name: 'إبل المزرعة',
  type: 'camel',
  count: 25,          // 25 رأس من الإبل
  breed: 'مجاهيم',
);

// إضافة حيوان واحد
final result = await CustomerService.addAnimal(
  customerId: customerId,
  name: 'الفحل الأبيض',
  type: 'horse',
  count: 1,           // حصان واحد
  breed: 'عربي',
);

// عرض إجمالي عدد الحيوانات
int totalCount = animals.fold(0, (sum, animal) => sum + animal.count);
print('إجمالي عدد الحيوانات: $totalCount');
```

## 🎉 ملخص

✅ تم إضافة حقل `count` إلى جدول الحيوانات  
✅ الحقل **مطلوب** ويجب أن يكون على الأقل 1  
✅ تم تحديث الـ Model، Validators، Controller  
✅ تم تحديث التوثيق (FLUTTER_API_ENDPOINTS.md و FLUTTER_EXAMPLES.md)  
✅ السيرفر يعمل بنجاح مع التحديثات الجديدة  

## 🚀 الخطوة التالية

يمكنك الآن:
1. اختبار إضافة حيوان مع حقل `count`
2. تحديث تطبيق Flutter لإضافة حقل إدخال العدد
3. استخدام العدد في حسابات التكلفة والإحصائيات
