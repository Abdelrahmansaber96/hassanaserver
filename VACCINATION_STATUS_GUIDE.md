# دليل حالة التطعيمات (Active/Inactive Status)

## 📋 نظرة عامة

تم تعديل النظام ليدعم حالتين للتطعيمات:
- **نشط (Active)**: `isActive: true` - تطعيم متاح للحجز
- **غير نشط (Inactive)**: `isActive: false` - تطعيم متوقف مؤقتاً أو غير متاح

## ✨ التغييرات المنفذة

### 1. Backend API Changes

#### أ) Customer API Endpoint
**Endpoint:** `GET /api/customer-api/:customerId/animals/:animalId/vaccinations`

**قبل التعديل:**
- كان يعرض فقط التطعيمات النشطة (`isActive: true`)
- التطعيمات غير النشطة تختفي تماماً

**بعد التعديل:**
- يعرض **جميع** التطعيمات (نشطة وغير نشطة)
- كل تطعيم يحتوي على حقل `isActive` في الـ Response
- يمكن للتطبيق عرض التطعيمات غير النشطة بطريقة مختلفة

**Response Example:**
```json
{
  "success": true,
  "data": {
    "animal": {
      "id": "...",
      "name": "صقر",
      "type": "camel",
      "age": 3
    },
    "vaccinations": [
      {
        "_id": "...",
        "name": "Rift Valley Fever",
        "nameAr": "حمى الوادي المتصدع",
        "price": 150,
        "isActive": true  // ✅ نشط
      },
      {
        "_id": "...",
        "name": "Camel Pox",
        "nameAr": "جدري الإبل",
        "price": 180,
        "isActive": false  // ❌ غير نشط
      }
    ]
  }
}
```

---

#### ب) Admin Vaccination Endpoints

**Endpoint:** `GET /api/vaccinations`

**قبل التعديل:**
- كان يعرض فقط التطعيمات النشطة

**بعد التعديل:**
- يعرض جميع التطعيمات (نشطة وغير نشطة)
- يمكن الفلترة باستخدام query parameter:
  - `?isActive=true` - فقط النشطة
  - `?isActive=false` - فقط غير النشطة
  - بدون parameter - الكل

**أمثلة:**
```
GET /api/vaccinations                  // جميع التطعيمات
GET /api/vaccinations?isActive=true    // النشطة فقط
GET /api/vaccinations?isActive=false   // غير النشطة فقط
```

---

### 2. Statistics Update

**Endpoint:** `GET /api/vaccinations/stats`

**تم إضافة حقول جديدة:**
```json
{
  "success": true,
  "data": {
    "totalVaccinations": 10,
    "activeVaccinations": 7,      // ✅ جديد
    "inactiveVaccinations": 3,    // ✅ جديد
    "averagePrice": 175.50,
    "minPrice": 100,
    "maxPrice": 300
  }
}
```

---

## 📱 استخدام في Flutter App

### 1. عرض التطعيمات مع حالتها

```dart
class VaccinationListItem extends StatelessWidget {
  final Map<String, dynamic> vaccination;
  
  @override
  Widget build(BuildContext context) {
    final bool isActive = vaccination['isActive'] ?? true;
    
    return Card(
      // تغيير اللون حسب الحالة
      color: isActive ? Colors.white : Colors.grey[200],
      child: ListTile(
        title: Text(
          vaccination['nameAr'] ?? vaccination['name'],
          style: TextStyle(
            // خط باهت للتطعيمات غير النشطة
            color: isActive ? Colors.black : Colors.grey,
            decoration: isActive ? null : TextDecoration.lineThrough,
          ),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('السعر: ${vaccination['price']} ريال'),
            SizedBox(height: 4),
            // عرض حالة التطعيم
            Container(
              padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: isActive ? Colors.green[100] : Colors.red[100],
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                isActive ? '✅ متاح' : '❌ غير متاح',
                style: TextStyle(
                  fontSize: 12,
                  color: isActive ? Colors.green[800] : Colors.red[800],
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
        trailing: Icon(
          isActive ? Icons.check_circle : Icons.cancel,
          color: isActive ? Colors.green : Colors.red,
        ),
        // تعطيل الحجز للتطعيمات غير النشطة
        onTap: isActive ? () => _bookVaccination(vaccination) : null,
      ),
    );
  }
  
  void _bookVaccination(Map<String, dynamic> vaccination) {
    // منع الحجز إذا كان التطعيم غير نشط
    if (vaccination['isActive'] != true) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('هذا التطعيم غير متاح حالياً'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }
    
    // متابعة الحجز...
  }
}
```

---

### 2. فلترة التطعيمات

