const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/animal_vaccination_db')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

const Vaccination = require('./src/models/Vaccination');

async function checkVaccinations() {
  console.log('\n🔍 Checking Vaccinations in Database...\n');
  
  try {
    const vaccinations = await Vaccination.find().limit(5);
    
    if (vaccinations.length === 0) {
      console.log('⚠️ No vaccinations found in database!');
      process.exit(0);
    }
    
    console.log(`Found ${vaccinations.length} vaccinations:\n`);
    
    vaccinations.forEach((v, index) => {
      console.log(`${index + 1}. ${v.name} (${v.nameAr})`);
      console.log(`   ID: ${v._id}`);
      console.log(`   Price: ${v.price} SAR`);
      console.log(`   Duration: ${v.duration} minutes`);
      console.log(`   Frequency: ${v.frequency || 'NOT SET ❌'}`);
      console.log(`   Frequency Months: ${v.frequencyMonths || 'NOT SET ❌'}`);
      console.log(`   Animal Types: ${v.animalTypes.join(', ')}`);
      console.log(`   Active: ${v.isActive ? '✅' : '❌'}`);
      console.log('');
    });
    
    // Check if any vaccination is missing frequency
    const missingFrequency = vaccinations.filter(v => !v.frequency);
    if (missingFrequency.length > 0) {
      console.log(`\n⚠️ WARNING: ${missingFrequency.length} vaccinations missing frequency field!`);
      console.log('Need to update database with default values.\n');
    } else {
      console.log('\n✅ All vaccinations have frequency field!\n');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

checkVaccinations();
