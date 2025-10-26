const mongoose = require('mongoose');
const Vaccination = require('./src/models/Vaccination');

mongoose.connect('mongodb://localhost:27017/animal_vaccination_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ Connected to MongoDB\n');
  addVaccinations();
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

async function addVaccinations() {
  try {
    console.log('📝 إضافة تطعيمات تجريبية...\n');

    const vaccinations = [
      {
        name: 'Rift Valley Fever',
        nameAr: 'حمى الوادي المتصدع',
        description: 'Vaccination against Rift Valley Fever',
        descriptionAr: 'تطعيم ضد حمى الوادي المتصدع - مرض فيروسي خطير يصيب الحيوانات',
        animalTypes: ['camel', 'sheep', 'cow', 'goat'],
        price: 150,
        duration: 30,
        frequency: 'annually',
        ageRange: { min: 1, max: 20 },
        sideEffects: ['Mild fever', 'Temporary loss of appetite'],
        sideEffectsAr: ['حمى خفيفة', 'فقدان مؤقت للشهية'],
        instructions: 'Administer subcutaneously',
        instructionsAr: 'يُعطى تحت الجلد',
        isActive: true
      },
      {
        name: 'Anthrax Vaccine',
        nameAr: 'تطعيم الجمرة الخبيثة',
        description: 'Protection against anthrax - a serious bacterial disease',
        descriptionAr: 'حماية من الجمرة الخبيثة - مرض بكتيري خطير',
        animalTypes: ['camel', 'sheep', 'goat', 'cow'],
        price: 200,
        duration: 45,
        frequency: 'annually',
        ageRange: { min: 6, max: 25 },
        sideEffects: ['Swelling at injection site', 'Mild fever'],
        sideEffectsAr: ['تورم في موقع الحقن', 'حمى خفيفة'],
        instructions: 'Intramuscular injection',
        instructionsAr: 'حقن عضلي',
        isActive: true
      },
      {
        name: 'Foot and Mouth Disease',
        nameAr: 'الحمى القلاعية',
        description: 'Vaccination against FMD - highly contagious viral disease',
        descriptionAr: 'تطعيم ضد الحمى القلاعية - مرض فيروسي شديد العدوى',
        animalTypes: ['sheep', 'goat', 'cow'],
        price: 120,
        duration: 30,
        frequency: 'biannually',
        ageRange: { min: 3, max: 15 },
        sideEffects: ['Local reaction', 'Reduced milk production'],
        sideEffectsAr: ['تفاعل موضعي', 'انخفاض إنتاج الحليب'],
        isActive: true
      },
      {
        name: 'Camel Pox Vaccine',
        nameAr: 'تطعيم جدري الإبل',
        description: 'Prevention of camel pox - a contagious viral disease',
        descriptionAr: 'الوقاية من جدري الإبل - مرض فيروسي معدي',
        animalTypes: ['camel'],
        price: 180,
        duration: 40,
        frequency: 'annually',
        ageRange: { min: 1, max: 30 },
        sideEffects: ['Temporary lesions', 'Mild fever'],
        sideEffectsAr: ['آفات مؤقتة', 'حمى خفيفة'],
        isActive: true
      },
      {
        name: 'Peste des Petits Ruminants (PPR)',
        nameAr: 'طاعون المجترات الصغيرة',
        description: 'Vaccine against PPR - deadly disease in small ruminants',
        descriptionAr: 'تطعيم ضد طاعون المجترات الصغيرة - مرض مميت للأغنام والماعز',
        animalTypes: ['sheep', 'goat'],
        price: 90,
        duration: 25,
        frequency: 'annually',
        ageRange: { min: 4, max: 12 },
        sideEffects: ['Mild fever'],
        sideEffectsAr: ['حمى خفيفة'],
        isActive: true
      },
      {
        name: 'Enterotoxemia (Clostridial)',
        nameAr: 'التسمم المعوي',
        description: 'Protection against clostridial diseases',
        descriptionAr: 'حماية من الأمراض الكلوستريدية',
        animalTypes: ['sheep', 'goat', 'cow'],
        price: 85,
        duration: 20,
        frequency: 'annually',
        ageRange: { min: 2, max: 18 },
        isActive: true
      }
    ];

    // حذف التطعيمات القديمة
    await Vaccination.deleteMany({});
    console.log('🗑️  تم حذف التطعيمات القديمة');

    // إضافة التطعيمات الجديدة
    const result = await Vaccination.insertMany(vaccinations);
    
    console.log(`✅ تم إضافة ${result.length} تطعيم بنجاح\n`);
    
    // عرض التطعيمات المضافة
    console.log('📋 التطعيمات المضافة:');
    console.log('='.repeat(60));
    result.forEach((v, i) => {
      console.log(`\n${i + 1}. ${v.nameAr} (${v.name})`);
      console.log(`   - السعر: ${v.price} ريال`);
      console.log(`   - أنواع الحيوانات: ${v.animalTypes.join(', ')}`);
      console.log(`   - العمر: ${v.ageRange.min}-${v.ageRange.max} سنة`);
    });

    console.log('\n✅ تم الانتهاء من إضافة التطعيمات!');
    console.log('🔄 يمكنك الآن تشغيل: node test-vaccinations-endpoint.js\n');

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔒 تم إغلاق الاتصال بقاعدة البيانات');
  }
}
