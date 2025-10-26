const mongoose = require('mongoose');
const Customer = require('./src/models/Customer');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/animal_vaccination_db';

async function createIndexes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Drop existing phone index if any
    try {
      await Customer.collection.dropIndex('phone_1');
      console.log('📋 Dropped old phone index');
    } catch (error) {
      // Index doesn't exist, continue
    }

    // Create unique index on phone
    await Customer.collection.createIndex(
      { phone: 1 }, 
      { 
        unique: true,
        name: 'phone_unique_index',
        background: false
      }
    );
    console.log('✅ Created unique index on phone field');

    // Check for duplicate phone numbers
    const duplicates = await Customer.aggregate([
      {
        $group: {
          _id: '$phone',
          count: { $sum: 1 },
          ids: { $push: '$_id' }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]);

    if (duplicates.length > 0) {
      console.log('\n⚠️  Found duplicate phone numbers:');
      duplicates.forEach(dup => {
        console.log(`   Phone: ${dup._id}, Count: ${dup.count}`);
      });
      console.log('\n💡 Tip: You need to manually clean up duplicate entries before the unique index can work properly.');
    } else {
      console.log('✅ No duplicate phone numbers found');
    }

    // Get total customers
    const totalCustomers = await Customer.countDocuments();
    console.log(`\n📊 Total customers: ${totalCustomers}`);

    // List all indexes
    const indexes = await Customer.collection.indexes();
    console.log('\n📋 Current indexes on Customer collection:');
    indexes.forEach(index => {
      console.log(`   - ${index.name}: ${JSON.stringify(index.key)}`);
      if (index.unique) {
        console.log('     (UNIQUE)');
      }
    });

    console.log('\n✅ All done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createIndexes();
