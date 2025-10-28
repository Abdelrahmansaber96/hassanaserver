// WhatsApp Service for sending notifications
class WhatsAppService {
  constructor() {
    this.apiKey = process.env.WHATSAPP_API_KEY;
    this.baseUrl = process.env.WHATSAPP_BASE_URL || 'https://graph.facebook.com/v22.0';
    this.phoneId = process.env.WHATSAPP_PHONE_ID;
    
    console.log('🔧 WhatsApp Service Initialized:');
    console.log('  - API Key:', this.apiKey ? `${this.apiKey.substring(0, 20)}...` : 'MISSING');
    console.log('  - Base URL:', this.baseUrl);
    console.log('  - Phone ID:', this.phoneId);
  }

  async sendMessage(phoneNumber, message, useTemplate = false) {
    try {
      console.log(`📱 Sending WhatsApp to ${phoneNumber}`);
      console.log(`📄 Message: ${message}`);
      
      if (!this.apiKey || !this.phoneId) {
        console.error('❌ WhatsApp API credentials not configured');
        return { success: false, error: 'API credentials missing' };
      }

      // تنظيف رقم الهاتف (إزالة + أو 00 من البداية)
      let cleanPhone = phoneNumber.replace(/\D/g, '');
      if (!cleanPhone.startsWith('2')) {
        cleanPhone = '2' + cleanPhone; // إضافة كود مصر إذا لم يكن موجود
      }

      console.log(`📞 Clean phone: ${cleanPhone}`);

      // استدعاء Facebook Graph API
      const axios = require('axios');
      const url = `${this.baseUrl}/messages`;
      
      console.log(`🌐 API URL: ${url}`);

      let payload;
      
      if (useTemplate) {
        // استخدام template معتمد (للاختبار)
        payload = {
          messaging_product: 'whatsapp',
          to: cleanPhone,
          type: 'template',
          template: {
            name: 'hello_world',
            language: {
              code: 'en_US'
            }
          }
        };
      } else {
        // محاولة إرسال رسالة نصية مباشرة (للمحادثات النشطة فقط)
        payload = {
          messaging_product: 'whatsapp',
          to: cleanPhone,
          type: 'text',
          text: {
            preview_url: false,
            body: message
          }
        };
      }
      
      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ WhatsApp sent successfully:', response.data);
      return {
        success: true,
        messageId: response.data.messages[0].id,
        status: 'sent'
      };
    } catch (error) {
      console.error('❌ WhatsApp send error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  async sendBookingConfirmation(booking) {
    const message = `
🏥 تأكيد حجز التطعيم

رقم الحجز: ${booking.bookingNumber}
التاريخ: ${booking.appointmentDate.toLocaleDateString('ar-SA')}
الوقت: ${booking.appointmentTime}
الفرع: ${booking.branch.name}
الحيوان: ${booking.animal.name} (${booking.animal.type})

نتطلع لرؤيتكم!
    `.trim();

    return await this.sendMessage(booking.customer.phone, message);
  }

  async sendBookingReminder(booking) {
    const message = `
🔔 تذكير بموعد التطعيم

مرحباً ${booking.customer.name}
لديك موعد تطعيم غداً في تمام الساعة ${booking.appointmentTime}
الفرع: ${booking.branch.name}
الحيوان: ${booking.animal.name}

نرجو الحضور في الموعد المحدد.
    `.trim();

    return await this.sendMessage(booking.customer.phone, message);
  }

  async sendConsultationNotification(consultation) {
    const message = `
📞 موعد الاستشارة الهاتفية

رقم الاستشارة: ${consultation.consultationNumber}
التاريخ: ${consultation.scheduledDate.toLocaleDateString('ar-SA')}
الوقت: ${consultation.scheduledTime}
الطبيب: ${consultation.doctor.name}

سيتم الاتصال بكم في الموعد المحدد.
    `.trim();

    return await this.sendMessage(consultation.customerPhone, message);
  }

  // إرسال إشعار للفرع عند حجز جديد
  async sendNewBookingNotificationToBranch(booking, branchPhone, branchName) {
    try {
      console.log(`📱 Sending booking notification to ${branchPhone}`);
      
      if (!this.apiKey || !this.phoneId) {
        console.error('❌ WhatsApp API credentials not configured');
        return { success: false, error: 'API credentials missing' };
      }

      // تنظيف رقم الهاتف
      let cleanPhone = branchPhone.replace(/\D/g, '');
      if (!cleanPhone.startsWith('2')) {
        cleanPhone = '2' + cleanPhone;
      }

      const axios = require('axios');
      const url = `${this.baseUrl}/messages`;
      
      // تحضير البيانات للـ template
      const customerName = booking.customer?.name || 'غير محدد';
      const appointmentDate = new Date(booking.appointmentDate).toLocaleDateString('ar-SA');
      const vaccinationName = booking.vaccination.nameAr || booking.vaccination.name;
      const animalType = booking.animal.type === 'sheep' ? 'أغنام' : 
                         booking.animal.type === 'cow' ? 'أبقار' : 
                         booking.animal.type === 'camel' ? 'إبل' : 
                         booking.animal.type === 'goat' ? 'ماعز' : booking.animal.type;
      const animalCount = booking.animal.count || 1;
      const branch = branchName || 'غير محدد';

      const payload = {
        messaging_product: 'whatsapp',
        to: cleanPhone,
        type: 'template',
        template: {
          name: 'newbooking',
          language: {
            code: 'ar_EG'
          },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: customerName },
                { type: 'text', text: appointmentDate },
                { type: 'text', text: vaccinationName },
                { type: 'text', text: animalType },
                { type: 'text', text: animalCount.toString() },
                { type: 'text', text: branch }
              ]
            }
          ]
        }
      };

      console.log('📤 Sending template with data:', {
        customerName,
        appointmentDate,
        vaccinationName,
        animalType,
        animalCount,
        branch
      });

      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ WhatsApp template sent successfully:', response.data);
      return {
        success: true,
        messageId: response.data.messages[0].id,
        status: 'sent'
      };
    } catch (error) {
      console.error('❌ WhatsApp template error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }
}

module.exports = new WhatsAppService();