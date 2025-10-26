# 🔧 الأخطاء الشائعة وحلولها

## 📋 دليل استكشاف الأخطاء وإصلاحها

---

## ❌ خطأ 1: Route not found - animalId فارغ

### الخطأ:
```
DioError Status: 404 Not Found
http://192.168.1.8:3000/api/customer-api/68f93996.../animals//vaccinations
                                                              ↑↑ فارغ!
```

```json
{
  "success": false,
  "message": "Route /api/customer-api/.../animals//vaccinations not found"
}
```

### السبب:
الـ `animalId` يكون `null` أو فارغ عند إرسال الطلب.

### الحل:

#### ✅ الطريقة الصحيحة:

```dart
// 1. احصل على الحيوانات أولاً
Future<void> loadAnimalsAndVaccinations() async {
  // جلب الحيوانات
  final animals = await CustomerService.getAnimals(customerId);
  
  // تحقق من أن القائمة ليست فارغة
  if (animals.isEmpty) {
    print('لا توجد حيوانات مسجلة');
    return;
  }
  
  // احصل على animalId من القائمة
  final animalId = animals[0]['_id']; // ✅ animalId صحيح
  
  // تحقق من أن animalId ليس null أو فارغ
  if (animalId == null || animalId.isEmpty) {
    print('Animal ID غير صحيح');
    return;
  }
  
  // الآن يمكنك جلب التطعيمات
  final result = await CustomerService.getVaccinationsForAnimal(
    customerId: customerId,
    animalId: animalId, // ✅ تأكدنا أنه صحيح
  );
}
```

#### ❌ الطريقة الخاطئة:

```dart
// ❌ لا تفعل هذا
String? animalId; // قد يكون null

void loadVaccinations() {
  CustomerService.getVaccinationsForAnimal(
    customerId: customerId,
    animalId: animalId!, // ❌ قد يسبب crash أو URL خاطئ
  );
}
```

### الوقاية:
```dart
// إضافة validation في الـ function
static Future<Map<String, dynamic>> getVaccinationsForAnimal({
  required String customerId,
  required String animalId,
}) async {
  // ✅ تحقق من البيانات أولاً
  if (animalId.isEmpty) {
    return {
      'success': false,
      'message': 'Animal ID is required'
    };
  }
  
  // باقي الكود...
}
```

---

## ❌ خطأ 2: Customer not found

### الخطأ:
```json
{
  "success": false,
  "message": "Customer not found",
  "statusCode": 404
}
```

### السبب:
الـ `customerId` غير صحيح أو العميل غير موجود في قاعدة البيانات.

### الحل:

#### 1. تحقق من صحة الـ ID:
```dart
// ✅ تأكد من حفظ customerId بشكل صحيح بعد التسجيل
final loginResult = await AuthService.login(phone);

if (loginResult['success']) {
  final customerId = loginResult['data']['customer']['id'];
  
  // احفظه في SharedPreferences
  final prefs = await SharedPreferences.getInstance();
  await prefs.setString('customerId', customerId);
  
  print('Customer ID saved: $customerId'); // تأكد من الحفظ
}
```

#### 2. تحقق من استرجاع الـ ID:
```dart
// ✅ تأكد من استرجاع الـ ID بشكل صحيح
Future<String?> getCustomerId() async {
  final prefs = await SharedPreferences.getInstance();
  final customerId = prefs.getString('customerId');
  
  if (customerId == null || customerId.isEmpty) {
    print('⚠️ Customer ID not found in storage');
    // أعد المستخدم لصفحة تسجيل الدخول
    return null;
  }
  
  return customerId;
}
```

---

## ❌ خطأ 3: Invalid phone format

### الخطأ:
```json
{
  "success": false,
  "message": "Invalid phone number format. Use Saudi format: 05xxxxxxxx"
}
```

### السبب:
رقم الهاتف بصيغة غير صحيحة.

### الحل:

#### ✅ الصيغ المقبولة:
```dart
// جميع هذه الصيغ صحيحة:
'0512345678'     // ✅
'05 1234 5678'   // ✅ (المسافات تُحذف تلقائياً)
'+966512345678'  // ✅
'966512345678'   // ✅
'512345678'      // ✅ (يُضاف 0 تلقائياً)
```

#### Function للتحقق من الرقم:
```dart
String? validateSaudiPhone(String phone) {
  // إزالة المسافات
  phone = phone.replaceAll(' ', '');
  
  // التحقق من الصيغة
  final regex = RegExp(r'^(05|5|\+9665|9665)[0-9]{8}$');
  
  if (!regex.hasMatch(phone)) {
    return 'رقم الهاتف غير صحيح. استخدم الصيغة: 05xxxxxxxx';
  }
  
  return null; // الرقم صحيح
}

// استخدام:
final error = validateSaudiPhone(phoneController.text);
if (error != null) {
  // عرض رسالة خطأ
  showDialog(context: context, ...);
  return;
}
```

---

## ❌ خطأ 4: Duplicate phone number

### الخطأ:
```json
{
  "success": false,
  "message": "هذا الرقم مسجل مسبقاً. يرجى استخدام رقم آخر أو تسجيل الدخول."
}
```

### السبب:
محاولة التسجيل برقم هاتف موجود مسبقاً.

### الحل:

```dart
Future<void> handlePhoneSubmit(String phone) async {
  // محاولة تسجيل الدخول أولاً
  final loginResult = await AuthService.login(phone);
  
  if (loginResult['success']) {
    // الرقم موجود - تسجيل دخول ناجح
    navigateToHome(loginResult['data']['customer']);
    return;
  }
  
  // إذا فشل تسجيل الدخول، جرب التسجيل
  if (loginResult['needsRegistration']) {
    // اعرض نموذج التسجيل (الاسم + الرقم)
    showRegistrationDialog(phone);
  } else {
    // خطأ آخر
    showError(loginResult['message']);
  }
}
```

