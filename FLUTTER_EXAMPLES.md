# Flutter Integration Examples
# أمثلة التكامل مع Flutter

## 📱 مثال كامل للتسجيل وتسجيل الدخول

### 1. إعداد الـ HTTP Client

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  static const String baseUrl = 'http://localhost:3000/api';
  
  // أو إذا كنت تختبر على جهاز حقيقي:
  // static const String baseUrl = 'http://YOUR_IP:3000/api';
  
  static Map<String, String> get headers => {
    'Content-Type': 'application/json',
  };
}
```

---

## 🔐 التسجيل مع معالجة الرقم المكرر

```dart
class AuthService {
  /// تسجيل عميل جديد
  /// يرجع: {success: bool, customerId: String?, message: String?}
  static Future<Map<String, dynamic>> register({
    required String name,
    required String phone,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('${ApiService.baseUrl}/customer-api/register'),
        headers: ApiService.headers,
        body: jsonEncode({
          'name': name,
          'phone': phone,
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 201 && data['success'] == true) {
        // ✅ تسجيل ناجح
        final customerId = data['data']['customer']['id'];
        
        // حفظ customerId
        await _saveCustomerId(customerId);
        
        return {
          'success': true,
          'customerId': customerId,
          'customer': data['data']['customer'],
        };
      } else if (response.statusCode == 400) {
        // ⚠️ خطأ في البيانات (رقم مكرر أو صيغة خاطئة)
        return {
          'success': false,
          'message': data['message'] ?? 'حدث خطأ في التسجيل',
          'isDuplicate': data['message']?.contains('مسجل مسبقاً') ?? false,
        };
      } else {
        return {
          'success': false,
          'message': data['message'] ?? 'حدث خطأ غير متوقع',
        };
      }
    } catch (e) {
      print('Register error: $e');
      return {
        'success': false,
        'message': 'خطأ في الاتصال بالسيرفر',
      };
    }
  }

  /// تسجيل الدخول
  static Future<Map<String, dynamic>> login({required String phone}) async {
    try {
      final response = await http.post(
        Uri.parse('${ApiService.baseUrl}/customer-api/login'),
        headers: ApiService.headers,
        body: jsonEncode({'phone': phone}),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200 && data['success'] == true) {
        // ✅ تسجيل دخول ناجح
        final customerId = data['data']['customer']['id'];
        
        // حفظ customerId
        await _saveCustomerId(customerId);
        
        return {
          'success': true,
          'customerId': customerId,
          'customer': data['data']['customer'],
        };
      } else if (response.statusCode == 404) {
        // ⚠️ العميل غير موجود
        return {
          'success': false,
          'message': 'الرقم غير مسجل. يرجى التسجيل أولاً',
          'needsRegistration': true,
        };
      } else {
        return {
          'success': false,
          'message': data['message'] ?? 'حدث خطأ في تسجيل الدخول',
        };
      }
    } catch (e) {
      print('Login error: $e');
      return {
        'success': false,
        'message': 'خطأ في الاتصال بالسيرفر',
      };
    }
  }

  /// حفظ customerId
  static Future<void> _saveCustomerId(String customerId) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('customerId', customerId);
  }

