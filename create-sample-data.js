const mongoose = require('mongoose');
const Booking = require('./src/models/Booking');
const Customer = require('./src/models/Customer');
const Branch = require('./src/models/Branch');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/animal_vaccination', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createSampleData() {
  try {
    console.log('Creating sample data for charts...');

    // Create sample branches
    const branches = await Branch.find();
    if (branches.length === 0) {
      const sampleBranches = [
        { 
          name: 'الفرع الرئيسي', 
          code: 'MAIN001',
          address: 'شارع الملك فهد، حي العليا',
          city: 'الرياض', 
          phone: '0112345678',
          email: 'main@clinic.com',
          isActive: true 
        },
        { 
          name: 'فرع الشرق', 
          code: 'EAST001',
          address: 'طريق الخليج، حي الفيصلية',
          city: 'الدمام', 
          phone: '0138765432',
          email: 'east@clinic.com',
          isActive: true 
        },
        { 
          name: 'فرع الغرب', 
          code: 'WEST001',
          address: 'شارع التحلية، حي الزهراء',
          city: 'جدة', 
          phone: '0129876543',
          email: 'west@clinic.com',
          isActive: true 
        }
      ];
      
      await Branch.insertMany(sampleBranches);
      console.log('✅ Created sample branches');
    }

    // Create sample customers with animals
    const customers = await Customer.find();
    if (customers.length === 0) {
      const sampleCustomers = [
        {
          name: 'أحمد محمد',
          phone: '0501234567',
          email: 'ahmed@example.com',
          animals: [
            { type: 'camel', name: 'الناقة البيضاء', age: 5, breed: 'مجاهيم' },
            { type: 'sheep', name: 'الخروف الأسود', age: 2, breed: 'نجدي' }
          ],
          isActive: true
        },
        {
          name: 'فاطمة أحمد',
          phone: '0507654321',
          email: 'fatima@example.com',
          animals: [
            { type: 'goat', name: 'العنزة الشقراء', age: 3, breed: 'عارضي' },
            { type: 'camel', name: 'الجمل الكبير', age: 7, breed: 'شعل' }
          ],
          isActive: true
        },
        {
          name: 'محمد عبدالله',
          phone: '0509876543',
          email: 'mohammed@example.com',
          animals: [
            { type: 'sheep', name: 'الغنم الأبيض', age: 1, breed: 'حري' },
            { type: 'sheep', name: 'الغنم البني', age: 2, breed: 'نجدي' }
          ],
          isActive: true
        }
      ];
      
      await Customer.insertMany(sampleCustomers);
      console.log('✅ Created sample customers with animals');
    }

    // Create a sample admin user for bookings
    const User = require('./src/models/User');
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'مدير النظام',
        email: 'admin@clinic.com',
        password: 'password123',
        role: 'admin',
        phone: '0501234567',
        isActive: true
      });
      console.log('✅ Created admin user');
    }

    // Create sample bookings
    const bookings = await Booking.find();
    if (bookings.length < 10) {
      const allCustomers = await Customer.find();
      const allBranches = await Branch.find();
      
      const sampleBookings = [];
      const statuses = ['pending', 'confirmed', 'completed', 'cancelled'];
      const prices = [150, 200, 250, 300, 350];
      const vaccinationTypes = ['الحمى القلاعية', 'الجدري', 'التسمم المعوي', 'الكوليرا'];
      const animalTypes = ['camel', 'sheep', 'goat'];
      
      // Create bookings for the last 7 days
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        // Create 2-5 bookings per day
        const bookingsPerDay = Math.floor(Math.random() * 4) + 2;
        
        for (let j = 0; j < bookingsPerDay; j++) {
          const randomCustomer = allCustomers[Math.floor(Math.random() * allCustomers.length)];
          const randomBranch = allBranches[Math.floor(Math.random() * allBranches.length)];
          const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
          const randomPrice = prices[Math.floor(Math.random() * prices.length)];
          const randomVaccination = vaccinationTypes[Math.floor(Math.random() * vaccinationTypes.length)];
          const randomAnimalType = animalTypes[Math.floor(Math.random() * animalTypes.length)];
          const randomAnimal = randomCustomer.animals.find(a => a.type === randomAnimalType) || randomCustomer.animals[0];
          
          // Set appointment time
          const appointmentTime = new Date(date);
          appointmentTime.setHours(8 + j, 0, 0, 0);
          
          const bookingNumber = `BK${Date.now()}${Math.floor(Math.random() * 1000)}`;
          
          sampleBookings.push({
            bookingNumber: bookingNumber,
            customer: randomCustomer._id,
            branch: randomBranch._id,
            createdBy: adminUser._id,
            appointmentDate: date,
            appointmentTime: appointmentTime,
            status: randomStatus,
            price: randomPrice,
            animal: {
              name: randomAnimal.name,
              type: randomAnimal.type,
              age: randomAnimal.age,
              breed: randomAnimal.breed
            },
            vaccination: {
              name: randomVaccination,
              type: randomVaccination,
              price: randomPrice,
              dosage: '1 جرعة',
              notes: 'تطعيم وقائي'
            },
            totalAmount: randomPrice,
            paid: randomStatus === 'completed' ? true : Math.random() > 0.3,
            notes: `حجز تطعيم ${randomVaccination} لـ ${randomAnimal.name}`,
            createdAt: date
          });
        }
      }
      
      await Booking.insertMany(sampleBookings);
      console.log(`✅ Created ${sampleBookings.length} sample bookings`);
    }

    console.log('✅ Sample data creation completed!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
    process.exit(1);
  }
}

createSampleData();