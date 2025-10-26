const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/animal_vaccination_db')
  .then(() => console.log('✅ Connected'))
  .catch(err => console.error('❌ Error:', err));

const Customer = require('./src/models/Customer');

async function getCustomerIds() {
  try {
    const customers = await Customer.find().limit(3).select('name phone animals');
    
    if (customers.length === 0) {
      console.log('⚠️ No customers found!');
      process.exit(0);
    }
    
    console.log('\n📋 Available Customers:\n');
    customers.forEach(c => {
      console.log(`Customer ID: ${c._id}`);
      console.log(`Name: ${c.name}`);
      console.log(`Phone: ${c.phone}`);
      console.log(`Animals: ${c.animals.length}`);
      if (c.animals.length > 0) {
        console.log(`First Animal ID: ${c.animals[0]._id}`);
      }
      console.log('---');
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

getCustomerIds();