  /// الحصول على customerId المحفوظ
  static Future<String?> getCustomerId() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('customerId');
  }

  /// تسجيل الخروج
  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('customerId');
  }

  /// التحقق من تسجيل الدخول
  static Future<bool> isLoggedIn() async {
    final customerId = await getCustomerId();
    return customerId != null && customerId.isNotEmpty;
  }
}
```

---

## 🎨 واجهة المستخدم - صفحة التسجيل

```dart
class RegisterScreen extends StatefulWidget {
  @override
  _RegisterScreenState createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('تسجيل عميل جديد')),
      body: Padding(
        padding: EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              TextFormField(
                controller: _nameController,
                decoration: InputDecoration(
                  labelText: 'الاسم',
                  prefixIcon: Icon(Icons.person),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'الاسم مطلوب';
                  }
                  return null;
                },
              ),
              SizedBox(height: 16),
              TextFormField(
                controller: _phoneController,
                decoration: InputDecoration(
                  labelText: 'رقم الهاتف',
                  prefixIcon: Icon(Icons.phone),
                  hintText: '05xxxxxxxx',
                ),
                keyboardType: TextInputType.phone,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'رقم الهاتف مطلوب';
                  }
                  // التحقق من صيغة الرقم السعودي
                  if (!RegExp(r'^(05|5|\+9665|9665)[0-9]{8}$').hasMatch(value)) {
                    return 'صيغة الرقم غير صحيحة. استخدم: 05xxxxxxxx';
                  }
                  return null;
                },
              ),
              SizedBox(height: 24),
              ElevatedButton(
                onPressed: _isLoading ? null : _handleRegister,
                child: _isLoading
                    ? CircularProgressIndicator(color: Colors.white)
                    : Text('تسجيل'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _handleRegister() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    final result = await AuthService.register(
      name: _nameController.text.trim(),
      phone: _phoneController.text.trim(),
    );

    setState(() => _isLoading = false);

    if (result['success'] == true) {
      // ✅ تسجيل ناجح
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('تم التسجيل بنجاح!'),
          backgroundColor: Colors.green,
        ),
      );
      // الانتقال للصفحة الرئيسية
      Navigator.pushReplacementNamed(context, '/home');
    } else {
      // ⚠️ حدث خطأ
      if (result['isDuplicate'] == true) {
        // الرقم مسجل مسبقاً - عرض خيار تسجيل الدخول
        _showDuplicatePhoneDialog(result['message']);
      } else {
        // خطأ آخر
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result['message'] ?? 'حدث خطأ'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  void _showDuplicatePhoneDialog(String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('الرقم مسجل مسبقاً'),
        content: Text('هذا الرقم مسجل بالفعل. هل تريد تسجيل الدخول؟'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('إلغاء'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _handleLoginWithSamePhone();
            },
            child: Text('تسجيل الدخول'),
          ),
        ],
      ),
    );
  }

  void _handleLoginWithSamePhone() async {
    setState(() => _isLoading = true);

    final result = await AuthService.login(
      phone: _phoneController.text.trim(),
    );

    setState(() => _isLoading = false);

    if (result['success'] == true) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('تم تسجيل الدخول بنجاح!'),
          backgroundColor: Colors.green,
        ),
      );
      Navigator.pushReplacementNamed(context, '/home');
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(result['message'] ?? 'حدث خطأ'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    super.dispose();
  }
}
```

---

## 🔑 صفحة تسجيل الدخول البسيطة

```dart
class LoginScreen extends StatefulWidget {
  @override
  _LoginScreenState createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _phoneController = TextEditingController();
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('تسجيل الدخول')),
      body: Padding(
        padding: EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            TextField(
              controller: _phoneController,
              decoration: InputDecoration(
                labelText: 'رقم الهاتف',
                prefixIcon: Icon(Icons.phone),
                hintText: '05xxxxxxxx',
              ),
              keyboardType: TextInputType.phone,
            ),
            SizedBox(height: 24),
            ElevatedButton(
              onPressed: _isLoading ? null : _handleLogin,
              child: _isLoading
                  ? CircularProgressIndicator(color: Colors.white)
                  : Text('تسجيل الدخول'),
            ),
            SizedBox(height: 16),
            TextButton(
              onPressed: () {
                Navigator.pushNamed(context, '/register');
              },
              child: Text('ليس لديك حساب؟ سجل الآن'),
            ),
          ],
        ),
      ),
    );
  }

  void _handleLogin() async {
    if (_phoneController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('الرجاء إدخال رقم الهاتف')),
      );
      return;
    }

    setState(() => _isLoading = true);

    final result = await AuthService.login(
      phone: _phoneController.text.trim(),
    );

    setState(() => _isLoading = false);

    if (result['success'] == true) {
      Navigator.pushReplacementNamed(context, '/home');
    } else if (result['needsRegistration'] == true) {
      _showNeedsRegistrationDialog();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(result['message'] ?? 'حدث خطأ'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _showNeedsRegistrationDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('حساب غير موجود'),
        content: Text('هذا الرقم غير مسجل. هل تريد إنشاء حساب جديد؟'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('إلغاء'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              Navigator.pushNamed(context, '/register');
            },
            child: Text('تسجيل حساب جديد'),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _phoneController.dispose();
    super.dispose();
  }
}
```

---

## 🚀 استخدام الـ APIs الأخرى

```dart
class CustomerService {
  /// إضافة حيوان جديد
  static Future<Map<String, dynamic>> addAnimal({
    required String customerId,
    required String name,
    required String type,
    required int count,
    int? age,
    double? weight,
    String? breed,
    String? notes,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('${ApiService.baseUrl}/customer-api/$customerId/animals'),
        headers: ApiService.headers,
        body: jsonEncode({
          'name': name,
          'type': type,
          'count': count,
          'age': age,
          'weight': weight,
          'breed': breed,
          'notes': notes,
        }),
      );

      final data = jsonDecode(response.body);
      return {
        'success': response.statusCode == 201 && data['success'],
        'data': data['data'],
        'message': data['message'],
      };
    } catch (e) {
      return {'success': false, 'message': 'خطأ في الاتصال'};
    }
  }

  /// الحصول على حيوانات العميل
  static Future<List<dynamic>> getAnimals(String customerId) async {
    try {
      final response = await http.get(
        Uri.parse('${ApiService.baseUrl}/customer-api/$customerId/animals'),
        headers: ApiService.headers,
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['data']['animals'] ?? [];
      }
      return [];
    } catch (e) {
      print('Get animals error: $e');
      return [];
    }
  }

  /// الحصول على التطعيمات المناسبة لحيوان معين
  static Future<Map<String, dynamic>> getVaccinationsForAnimal({
    required String customerId,
    required String animalId,
  }) async {
    // ⚠️ تحقق من أن animalId ليس فارغاً
    if (animalId.isEmpty) {
      return {
        'success': false,
        'vaccinations': [],
        'message': 'Animal ID is required'
      };
    }

    try {
      final response = await http.get(
        Uri.parse('${ApiService.baseUrl}/customer-api/$customerId/animals/$animalId/vaccinations'),
        headers: ApiService.headers,
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return {
          'success': true,
          'animal': data['data']['animal'],
          'vaccinations': data['data']['vaccinations'] ?? [],
          'customer': data['data']['customer'],
        };
      } else if (response.statusCode == 404) {
        return {
          'success': false,
          'vaccinations': [],
          'message': 'الحيوان غير موجود'
        };
      }
      return {'success': false, 'vaccinations': []};
    } catch (e) {
      print('Get vaccinations error: $e');
      return {'success': false, 'vaccinations': [], 'message': 'خطأ في الاتصال'};
    }
  }

  /// حجز موعد تطعيم
  static Future<Map<String, dynamic>> bookAppointment({
    required String customerId,
    required String animalId,
    required String vaccinationId,
    required String branchId,
    required String appointmentDate,
    required String timeSlot,
    String? notes,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('${ApiService.baseUrl}/customer-api/$customerId/bookings'),
        headers: ApiService.headers,
        body: jsonEncode({
          'animalId': animalId,
          'vaccinationId': vaccinationId,
          'branchId': branchId,
          'appointmentDate': appointmentDate,
          'timeSlot': timeSlot,
          'notes': notes,
        }),
      );

      final data = jsonDecode(response.body);
      return {
        'success': response.statusCode == 201 && data['success'],
        'data': data['data'],
        'message': data['message'],
      };
    } catch (e) {
      return {'success': false, 'message': 'خطأ في الاتصال'};
    }
  }
}
```

---

## � مثال: الطريقة الصحيحة لجلب التطعيمات

### ❌ خطأ شائع: animalId فارغ

```dart
// ❌ خطأ: لا تفعل هذا
class MyScreen extends StatefulWidget {
  final String customerId;
  
