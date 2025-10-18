# دليل تسجيل العملاء الجدد

## المسار الجديد لتسجيل العملاء

**URL:** `POST /api/auth/register-customer`

### البيانات المطلوبة

```json
{
  "name": "أحمد محمد",
  "phone": "0501234567",
  "animalType": "إبل",  // اختياري
  "notes": "ملاحظات إضافية"  // اختياري
}
```

### البيانات الإجبارية
- `name` (الاسم): نص من 2-100 حرف
- `phone` (رقم الهاتف): رقم سعودي صحيح

### البيانات الاختيارية
- `animalType` (نوع الحيوان): أحد القيم التالية:
  - "إبل"
  - "ماشية" 
  - "أغنام"
  - "ماعز"
  - "خيول"
  - "أخرى"
- `notes` (ملاحظات): نص حتى 500 حرف

### مثال على الطلب

```bash
curl -X POST http://localhost:3000/api/auth/register-customer \
  -H "Content-Type: application/json" \
  -d '{
    "name": "محمد العتيبي",
    "phone": "0501234567",
    "animalType": "إبل",
    "notes": "عميل جديد من الرياض"
  }'
```

### الاستجابة الناجحة

```json
{
  "success": true,
  "message": "Customer registered successfully",
  "data": {
    "customer": {
      "id": "507f1f77bcf86cd799439011",
      "name": "محمد العتيبي",
      "phone": "0501234567",
      "animalType": "إبل",
      "notes": "عميل جديد من الرياض",
      "createdAt": "2025-10-04T10:30:00.000Z"
    }
  }
}
```

### أمثلة على الأخطاء

#### اسم مفقود
```json
{
  "success": false,
  "message": "Validation Error",
  "errors": [
    {
      "field": "name",
      "message": "Customer name is required"
    }
  ]
}
```

#### رقم هاتف غير صحيح
```json
{
  "success": false,
  "message": "Validation Error",
  "errors": [
    {
      "field": "phone",
      "message": "Please enter a valid Saudi phone number"
    }
  ]
}
```

#### رقم موجود مسبقاً
```json
{
  "success": false,
  "message": "Customer with this phone number already exists"
}
```

## الفرق بين المسارين

### `/api/auth/register` (للمستخدمين)
- مخصص لتسجيل مستخدمي النظام (مدراء، أطباء، موظفين)
- يتطلب: اسم، بريد إلكتروني، كلمة مرور، صلاحية
- ينشئ حساب مستخدم يمكنه تسجيل الدخول للنظام

### `/api/auth/register-customer` (للعملاء)
- مخصص لتسجيل العملاء
- يتطلب: اسم، رقم هاتف فقط
- ينشئ سجل عميل في النظام لحجز المواعيد

## استخدام المسار في JavaScript

```javascript
async function registerCustomer(customerData) {
  try {
    const response = await fetch('/api/auth/register-customer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(customerData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('عميل مسجل بنجاح:', result.data.customer);
      return result.data.customer;
    } else {
      console.error('خطأ في التسجيل:', result.message);
      return null;
    }
  } catch (error) {
    console.error('خطأ في الاتصال:', error);
    return null;
  }
}

// مثال على الاستخدام
const newCustomer = await registerCustomer({
  name: "سارة أحمد",
  phone: "0507777777",
  animalType: "أغنام",
  notes: "تحتاج موعد تطعيم عاجل"
});
```

## تحديث النموذج في الواجهة

إذا كنت تستخدم النموذج في الواجهة، يمكنك تحديث الدالة كالتالي:

```javascript
// في ملف app.js
async function submitCustomerForm(event) {
    event.preventDefault();
    const form = event.target;
    
    const formData = new FormData(form);
    const customerData = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        animalType: formData.get('animalType'),
        notes: formData.get('notes')
    };

    try {
        const response = await fetch('/api/auth/register-customer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(customerData)
        });

        const result = await response.json();

        if (result.success) {
            app.showAlert('تم تسجيل العميل بنجاح', 'success');
            form.closest('.modal-backdrop').remove();
            if (app.currentPage === 'customers') {
                app.loadCustomers();
            }
        } else {
            app.showAlert(result.message || 'خطأ في تسجيل العميل', 'danger');
        }
    } catch (error) {
        console.error('Error registering customer:', error);
        app.showAlert('خطأ في الاتصال بالخادم', 'danger');
    }
}
```