```dart
class VaccinationService {
  /// جلب جميع التطعيمات
  static Future<List<dynamic>> getAllVaccinations({
    required String customerId,
    required String animalId,
  }) async {
    final response = await http.get(
      Uri.parse('$baseUrl/customer-api/$customerId/animals/$animalId/vaccinations'),
    );
    
    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return data['data']['vaccinations'] ?? [];
    }
    throw Exception('Failed to load vaccinations');
  }
  
  /// جلب التطعيمات النشطة فقط
  static Future<List<dynamic>> getActiveVaccinations({
    required String customerId,
    required String animalId,
  }) async {
    final allVaccinations = await getAllVaccinations(
      customerId: customerId,
      animalId: animalId,
    );
    
    // فلترة النشطة فقط
    return allVaccinations.where((v) => v['isActive'] == true).toList();
  }
  
  /// جلب التطعيمات غير النشطة
  static Future<List<dynamic>> getInactiveVaccinations({
    required String customerId,
    required String animalId,
  }) async {
    final allVaccinations = await getAllVaccinations(
      customerId: customerId,
      animalId: animalId,
    );
    
    // فلترة غير النشطة فقط
    return allVaccinations.where((v) => v['isActive'] == false).toList();
  }
}
```

---

### 3. UI مع Tabs للتطعيمات النشطة وغير النشطة

```dart
class VaccinationsPage extends StatefulWidget {
  final String customerId;
  final String animalId;
  
  @override
  _VaccinationsPageState createState() => _VaccinationsPageState();
}

class _VaccinationsPageState extends State<VaccinationsPage> 
    with SingleTickerProviderStateMixin {
  
  TabController? _tabController;
  List<dynamic> _allVaccinations = [];
  List<dynamic> _activeVaccinations = [];
  List<dynamic> _inactiveVaccinations = [];
  bool _isLoading = true;
  
  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadVaccinations();
  }
  
  Future<void> _loadVaccinations() async {
    setState(() => _isLoading = true);
    
    try {
      final vaccinations = await VaccinationService.getAllVaccinations(
        customerId: widget.customerId,
        animalId: widget.animalId,
      );
      
      setState(() {
        _allVaccinations = vaccinations;
        _activeVaccinations = vaccinations
            .where((v) => v['isActive'] == true)
            .toList();
        _inactiveVaccinations = vaccinations
            .where((v) => v['isActive'] == false)
            .toList();
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('فشل تحميل التطعيمات: $e')),
      );
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('التطعيمات المتاحة'),
        bottom: TabBar(
          controller: _tabController,
          tabs: [
            Tab(
              icon: Icon(Icons.list),
              text: 'الكل (${_allVaccinations.length})',
            ),
            Tab(
              icon: Icon(Icons.check_circle),
              text: 'المتاحة (${_activeVaccinations.length})',
            ),
            Tab(
              icon: Icon(Icons.cancel),
              text: 'غير متاحة (${_inactiveVaccinations.length})',
            ),
          ],
        ),
      ),
      body: _isLoading
          ? Center(child: CircularProgressIndicator())
          : TabBarView(
              controller: _tabController,
              children: [
                _buildVaccinationList(_allVaccinations),
                _buildVaccinationList(_activeVaccinations),
                _buildVaccinationList(_inactiveVaccinations),
              ],
            ),
    );
  }
  
  Widget _buildVaccinationList(List<dynamic> vaccinations) {
    if (vaccinations.isEmpty) {
      return Center(
        child: Text('لا توجد تطعيمات'),
      );
    }
    
    return ListView.builder(
      itemCount: vaccinations.length,
      itemBuilder: (context, index) {
        return VaccinationListItem(
          vaccination: vaccinations[index],
        );
      },
    );
  }
  
  @override
  void dispose() {
    _tabController?.dispose();
    super.dispose();
  }
}
```

---

## 🎨 UI Design Suggestions

### 1. عرض بسيط مع Badge

```dart
ListTile(
  title: Text(vaccination['nameAr']),
  subtitle: Text('${vaccination['price']} ريال'),
  trailing: Row(
    mainAxisSize: MainAxisSize.min,
    children: [
      if (vaccination['isActive'] == true)
        Icon(Icons.check_circle, color: Colors.green)
      else
        Icon(Icons.cancel, color: Colors.red),
      SizedBox(width: 8),
      Icon(Icons.chevron_right),
    ],
  ),
)
```

---

### 2. عرض مع بطاقة ملونة

```dart
Card(
  elevation: 2,
  color: vaccination['isActive'] ? Colors.white : Colors.grey[100],
  child: Stack(
    children: [
      Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              vaccination['nameAr'],
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 8),
            Text('السعر: ${vaccination['price']} ريال'),
          ],
        ),
      ),
      // Badge في الزاوية
      Positioned(
        top: 8,
        right: 8,
        child: Container(
          padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: vaccination['isActive'] ? Colors.green : Colors.red,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Text(
            vaccination['isActive'] ? 'متاح' : 'غير متاح',
            style: TextStyle(
              color: Colors.white,
              fontSize: 10,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ),
    ],
  ),
)
```