  @override
  _MyScreenState createState() => _MyScreenState();
}

class _MyScreenState extends State<MyScreen> {
  String? selectedAnimalId; // قد يكون null!
  
  void loadVaccinations() {
    // ❌ خطأ: selectedAnimalId قد يكون null
    CustomerService.getVaccinationsForAnimal(
      customerId: widget.customerId,
      animalId: selectedAnimalId!, // Crash إذا كان null
    );
  }
}
```

### ✅ الطريقة الصحيحة: التحقق من البيانات

```dart
// ✅ صحيح: تحقق من البيانات أولاً
class VaccinationFlowScreen extends StatefulWidget {
  final String customerId;

  const VaccinationFlowScreen({Key? key, required this.customerId}) : super(key: key);

  @override
  _VaccinationFlowScreenState createState() => _VaccinationFlowScreenState();
}

class _VaccinationFlowScreenState extends State<VaccinationFlowScreen> {
  List<dynamic> animals = [];
  String? selectedAnimalId;
  List<dynamic> vaccinations = [];
  bool isLoadingAnimals = false;
  bool isLoadingVaccinations = false;

  @override
  void initState() {
    super.initState();
    _loadAnimals();
  }

  // 1. جلب قائمة الحيوانات أولاً
  Future<void> _loadAnimals() async {
    setState(() => isLoadingAnimals = true);
    
    final result = await CustomerService.getAnimals(widget.customerId);
    
    setState(() {
      animals = result;
      isLoadingAnimals = false;
      
      // اختر أول حيوان تلقائياً إذا كانت القائمة غير فارغة
      if (animals.isNotEmpty) {
        selectedAnimalId = animals[0]['_id'];
        _loadVaccinations(); // ✅ الآن animalId موجود
      }
    });
  }

