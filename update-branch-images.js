const mongoose = require('mongoose');
const Branch = require('./src/models/Branch');
require('dotenv').config();

const updateBranchImages = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/animal_vaccination_db';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // صور افتراضية للفروع
    const branchImages = {
      'RYD001': 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800',
      'JED001': 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800',
      'DMM001': 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
      // للفروع التي لها كود آخر
      'default': 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800'
    };

    const branches = await Branch.find({});
    
    console.log(`\n📊 Found ${branches.length} branches\n`);

    for (const branch of branches) {
      const image = branchImages[branch.code] || branchImages['default'];
      
      // استخدام updateOne لتحديث الصورة فقط
      await Branch.updateOne(
        { _id: branch._id },
        { $set: { image: image } }
      );
      
      console.log(`✅ Updated: ${branch.name}`);
      console.log(`   📷 Image: ${image}\n`);
    }

    console.log('🎉 All branches updated with images!');
    
    // عرض النتيجة
    const updatedBranches = await Branch.find({}).select('name code image');
    console.log('\n📋 Updated Branches:');
    updatedBranches.forEach(b => {
      console.log(`   ${b.name} (${b.code})`);
      console.log(`   📷 ${b.image}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
};

updateBranchImages();
