const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  isActive: Boolean
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function verifyUser() {
  try {
    await mongoose.connect('mongodb://localhost:27017/animal_vaccination_db');
    console.log('✅ Connected to MongoDB\n');

    const user = await User.findOne({ email: 'admin@clinic.com' });
    
    if (!user) {
      console.log('❌ User not found!');
      process.exit(1);
    }

    console.log('📧 Email:', user.email);
    console.log('👤 Name:', user.name);
    console.log('🎭 Role:', user.role);
    console.log('🟢 Active:', user.isActive);
    console.log('🔒 Password Hash:', user.password.substring(0, 30) + '...\n');

    // اختبار كلمة المرور
    console.log('🔐 Testing password "admin123"...');
    const isMatch = await bcrypt.compare('admin123', user.password);
    console.log('Result:', isMatch ? '✅ Password is CORRECT' : '❌ Password is WRONG');
    
    if (!isMatch) {
      console.log('\n⚠️  The password in database does not match "admin123"');
      console.log('🔧 Fixing password...');
      
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.updateOne({ email: 'admin@clinic.com' }, { password: hashedPassword });
      
      console.log('✅ Password updated successfully!');
      
      // تحقق مرة أخرى
      const updatedUser = await User.findOne({ email: 'admin@clinic.com' });
      const isNowMatch = await bcrypt.compare('admin123', updatedUser.password);
      console.log('Verification:', isNowMatch ? '✅ Password now works!' : '❌ Still wrong');
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

verifyUser();
