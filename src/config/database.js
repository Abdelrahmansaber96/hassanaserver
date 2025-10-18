const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // استخدام URI مباشر كحل مؤقت
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/animal_vaccination_db';
    console.log('Attempting to connect to:', mongoURI);
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;