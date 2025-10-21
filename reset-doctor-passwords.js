const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function resetDoctorPasswords() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/animal_vaccination_db';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    
    const User = require('./src/models/User');
    
    // Find all doctors
    const doctors = await User.find({ role: 'doctor' });
    console.log(`Found ${doctors.length} doctors`);
    
    // Reset password for each doctor
    for (const doctor of doctors) {
      doctor.password = 'password123';
      await doctor.save(); // This will trigger the pre-save hook
      console.log(`✅ Reset password for: ${doctor.email}`);
    }
    
    console.log('\n🎉 All doctor passwords reset to: password123');
    console.log('\n📋 Doctor accounts:');
    console.log('- doctor1@clinic.com / password123');
    console.log('- doctor2@clinic.com / password123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

resetDoctorPasswords();