---

### 3. عرض مع Opacity

```dart
Opacity(
  opacity: vaccination['isActive'] ? 1.0 : 0.5,
  child: Card(
    child: ListTile(
      title: Text(vaccination['nameAr']),
      subtitle: Text('${vaccination['price']} ريال'),
      trailing: vaccination['isActive']
          ? ElevatedButton(
              child: Text('احجز الآن'),
              onPressed: () => _bookVaccination(vaccination),
            )
          : Text(
              'غير متاح',
              style: TextStyle(color: Colors.red),
            ),
    ),
  ),
)
```

---

## 🔒 منع الحجز للتطعيمات غير النشطة

### في Booking API:

```dart
Future<bool> bookVaccination(Map<String, dynamic> vaccination) async {
  // التحقق من حالة التطعيم قبل الحجز
  if (vaccination['isActive'] != true) {
    throw Exception('هذا التطعيم غير متاح حالياً');
  }
  
  // متابعة الحجز
  final response = await http.post(
    Uri.parse('$baseUrl/customer-api/$customerId/bookings'),
    body: json.encode({
      'vaccinationId': vaccination['_id'],
      // ... باقي البيانات
    }),
  );
  
  return response.statusCode == 201;
}
```

---

## 📊 لوحة التحكم (Admin Dashboard)

### عرض التطعيمات مع حالتها:

```javascript
// في جدول التطعيمات
<table>
  <thead>
    <tr>
      <th>الاسم</th>
      <th>السعر</th>
      <th>الحالة</th>
      <th>الإجراءات</th>
    </tr>
  </thead>
  <tbody>
    {vaccinations.map(vaccination => (
      <tr key={vaccination._id}>
        <td>{vaccination.nameAr}</td>
        <td>{vaccination.price} ريال</td>
        <td>
          <span className={`badge ${vaccination.isActive ? 'badge-success' : 'badge-danger'}`}>
            {vaccination.isActive ? '✅ نشط' : '❌ غير نشط'}
          </span>
        </td>
        <td>
          <button onClick={() => toggleStatus(vaccination._id)}>
            {vaccination.isActive ? 'إيقاف' : 'تفعيل'}
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

### Toggle Status Function:

```javascript
async function toggleStatus(vaccinationId) {
  try {
    const vaccination = vaccinations.find(v => v._id === vaccinationId);
    const response = await fetch(`/api/vaccinations/${vaccinationId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        isActive: !vaccination.isActive
      })
    });
    
    if (response.ok) {
      // تحديث القائمة
      loadVaccinations();
      showNotification('تم تحديث الحالة بنجاح');
    }
  } catch (error) {
    console.error('Error toggling status:', error);
  }
}
```

---

## 🧪 اختبار التعديلات

### 1. اختبار API:

```javascript
// test-vaccination-status.js
const mongoose = require('mongoose');
const Vaccination = require('./src/models/Vaccination');

async function testVaccinationStatus() {
  await mongoose.connect('mongodb://localhost:27017/clinic-dashboard');
  
  // 1. جلب جميع التطعيمات
  const allVaccinations = await Vaccination.find({});
  console.log('Total vaccinations:', allVaccinations.length);
  
  // 2. عد النشطة وغير النشطة
  const activeCount = allVaccinations.filter(v => v.isActive).length;
  const inactiveCount = allVaccinations.filter(v => !v.isActive).length;
  console.log('Active:', activeCount);
  console.log('Inactive:', inactiveCount);
  
  // 3. تغيير حالة تطعيم
  const firstVaccination = allVaccinations[0];
  firstVaccination.isActive = !firstVaccination.isActive;
  await firstVaccination.save();
  console.log(`Changed ${firstVaccination.nameAr} to ${firstVaccination.isActive ? 'active' : 'inactive'}`);
  
  await mongoose.disconnect();
}

testVaccinationStatus();
```

---

## ✅ ملخص الفوائد

1. **مرونة أكبر**: يمكن إيقاف تطعيم مؤقتاً بدون حذفه
2. **شفافية أفضل**: العميل يرى جميع التطعيمات مع حالتها
3. **تجربة مستخدم أفضل**: معرفة ما هو متاح وما هو غير متاح
4. **تحليل أفضل**: إحصائيات تشمل النشط وغير النشط
5. **إدارة أسهل**: تفعيل/إيقاف بدلاً من حذف/إضافة

---

**تم إنشاء الملف بواسطة: GitHub Copilot**  
**التاريخ: 24 أكتوبر 2025**
