const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Branch = require('../models/Branch');
const Customer = require('../models/Customer');
const Booking = require('../models/Booking');
const Consultation = require('../models/Consultation');
const Offer = require('../models/Offer');
const Notification = require('../models/Notification');
const Vaccination = require('../models/Vaccination');

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected for seeding');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Clear existing data
const clearData = async () => {
  try {
    await User.deleteMany({});
    await Branch.deleteMany({});
    await Customer.deleteMany({});
    await Booking.deleteMany({});
    await Consultation.deleteMany({});
    await Offer.deleteMany({});
    await Notification.deleteMany({});
    await Vaccination.deleteMany({});
    console.log('🗑️  Cleared existing data');
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};

// Seed branches
const seedBranches = async () => {
  const branches = [
    {
      name: 'فرع الرياض الرئيسي',
      location: 'طريق الملك فهد، حي العليا',
      city: 'الرياض',
      province: 'الرياض',
      phone: '+966112345678',
      email: 'riyadh@clinic.com',
      manager: 'أحمد محمد',
      workingHours: { start: '08:00', end: '20:00' },
      workingDays: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'],
      services: ['تطعيمات الإبل', 'تطعيمات الأغنام', 'تطعيمات الماعز', 'استشارات طبية'],
      capacity: 100,
      description: 'الفرع الرئيسي في العاصمة الرياض',
      rating: 4.8
    },
    {
      name: 'فرع جدة',
      location: 'طريق الأمير محمد بن عبدالعزيز',
      city: 'جدة',
      province: 'مكة المكرمة',
      phone: '+966126543210',
      email: 'jeddah@clinic.com',
      manager: 'خالد العتيبي',
      workingHours: { start: '09:00', end: '18:00' },
      workingDays: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'],
      services: ['تطعيمات الإبل', 'تطعيمات الماشية', 'فحوصات طبية'],
      capacity: 75,
      description: 'فرع جدة على ساحل البحر الأحمر',
      rating: 4.5
    },
    {
      name: 'فرع الدمام',
      location: 'طريق الملك سعود',
      city: 'الدمام',
      province: 'الشرقية',
      phone: '+966138765432',
      email: 'dammam@clinic.com',
      manager: 'سعيد الدوسري',
      workingHours: { start: '08:30', end: '19:00' },
      workingDays: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'],
      services: ['تطعيمات الأغنام', 'تطعيمات الماعز', 'استشارات طبية'],
      capacity: 60,
      description: 'فرع الدمام في المنطقة الشرقية',
      rating: 4.6
    }
  ];

  const createdBranches = await Branch.insertMany(branches);
  console.log(`🏢 Seeded ${createdBranches.length} branches`);
  return createdBranches;
};

// Seed users
const seedUsers = async (branches) => {
  const users = [
    {
      name: 'أحمد العلي',
      email: 'admin@clinic.com',
      password: 'password123',
      role: 'admin',
      phone: '+966501234567',
      isActive: true
    },
    {
      name: 'د. محمد السعيد',
      email: 'doctor1@clinic.com',
      password: 'password123',
      role: 'doctor',
      phone: '+966502345678',
      branch: branches[0]._id,
      specialization: 'طب بيطري - الحيوانات الكبيرة',
      isActive: true
    },
    {
      name: 'د. فاطمة الزهراني',
      email: 'doctor2@clinic.com',
      password: 'password123',
      role: 'doctor',
      phone: '+966503456789',
      branch: branches[1]._id,
      specialization: 'طب بيطري - الحيوانات الصغيرة',
      isActive: true
    },
    {
      name: 'سارة أحمد',
      email: 'staff1@clinic.com',
      password: 'password123',
      role: 'staff',
      phone: '+966504567890',
      branch: branches[0]._id,
      isActive: true
    },
    {
      name: 'خالد المطيري',
      email: 'staff2@clinic.com',
      password: 'password123',
      role: 'staff',
      phone: '+966505678901',
      branch: branches[1]._id,
      isActive: true
    },
    {
      name: 'نورا الفيصل',
      email: 'staff3@clinic.com',
      password: 'password123',
      role: 'staff',
      phone: '+966506789012',
      branch: branches[2]._id,
      isActive: true
    }
  ];

  // Create users one by one to ensure password hashing
  const createdUsers = [];
  for (let i = 0; i < users.length; i++) {
    const user = await User.create(users[i]);
    createdUsers.push(user);
  }
  console.log(`👥 Seeded ${createdUsers.length} users`);
  
  // Update branch managers
  await Branch.findByIdAndUpdate(branches[0]._id, { manager: createdUsers[3]._id });
  await Branch.findByIdAndUpdate(branches[1]._id, { manager: createdUsers[4]._id });
  await Branch.findByIdAndUpdate(branches[2]._id, { manager: createdUsers[5]._id });
  
  return createdUsers;
};

// Seed customers
const seedCustomers = async () => {
  const customers = [
    {
      name: 'عبدالله القحطاني',
      phone: '+966507654321',
      address: 'حي النرجس، شارع التحلية',
      city: 'الرياض',
      animals: [
        {
          name: 'ناقة الصحراء',
          type: 'camel',
          age: 5,
          weight: 450,
          breed: 'المجاهيم'
        },
        {
          name: 'شاة البركة',
          type: 'sheep',
          age: 2,
          weight: 35,
          breed: 'النعيمي'
        }
      ]
    },
    {
      name: 'محمد الغامدي',
      phone: '+966508765432',
      address: 'حي الروضة',
      city: 'جدة',
      animals: [
        {
          name: 'عنزة الخير',
          type: 'goat',
          age: 3,
          weight: 28,
          breed: 'العارضي'
        }
      ]
    },
    {
      name: 'سعد الدوسري',
      phone: '+966509876543',
      address: 'حي الفيصلية',
      city: 'الدمام',
      animals: [
        {
          name: 'ناقة الحليب',
          type: 'camel',
          age: 4,
          weight: 380,
          breed: 'المجاهيم'
        },
        {
          name: 'الشاة الصغيرة',
          type: 'sheep',
          age: 1,
          weight: 25,
          breed: 'النعيمي'
        }
      ]
    },
    {
      name: 'راشد الشمري',
      phone: '+966500987654',
      address: 'حي السلام',
      city: 'الرياض',
      animals: [
        {
          name: 'ناقة الأصالة',
          type: 'camel',
          age: 7,
          weight: 520,
          breed: 'الوضح'
        }
      ]
    },
    {
      name: 'أحمد البلوي',
      phone: '+966501098765',
      address: 'حي الشاطئ',
      city: 'جدة',
      animals: [
        {
          name: 'خروف العيد',
          type: 'sheep',
          age: 1.5,
          weight: 32,
          breed: 'النجدي'
        },
        {
          name: 'شاة الأضحية',
          type: 'sheep',
          age: 2.5,
          weight: 38,
          breed: 'النجدي'
        }
      ]
    }
  ];

  const createdCustomers = await Customer.insertMany(customers);
  console.log(`👥 Seeded ${createdCustomers.length} customers`);
  return createdCustomers;
};

// Seed bookings
const seedBookings = async (customers, branches, users, vaccinations) => {
  const doctors = users.filter(user => user.role === 'doctor');
  const staff = users.filter(user => user.role === 'staff');
  
  const bookings = [];
  const statuses = ['pending', 'confirmed', 'completed', 'cancelled'];

  for (let i = 0; i < 50; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const branch = branches[Math.floor(Math.random() * branches.length)];
    const doctor = doctors[Math.floor(Math.random() * doctors.length)];
    const animal = customer.animals[Math.floor(Math.random() * customer.animals.length)];
    const vaccination = vaccinations[Math.floor(Math.random() * vaccinations.length)];
    
    // Create random dates (past 30 days to future 30 days)
    const appointmentDate = new Date();
    appointmentDate.setDate(appointmentDate.getDate() + Math.floor(Math.random() * 60) - 30);
    
    const hours = Math.floor(Math.random() * 10) + 8; // 8 AM to 6 PM
    const minutes = Math.random() < 0.5 ? '00' : '30';
    
    bookings.push({
      customer: customer._id,
      branch: branch._id,
      doctor: doctor._id,
      animal: {
        name: animal.name,
        type: animal.type,
        age: animal.age,
        weight: animal.weight,
        breed: animal.breed
      },
      vaccination: {
        id: vaccination._id,
        type: vaccination.name, // Use name as type
        name: vaccination.nameAr,
        nameAr: vaccination.nameAr,
        price: vaccination.price,
        duration: vaccination.duration,
        dosage: '1ml',
        manufacturer: 'Veterinary Pharmaceuticals',
        batchNumber: `B${Math.floor(Math.random() * 10000)}`,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
      },
      appointmentDate,
      appointmentTime: `${hours.toString().padStart(2, '0')}:${minutes}`,
      timeSlot: `${hours.toString().padStart(2, '0')}:${minutes}`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      price: vaccination.price, // Keep this for backward compatibility
      totalAmount: vaccination.price,
      paid: Math.random() < 0.7, // 70% paid
      paymentMethod: ['cash', 'card', 'bank_transfer'][Math.floor(Math.random() * 3)],
      createdBy: staff[Math.floor(Math.random() * staff.length)]._id
    });
  }

  // Create bookings one by one to ensure unique booking numbers
  const createdBookings = [];
  for (let i = 0; i < bookings.length; i++) {
    const booking = await Booking.create(bookings[i]);
    createdBookings.push(booking);
  }
  console.log(`📅 Seeded ${createdBookings.length} bookings`);
  return createdBookings;
};

// Seed consultations
const seedConsultations = async (customers, users) => {
  const doctors = users.filter(user => user.role === 'doctor');
  const staff = users.filter(user => user.role === 'staff');
  
  const consultations = [];
  const symptoms = [
    'فقدان الشهية وارتفاع درجة الحرارة',
    'إسهال مستمر منذ يومين',
    'صعوبة في التنفس وسعال',
    'تورم في الأطراف',
    'عدم انتظام في الحركة',
    'إفرازات من العينين والأنف'
  ];

  for (let i = 0; i < 25; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const doctor = doctors[Math.floor(Math.random() * doctors.length)];
    const animal = customer.animals[Math.floor(Math.random() * customer.animals.length)];
    const symptom = symptoms[Math.floor(Math.random() * symptoms.length)];
    
    // Create random dates (past 15 days to future 15 days)
    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + Math.floor(Math.random() * 30) - 15);
    
    const hours = Math.floor(Math.random() * 8) + 9; // 9 AM to 5 PM
    const minutes = Math.random() < 0.5 ? '00' : '30';
    
    consultations.push({
      customer: customer._id,
      doctor: doctor._id,
      animal: {
        name: animal.name,
        type: animal.type,
        age: animal.age,
        symptoms: symptom
      },
      scheduledDate,
      scheduledTime: `${hours.toString().padStart(2, '0')}:${minutes}`,
      duration: [30, 45, 60][Math.floor(Math.random() * 3)],
      status: ['scheduled', 'in_progress', 'completed', 'cancelled'][Math.floor(Math.random() * 4)],
      consultationType: ['phone', 'video'][Math.floor(Math.random() * 2)],
      priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
      customerPhone: customer.phone,
      price: Math.floor(Math.random() * 100) + 30, // 30-130 SAR
      paid: Math.random() < 0.6, // 60% paid
      createdBy: staff[Math.floor(Math.random() * staff.length)]._id
    });
  }

  // Create consultations one by one to ensure unique consultation numbers
  const createdConsultations = [];
  for (let i = 0; i < consultations.length; i++) {
    const consultation = await Consultation.create(consultations[i]);
    createdConsultations.push(consultation);
  }
  console.log(`📞 Seeded ${createdConsultations.length} consultations`);
  return createdConsultations;
};