  // 2. جلب التطعيمات بعد التأكد من وجود animalId
  Future<void> _loadVaccinations() async {
    // ✅ تحقق من أن animalId ليس null أو فارغ
    if (selectedAnimalId == null || selectedAnimalId!.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('الرجاء اختيار حيوان أولاً')),
      );
      return;
    }

    setState(() => isLoadingVaccinations = true);

    final result = await CustomerService.getVaccinationsForAnimal(
      customerId: widget.customerId,
      animalId: selectedAnimalId!, // ✅ متأكدين أنه ليس null
    );

    setState(() {
      isLoadingVaccinations = false;
      if (result['success']) {
        vaccinations = result['vaccinations'];
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(result['message'] ?? 'فشل في تحميل التطعيمات')),
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('اختيار التطعيم')),
      body: Column(
        children: [
          // قائمة الحيوانات
          if (isLoadingAnimals)
            CircularProgressIndicator()
          else if (animals.isEmpty)
            Padding(
              padding: EdgeInsets.all(16),
              child: Text('لا توجد حيوانات مسجلة'),
            )
          else
            Container(
              padding: EdgeInsets.all(16),
              child: DropdownButton<String>(
                value: selectedAnimalId,
                hint: Text('اختر حيواناً'),
                isExpanded: true,
                items: animals.map((animal) {
                  return DropdownMenuItem<String>(
                    value: animal['_id'],
                    child: Text('${animal['name']} (${animal['type']})'),
                  );
                }).toList(),
                onChanged: (String? newValue) {
                  if (newValue != null && newValue.isNotEmpty) {
                    setState(() {
                      selectedAnimalId = newValue;
                    });
                    _loadVaccinations(); // ✅ جلب التطعيمات عند تغيير الحيوان
                  }
                },
              ),
            ),
          
          Divider(),
          
          // قائمة التطعيمات
          Expanded(
            child: isLoadingVaccinations
                ? Center(child: CircularProgressIndicator())
                : selectedAnimalId == null
                    ? Center(child: Text('اختر حيواناً لعرض التطعيمات المناسبة'))
                    : vaccinations.isEmpty
                        ? Center(child: Text('لا توجد تطعيمات متاحة لهذا الحيوان'))
                        : ListView.builder(
                            padding: EdgeInsets.all(16),
                            itemCount: vaccinations.length,
                            itemBuilder: (context, index) {
                              final vaccination = vaccinations[index];
                              return Card(
                                child: ListTile(
                                  title: Text(vaccination['nameAr'] ?? vaccination['name']),
                                  subtitle: Text('${vaccination['price']} ريال'),
                                  trailing: ElevatedButton(
                                    onPressed: () {
                                      // الانتقال لصفحة الحجز
                                      Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                          builder: (context) => BookingScreen(
                                            customerId: widget.customerId,
                                            animalId: selectedAnimalId!,
                                            vaccinationId: vaccination['_id'],
                                          ),
                                        ),
                                      );
                                    },
                                    child: Text('احجز'),
                                  ),
                                ),
                              );
                            },
                          ),
          ),
        ],
      ),
    );
  }
}
```

### 🎯 النقاط المهمة:

1. **✅ جلب الحيوانات أولاً**
   ```dart
   final animals = await CustomerService.getAnimals(customerId);
   ```

2. **✅ التحقق من القائمة ليست فارغة**
   ```dart
   if (animals.isNotEmpty) {
     selectedAnimalId = animals[0]['_id'];
   }
   ```

3. **✅ التحقق قبل جلب التطعيمات**
   ```dart
   if (selectedAnimalId == null || selectedAnimalId!.isEmpty) {
     return; // لا ترسل الطلب
   }
   ```

4. **✅ عرض رسالة خطأ واضحة**
   ```dart
   if (!result['success']) {
     showErrorMessage(result['message']);
   }
   ```

---

## �📱 مثال استخدام: صفحة اختيار التطعيمات

```dart
class VaccinationSelectionScreen extends StatefulWidget {
  final String customerId;
  final String animalId;
  final String animalName;

