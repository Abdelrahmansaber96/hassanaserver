const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/animal_vaccination_db')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

const Booking = require('./src/models/Booking');
const Vaccination = require('./src/models/Vaccination');

async function fixBookingsFrequency() {
  console.log('\n🔧 Fixing Bookings Frequency Fields...\n');
  
  try {
    // Get all bookings
    const bookings = await Booking.find({});
    console.log(`Found ${bookings.length} bookings to check\n`);
    
    let fixed = 0;
    let skipped = 0;
    
    for (const booking of bookings) {
      // Check if frequency is 'once' (default value that needs fixing)
      if (booking.vaccination.frequency === 'once') {
        // Get the actual vaccination from database
        const vaccination = await Vaccination.findById(booking.vaccination.id);
        
        if (vaccination) {
          // Update the booking with correct frequency values
          booking.vaccination.frequency = vaccination.frequency;
          booking.vaccination.frequencyMonths = vaccination.frequencyMonths;
          
          await booking.save();
          
          console.log(`✅ Fixed ${booking.bookingNumber}: ${booking.vaccination.name}`);
          console.log(`   Changed from: once → ${vaccination.frequency} (${vaccination.frequencyMonths} months)`);
          fixed++;
        } else {
          console.log(`⚠️ ${booking.bookingNumber}: Vaccination not found in database`);
          skipped++;
        }
      } else {
        skipped++;
      }
    }
    
    console.log('\n📊 Summary:');
    console.log(`   ✅ Fixed: ${fixed} bookings`);
    console.log(`   ⏭️ Skipped: ${skipped} bookings (already correct)`);
    console.log(`   📝 Total: ${bookings.length} bookings\n`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

fixBookingsFrequency();
