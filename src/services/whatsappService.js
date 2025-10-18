// WhatsApp Service for sending notifications
class WhatsAppService {
  constructor() {
    this.apiKey = process.env.WHATSAPP_API_KEY;
    this.baseUrl = process.env.WHATSAPP_BASE_URL || 'https://api.whatsapp.com';
  }

  async sendMessage(phoneNumber, message) {
    try {
      // In a real implementation, you would use a WhatsApp Business API
      console.log(`📱 WhatsApp message to ${phoneNumber}: ${message}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        messageId: `wa_${Date.now()}`,
        status: 'sent'
      };
    } catch (error) {
      console.error('WhatsApp send error:', error);
      return {
        success: false,
        error: error.message
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
}

module.exports = new WhatsAppService();