---

## ❌ خطأ 5: Connection timeout

### الخطأ:
```
DioError: Connection timeout
```

### الأسباب المحتملة:
1. السيرفر لا يعمل
2. عنوان IP خاطئ
3. المنفذ (Port) خاطئ
4. Firewall يمنع الاتصال

### الحل:

#### 1. تحقق من السيرفر:
```bash
# في terminal السيرفر
node src/server.js

# يجب أن ترى:
# ✅ MongoDB Connected: localhost
# 🚀 Server running on port 3000
```

#### 2. تحقق من عنوان IP:
```dart
// في Flutter
class ApiService {
  // ✅ استخدم IP الجهاز في نفس الشبكة
  static const String baseUrl = 'http://192.168.1.8:3000/api';
  
  // ❌ لا تستخدم localhost في الجوال
  // static const String baseUrl = 'http://localhost:3000/api';
}
```

#### 3. احصل على IP الصحيح:
```bash
# Windows
ipconfig

# Mac/Linux
ifconfig

# ابحث عن IPv4 Address
# مثال: 192.168.1.8
```

#### 4. تحقق من Firewall:
```bash
# Windows - اسمح بالمنفذ 3000
netsh advfirewall firewall add rule name="Node 3000" dir=in action=allow protocol=TCP localport=3000
```

---

## ❌ خطأ 6: Validation failed - Count is required

### الخطأ:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "count",
      "message": "Count is required"
    }
  ]
}
```

### السبب:
لم يتم إرسال حقل `count` عند إضافة حيوان جديد.

### الحل:

```dart
// ✅ الطريقة الصحيحة
final result = await CustomerService.addAnimal(
  customerId: customerId,
  name: 'صقر',
  type: 'camel',
  count: 5,        // ✅ مطلوب
  age: 3,
  weight: 450,
);

// ❌ الطريقة الخاطئة
final result = await CustomerService.addAnimal(
  customerId: customerId,
  name: 'صقر',
  type: 'camel',
  // ❌ count غير موجود
);
```

---

## ❌ خطأ 7: No vaccinations found

### الرسالة:
```
لا توجد تطعيمات متاحة لهذا الحيوان
```

### الأسباب المحتملة:
1. لا توجد تطعيمات في قاعدة البيانات
2. نوع الحيوان غير مدعوم
3. عمر الحيوان خارج النطاق المناسب

### الحل:

#### 1. أضف تطعيمات للقاعدة:
```bash
# في terminal السيرفر
node add-vaccinations.js
```

#### 2. تحقق من نوع الحيوان:
```dart
// الأنواع المدعومة:
'camel'   // إبل
'sheep'   // أغنام
'goat'    // ماعز
'cow'     // أبقار
'horse'   // خيول
'other'   // أخرى
```

#### 3. اعرض رسالة واضحة:
```dart
if (vaccinations.isEmpty) {
  showDialog(
    context: context,
    builder: (context) => AlertDialog(
      title: Text('لا توجد تطعيمات'),
      content: Text(
        'لا توجد تطعيمات مناسبة لهذا الحيوان في الوقت الحالي.\n\n'
        'قد يكون السبب:\n'
        '• عمر الحيوان غير مناسب\n'
        '• نوع الحيوان غير مدعوم\n'
        '• لا توجد تطعيمات متاحة حالياً'
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: Text('حسناً'),
        ),
      ],
    ),
  );
}
```

---

## 📋 Checklist للتشخيص السريع

عند حدوث خطأ، تحقق من:

### ✅ في Flutter:
- [ ] الـ `customerId` محفوظ بشكل صحيح
- [ ] الـ `animalId` ليس null أو فارغ
- [ ] عنوان الـ API صحيح (`baseUrl`)
- [ ] رقم الهاتف بصيغة صحيحة
- [ ] جميع الحقول المطلوبة موجودة

### ✅ في السيرفر:
- [ ] السيرفر يعمل (`node src/server.js`)
- [ ] MongoDB متصل
- [ ] لا توجد أخطاء في console
- [ ] المنفذ 3000 مفتوح

### ✅ في الشبكة:
- [ ] الجهازين على نفس الشبكة
- [ ] عنوان IP صحيح
- [ ] Firewall لا يمنع الاتصال
- [ ] لا يوجد Proxy أو VPN

---

## 🔍 أدوات المساعدة في التشخيص

### 1. Print Debugging:
```dart
print('🔍 Customer ID: $customerId');
print('🔍 Animal ID: $animalId');
print('🔍 API URL: ${ApiService.baseUrl}/customer-api/$customerId/animals/$animalId/vaccinations');
```

### 2. Dio Logging:
```dart
final dio = Dio();
dio.interceptors.add(LogInterceptor(
  request: true,
  requestBody: true,
  responseBody: true,
  error: true,
));
```

### 3. Error Handler:
```dart
void handleApiError(dynamic error) {
  if (error is DioException) {
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
        print('⏰ Connection timeout');
        break;
      case DioExceptionType.badResponse:
        print('❌ ${error.response?.statusCode}: ${error.response?.data}');
        break;
      default:
        print('❌ Unknown error: $error');
    }
  }
}
```

---

## 📞 الحصول على المساعدة

إذا استمرت المشكلة:
1. تحقق من console السيرفر
2. تحقق من console Flutter
3. اختبر الـ endpoint باستخدام Postman
4. راجع ملف `VACCINATION_ENDPOINT_TEST_RESULTS.md`

---

**تم إنشاء الملف بواسطة:** GitHub Copilot  
**التاريخ:** 24 أكتوبر 2025
