const mongoose = require('mongoose');
const Customer = require('./src/models/Customer');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/animal_vaccination_db';

async function cleanDuplicatePhones() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all duplicate phone numbers
    const duplicates = await Customer.aggregate([
      {
        $group: {
          _id: '$phone',
          count: { $sum: 1 },
          customers: { $push: { id: '$_id', name: '$name', createdAt: '$createdAt' } }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]);

    if (duplicates.length === 0) {
      console.log('✅ No duplicate phone numbers found!');
      process.exit(0);
      return;
    }

    console.log(`\n⚠️  Found ${duplicates.length} duplicate phone numbers\n`);

    for (const dup of duplicates) {
      console.log(`📞 Phone: ${dup._id} (${dup.count} entries)`);
      
      // Sort by createdAt to keep the oldest
      dup.customers.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      
      console.log('   Keeping (oldest):');
      console.log(`     - ${dup.customers[0].name} (${dup.customers[0].id})`);
      
      console.log('   Removing:');
      for (let i = 1; i < dup.customers.length; i++) {
        console.log(`     - ${dup.customers[i].name} (${dup.customers[i].id})`);
        
        // Mark as inactive instead of deleting (soft delete)
        await Customer.findByIdAndUpdate(
          dup.customers[i].id,
          { 
            isActive: false,
            phone: `${dup._id}_duplicate_${i}` // Change phone to avoid conflict
          }
        );
      }
      console.log('');
    }

    console.log('✅ Cleanup completed!');
    console.log('💡 Duplicate entries have been marked as inactive and phone numbers modified.');
    console.log('💡 Now you can run: node create-customer-indexes.js');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

cleanDuplicatePhones();