  const VaccinationSelectionScreen({
    Key? key,
    required this.customerId,
    required this.animalId,
    required this.animalName,
  }) : super(key: key);

  @override
  _VaccinationSelectionScreenState createState() => _VaccinationSelectionScreenState();
}

class _VaccinationSelectionScreenState extends State<VaccinationSelectionScreen> {
  List<dynamic> vaccinations = [];
  bool isLoading = true;
  String? error;

  @override
  void initState() {
    super.initState();
    _loadVaccinations();
  }

  Future<void> _loadVaccinations() async {
    setState(() {
      isLoading = true;
      error = null;
    });

    final result = await CustomerService.getVaccinationsForAnimal(
      customerId: widget.customerId,
      animalId: widget.animalId,
    );

    if (mounted) {
      setState(() {
        isLoading = false;
        if (result['success']) {
          vaccinations = result['vaccinations'];
        } else {
          error = result['message'] ?? 'فشل في تحميل التطعيمات';
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('التطعيمات المناسبة لـ ${widget.animalName}'),
      ),
      body: isLoading
          ? Center(child: CircularProgressIndicator())
          : error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.error_outline, size: 64, color: Colors.red),
                      SizedBox(height: 16),
                      Text(error!, style: TextStyle(color: Colors.red)),
                      SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: _loadVaccinations,
                        child: Text('إعادة المحاولة'),
                      ),
                    ],
                  ),
                )
              : vaccinations.isEmpty
                  ? Center(
                      child: Text('لا توجد تطعيمات متاحة لهذا الحيوان'),
                    )
                  : ListView.builder(
                      padding: EdgeInsets.all(16),
                      itemCount: vaccinations.length,
                      itemBuilder: (context, index) {
                        final vaccination = vaccinations[index];
                        return VaccinationCard(
                          vaccination: vaccination,
                          onSelect: () => _onVaccinationSelected(vaccination),
                        );
                      },
                    ),
    );
  }

  void _onVaccinationSelected(dynamic vaccination) {
    // الانتقال إلى صفحة الحجز
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => BookingScreen(
          customerId: widget.customerId,
          animalId: widget.animalId,
          animalName: widget.animalName,
          vaccination: vaccination,
        ),
      ),
    );
  }
}

