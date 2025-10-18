const mongoose = require('mongoose');
require('dotenv').config();

// Import Vaccination model
const Vaccination = require('./src/models/Vaccination');

async function checkVaccinations() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to database');

    // Count vaccinations
    const count = await Vaccination.countDocuments();
    console.log(`📊 Total vaccinations in database: ${count}`);

    // Get all vaccinations
    const vaccinations = await Vaccination.find({}).sort({ name: 1 }).limit(10);
    console.log('\n💉 Available vaccinations:');
    vaccinations.forEach((vacc, index) => {
      console.log(`${index + 1}. ${vacc.name} - ${vacc.price} ريال (${vacc.animalTypes.join(', ')})`);
    });

    if (count === 0) {
      console.log('\n⚠️ No vaccinations found in database');
      console.log('You may need to seed the database with vaccination data');
    } else {
      console.log(`\n✅ Found ${count} vaccinations`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

checkVaccinations();