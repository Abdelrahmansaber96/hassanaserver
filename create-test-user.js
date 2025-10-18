const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/animal_vaccination', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createTestUser() {
  try {
    console.log('Creating test user...');

    // Check if user already exists
    const existingUser = await User.findOne({ email: 'admin@clinic.com' });
    if (existingUser) {
      console.log('Test user already exists');
      console.log('Email: admin@clinic.com');
      console.log('Password: admin123');
      process.exit(0);
    }

    // Create test user
    const testUser = await User.create({
      name: 'مدير النظام',
      email: 'admin@clinic.com',
      password: 'admin123', // سيتم تشفيرها تلقائياً في النموذج
      role: 'admin',
      phone: '0501234567',
      isActive: true,
      permissions: ['read', 'write', 'delete', 'admin']
    });

    console.log('✅ Test user created successfully!');
    console.log('Email: admin@clinic.com');
    console.log('Password: admin123');
    console.log('Role: admin');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
    process.exit(1);
  }
}

createTestUser();