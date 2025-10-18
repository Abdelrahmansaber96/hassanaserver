const mongoose = require('mongoose');
require('dotenv').config();

// Import Customer model
const Customer = require('./src/models/Customer');

async function checkCustomers() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to database');

    // Count customers
    const count = await Customer.countDocuments();
    console.log(`📊 Total customers in database: ${count}`);

    // Get all customers
    const customers = await Customer.find({}).sort({ createdAt: -1 }).limit(10);
    console.log('\n📋 Recent customers:');
    customers.forEach((customer, index) => {
      console.log(`${index + 1}. ${customer.name} - ${customer.phone} - Active: ${customer.isActive}`);
    });

    // Check if any customers exist
    if (count === 0) {
      console.log('\n⚠️ No customers found in database');
    } else {
      console.log(`\n✅ Found ${count} customers`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

checkCustomers();