// Widget لعرض بطاقة التطعيم
class VaccinationCard extends StatelessWidget {
  final dynamic vaccination;
  final VoidCallback onSelect;

  const VaccinationCard({
    Key? key,
    required this.vaccination,
    required this.onSelect,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.only(bottom: 16),
      elevation: 2,
      child: InkWell(
        onTap: onSelect,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          vaccination['nameAr'] ?? vaccination['name'],
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        if (vaccination['name'] != vaccination['nameAr'])
                          Text(
                            vaccination['name'],
                            style: TextStyle(
                              fontSize: 14,
                              color: Colors.grey[600],
                            ),
                          ),
                      ],
                    ),
                  ),
                  Container(
                    padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.green,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      '${vaccination['price']} ريال',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
              
              if (vaccination['descriptionAr'] != null)
                Padding(
                  padding: EdgeInsets.only(top: 8),
                  child: Text(
                    vaccination['descriptionAr'],
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey[700],
                    ),
                  ),
                ),
              
              if (vaccination['frequency'] != null)
                Padding(
                  padding: EdgeInsets.only(top: 8),
                  child: Row(
                    children: [
                      Icon(Icons.schedule, size: 16, color: Colors.blue),
                      SizedBox(width: 4),
                      Text(
                        _getFrequencyText(vaccination['frequency']),
                        style: TextStyle(fontSize: 13, color: Colors.blue),
                      ),
                    ],
                  ),
                ),
              
              if (vaccination['ageRange'] != null)
                Padding(
                  padding: EdgeInsets.only(top: 4),
                  child: Row(
                    children: [
                      Icon(Icons.info_outline, size: 16, color: Colors.orange),
                      SizedBox(width: 4),
                      Text(
                        'مناسب للعمر: ${vaccination['ageRange']['min']} - ${vaccination['ageRange']['max']} سنة',
                        style: TextStyle(fontSize: 13, color: Colors.orange),
                      ),
                    ],
                  ),
                ),
              
              SizedBox(height: 12),
              ElevatedButton(
                onPressed: onSelect,
                style: ElevatedButton.styleFrom(
                  minimumSize: Size(double.infinity, 40),
                ),
                child: Text('احجز الآن'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _getFrequencyText(String frequency) {
    switch (frequency) {
      case 'annually':
        return 'سنوياً';
      case 'biannually':
        return 'كل 6 أشهر';
      case 'monthly':
        return 'شهرياً';
      case 'once':
        return 'مرة واحدة';
      default:
        return frequency;
    }
  }
}
```

---

## ✅ الخلاصة

### النقاط المهمة:
1. **رقم الهاتف فريد**: لا يمكن التسجيل بنفس الرقم مرتين
2. **معالجة الأخطاء**: دائماً تحقق من `result['isDuplicate']` و `result['needsRegistration']`
3. **حفظ الـ ID**: احفظ `customerId` في SharedPreferences
4. **لا يوجد Token**: جميع الطلبات بدون authentication headers

### تدفق العمل:
```
1. المستخدم يدخل رقم الهاتف
2. إذا كان الرقم جديد → التسجيل
3. إذا كان الرقم موجود → تسجيل الدخول
4. حفظ customerId
5. استخدام customerId في جميع الطلبات
```