// Seed offers
const seedOffers = async (branches, users) => {
  const admin = users.find(user => user.role === 'admin');
  
  const offers = [
    {
      title: 'خصم 20% على تطعيمات الإبل',
      description: 'خصم خاص على جميع تطعيمات الإبل لفترة محدودة',
      type: 'vaccination',
      discountType: 'percentage',
      discountValue: 20,
      minAmount: 100,
      maxDiscount: 50,
      applicableServices: ['تطعيم الحمى القلاعية', 'تطعيم الجمرة الخبيثة'],
      targetCustomers: 'all',
      branches: [branches[0]._id, branches[1]._id],
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      usageLimit: 100,
      terms: 'العرض صالح للعملاء الجدد والحاليين',
      createdBy: admin._id
    },
    {
      title: 'باقة الفحص الشامل',
      description: 'فحص شامل + تطعيم بسعر مخفض',
      type: 'package',
      discountType: 'fixed',
      discountValue: 75,
      minAmount: 200,
      targetCustomers: 'new',
      branches: branches.map(b => b._id),
      startDate: new Date(),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
      terms: 'العرض للعملاء الجدد فقط',
      createdBy: admin._id
    }
  ];

  const createdOffers = await Offer.insertMany(offers);
  console.log(`🎁 Seeded ${createdOffers.length} offers`);
  return createdOffers;
};

