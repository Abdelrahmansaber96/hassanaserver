require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const testLogin = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/animal_vaccination_db';
    console.log('🔌 Connecting to:', MONGODB_URI);
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const User = require('./src/models/User');
    
    // البحث عن المستخدم
    const user = await User.findOne({ email: 'admin@clinic.com' }).select('+password');
    
    if (!user) {
      console.log('❌ المستخدم غير موجود!');
      
      // إنشاء مستخدم جديد
      console.log('\n📝 إنشاء مستخدم admin جديد...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const newUser = await User.create({
        name: 'Admin',
        email: 'admin@clinic.com',
        password: hashedPassword,
        role: 'admin',
        isActive: true
      });
      console.log('✅ تم إنشاء المستخدم بنجاح!');
      console.log('📧 Email: admin@clinic.com');
      console.log('🔑 Password: admin123');
    } else {
      console.log('✅ المستخدم موجود!');
      console.log('📧 Email:', user.email);
      console.log('👤 Name:', user.name);
      console.log('🎭 Role:', user.role);
      console.log('🟢 Active:', user.isActive);
      console.log('🔒 Password Hash:', user.password.substring(0, 20) + '...');
      
      // اختبار كلمة المرور
      console.log('\n🔐 اختبار كلمة المرور...');
      const isMatch = await bcrypt.compare('admin123', user.password);
      console.log('✔️ النتيجة:', isMatch ? '✅ كلمة المرور صحيحة' : '❌ كلمة المرور خاطئة');
      
      if (!isMatch) {
        console.log('\n🔧 إصلاح كلمة المرور...');
        const newHash = await bcrypt.hash('admin123', 10);
        user.password = newHash;
        await user.save();
        console.log('✅ تم تحديث كلمة المرور بنجاح!');
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    process.exit(1);
  }
};

testLogin();