// Seed vaccinations
const seedVaccinations = async () => {
  const vaccinations = [
    {
      name: 'Foot and Mouth Disease Vaccine',
      nameAr: 'لقاح الحمى القلاعية',
      description: 'Vaccine against foot and mouth disease for livestock',
      descriptionAr: 'لقاح ضد مرض الحمى القلاعية للماشية',
      animalTypes: ['camel', 'cow', 'sheep', 'goat'],
      price: 150,
      duration: 30,
      ageRange: { min: 6, max: 15 },
      frequency: 'biannually',
      frequencyMonths: 6,
      sideEffects: ['Mild swelling at injection site', 'Temporary fever'],
      sideEffectsAr: ['تورم خفيف في مكان الحقن', 'حمى مؤقتة'],
      instructions: 'Administer subcutaneously. Monitor for 30 minutes post-vaccination.',
      instructionsAr: 'يُحقن تحت الجلد. يُراقب لمدة 30 دقيقة بعد التطعيم.'
    },
    {
      name: 'Brucellosis Vaccine',
      nameAr: 'لقاح البروسيلا',
      description: 'Vaccine against brucellosis in livestock',
      descriptionAr: 'لقاح ضد مرض البروسيلا في الماشية',
      animalTypes: ['camel', 'cow', 'sheep', 'goat'],
      price: 200,
      duration: 45,
      ageRange: { min: 4, max: 12 },
      frequency: 'annually',
      frequencyMonths: 12,
      sideEffects: ['Local reaction', 'Mild lethargy'],
      sideEffectsAr: ['تفاعل موضعي', 'خمول خفيف'],
      instructions: 'Single dose vaccination. Avoid in pregnant animals.',
      instructionsAr: 'جرعة واحدة. يُتجنب في الحيوانات الحامل.'
    },
    {
      name: 'Clostridial Vaccine',
      nameAr: 'لقاح الكلوستريديا',
      description: 'Multi-clostridial vaccine for sheep and goats',
      descriptionAr: 'لقاح متعدد الكلوستريديا للأغنام والماعز',
      animalTypes: ['sheep', 'goat'],
      price: 120,
      duration: 25,
      ageRange: { min: 2, max: 10 },
      frequency: 'annually',
      frequencyMonths: 12,
      sideEffects: ['Mild swelling', 'Decreased appetite'],
      sideEffectsAr: ['تورم خفيف', 'انخفاض في الشهية'],
      instructions: 'Intramuscular injection. Booster required after 4 weeks for first-time vaccination.',
      instructionsAr: 'حقن في العضل. جرعة منشطة مطلوبة بعد 4 أسابيع للتطعيم الأول.'
    },
    {
      name: 'Rabies Vaccine',
      nameAr: 'لقاح السعار',
      description: 'Rabies prevention vaccine for all animal types',
      descriptionAr: 'لقاح الوقاية من السعار لجميع أنواع الحيوانات',
      animalTypes: ['camel', 'cow', 'sheep', 'goat', 'horse', 'other'],
      price: 180,
      duration: 35,
      ageRange: { min: 3, max: 20 },
      frequency: 'annually',
      frequencyMonths: 12,
      sideEffects: ['Injection site soreness', 'Mild fever'],
      sideEffectsAr: ['ألم في مكان الحقن', 'حمى خفيفة'],
      instructions: 'Annual vaccination required. Safe for pregnant animals.',
      instructionsAr: 'تطعيم سنوي مطلوب. آمن للحيوانات الحامل.'
    },
    {
      name: 'Tetanus Vaccine',
      nameAr: 'لقاح التيتانوس',
      description: 'Tetanus toxoid vaccine for horses and other animals',
      descriptionAr: 'لقاح توكسويد التيتانوس للخيول والحيوانات الأخرى',
      animalTypes: ['horse', 'camel', 'other'],
      price: 100,
      duration: 20,
      ageRange: { min: 6, max: 25 },
      frequency: 'annually',
      frequencyMonths: 12,
      sideEffects: ['Local swelling', 'Temporary lameness'],
      sideEffectsAr: ['تورم موضعي', 'عرج مؤقت'],
      instructions: 'Intramuscular injection in neck muscle. Booster every 12 months.',
      instructionsAr: 'حقن في عضلة الرقبة. جرعة منشطة كل 12 شهراً.'
    },
    {
      name: 'Peste des Petits Ruminants (PPR) Vaccine',
      nameAr: 'لقاح طاعون المجترات الصغيرة',
      description: 'PPR vaccine for sheep and goats',
      descriptionAr: 'لقاح طاعون المجترات الصغيرة للأغنام والماعز',
      animalTypes: ['sheep', 'goat'],
      price: 80,
      duration: 30,
      ageRange: { min: 4, max: 8 },
      frequency: 'annually',
      frequencyMonths: 12,
      sideEffects: ['Mild fever', 'Temporary loss of appetite'],
      sideEffectsAr: ['حمى خفيفة', 'فقدان مؤقت للشهية'],
      instructions: 'Single annual dose. Store vaccine properly in cold chain.',
      instructionsAr: 'جرعة سنوية واحدة. يُحفظ اللقاح في سلسلة التبريد.'
    },
    {
      name: 'Lumpy Skin Disease Vaccine',
      nameAr: 'لقاح مرض الجلد العقدي',
      description: 'Vaccine against lumpy skin disease in cattle',
      descriptionAr: 'لقاح ضد مرض الجلد العقدي في الأبقار',
      animalTypes: ['cow'],
      price: 250,
      duration: 40,
      ageRange: { min: 6, max: 15 },
      frequency: 'annually',
      frequencyMonths: 12,
      sideEffects: ['Nodule formation at injection site', 'Mild fever'],
      sideEffectsAr: ['تكوين عقيدة في مكان الحقن', 'حمى خفيفة'],
      instructions: 'Subcutaneous injection. Avoid vaccination during pregnancy.',
      instructionsAr: 'حقن تحت الجلد. يُتجنب التطعيم أثناء الحمل.'
    },
    {
      name: 'Camel Pox Vaccine',
      nameAr: 'لقاح جدري الإبل',
      description: 'Specific vaccine for camel pox prevention',
      descriptionAr: 'لقاح مخصص للوقاية من جدري الإبل',
      animalTypes: ['camel'],
      price: 300,
      duration: 50,
      ageRange: { min: 12, max: 20 },
      frequency: 'annually',
      frequencyMonths: 12,
      sideEffects: ['Local reaction', 'Mild swelling'],
      sideEffectsAr: ['تفاعل موضعي', 'تورم خفيف'],
      instructions: 'Intradermal injection. Monitor closely for adverse reactions.',
      instructionsAr: 'حقن داخل الأدمة. مراقبة دقيقة للتفاعلات الضارة.'
    }
  ];

  const createdVaccinations = await Vaccination.insertMany(vaccinations);
  console.log(`💉 Seeded ${createdVaccinations.length} vaccinations`);
  return createdVaccinations;
};

// Main seeding function
const seedAll = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    await connectDB();
    await clearData();
    
    const branches = await seedBranches();
    const users = await seedUsers(branches);
    const customers = await seedCustomers();
    const vaccinations = await seedVaccinations();
    const bookings = await seedBookings(customers, branches, users, vaccinations);
    const consultations = await seedConsultations(customers, users);
    const offers = await seedOffers(branches, users);
    
    console.log('✅ Database seeding completed successfully!');
    console.log(`
📊 Summary:
- Branches: ${branches.length}
- Users: ${users.length}
- Customers: ${customers.length}
- Vaccinations: ${vaccinations.length}
- Bookings: ${bookings.length}
- Consultations: ${consultations.length}
- Offers: ${offers.length}

🔑 Login Credentials:
Admin: admin@clinic.com / password123
Doctor 1: doctor1@clinic.com / password123
Doctor 2: doctor2@clinic.com / password123
Staff: staff1@clinic.com / password123
    `);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Run seeding
if (require.main === module) {
  seedAll();
}

module.exports = seedAll;