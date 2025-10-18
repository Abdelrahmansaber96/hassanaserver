const Notification = require('../models/Notification');
const whatsappService = require('./whatsappService');

class NotificationService {
  async sendBookingNotification(booking, type = 'confirmation') {
    try {
      let title, message;

      switch (type) {
        case 'confirmation':
          title = 'تأكيد حجز التطعيم';
          message = `تم تأكيد حجزكم رقم ${booking.bookingNumber} بتاريخ ${booking.appointmentDate.toLocaleDateString('ar-SA')}`;
          break;
        case 'reminder':
          title = 'تذكير بموعد التطعيم';
          message = `لديكم موعد تطعيم غداً في تمام الساعة ${booking.appointmentTime}`;
          break;
        case 'cancellation':
          title = 'إلغاء حجز التطعيم';
          message = `تم إلغاء حجزكم رقم ${booking.bookingNumber}`;
          break;
        default:
          title = 'إشعار حجز التطعيم';
          message = `تحديث على حجزكم رقم ${booking.bookingNumber}`;
      }

      // Create notification record
      const notification = await Notification.create({
        title,
        message,
        type: 'booking',
        priority: type === 'cancellation' ? 'high' : 'medium',
        recipients: 'specific',
        specificCustomers: [booking.customer._id],
        channels: ['app', 'whatsapp'],
        relatedEntity: {
          entityType: 'booking',
          entityId: booking._id
        },
        createdBy: booking.createdBy || booking.updatedBy
      });

      // Send WhatsApp notification
      if (type === 'confirmation') {
        await whatsappService.sendBookingConfirmation(booking);
      } else if (type === 'reminder') {
        await whatsappService.sendBookingReminder(booking);
      }

      return notification;
    } catch (error) {
      console.error('Notification service error:', error);
      throw error;
    }
  }

  async sendConsultationNotification(consultation, type = 'scheduled') {
    try {
      let title, message;

      switch (type) {
        case 'scheduled':
          title = 'موعد الاستشارة الهاتفية';
          message = `تم تحديد موعد استشارة هاتفية رقم ${consultation.consultationNumber}`;
          break;
        case 'reminder':
          title = 'تذكير بالاستشارة الهاتفية';
          message = `لديكم استشارة هاتفية اليوم في تمام الساعة ${consultation.scheduledTime}`;
          break;
        case 'completed':
          title = 'اكتمال الاستشارة الهاتفية';
          message = `تم اكتمال الاستشارة الهاتفية رقم ${consultation.consultationNumber}`;
          break;
      }

      const notification = await Notification.create({
        title,
        message,
        type: 'consultation',
        priority: consultation.priority === 'emergency' ? 'urgent' : 'medium',
        recipients: 'specific',
        specificCustomers: [consultation.customer._id],
        channels: ['app', 'whatsapp'],
        relatedEntity: {
          entityType: 'consultation',
          entityId: consultation._id
        },
        createdBy: consultation.createdBy
      });

      // Send WhatsApp notification
      if (type === 'scheduled') {
        await whatsappService.sendConsultationNotification(consultation);
      }

      return notification;
    } catch (error) {
      console.error('Consultation notification error:', error);
      throw error;
    }
  }

  async sendOfferNotification(offer, targetCustomers = []) {
    try {
      const notification = await Notification.create({
        title: `عرض جديد: ${offer.title}`,
        message: offer.description,
        type: 'offer',
        priority: 'medium',
        recipients: targetCustomers.length > 0 ? 'specific' : 'customers',
        specificCustomers: targetCustomers,
        channels: ['app', 'whatsapp'],
        relatedEntity: {
          entityType: 'offer',
          entityId: offer._id
        },
        createdBy: offer.createdBy
      });

      return notification;
    } catch (error) {
      console.error('Offer notification error:', error);
      throw error;
    }
  }

  async sendSystemNotification(title, message, recipients = 'all', priority = 'medium', createdBy) {
    try {
      const notification = await Notification.create({
        title,
        message,
        type: 'system',
        priority,
        recipients,
        channels: ['app'],
        createdBy
      });

      return notification;
    } catch (error) {
      console.error('System notification error:', error);
      throw error;
    }
  }

  async scheduleReminders() {
    try {
      // Get tomorrow's bookings for reminders
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const endOfTomorrow = new Date(tomorrow);
      endOfTomorrow.setHours(23, 59, 59, 999);

      const Booking = require('../models/Booking');
      const tomorrowBookings = await Booking.find({
        appointmentDate: {
          $gte: tomorrow,
          $lte: endOfTomorrow
        },
        status: 'confirmed'
      }).populate('customer branch');

      // Send reminder notifications
      for (const booking of tomorrowBookings) {
        await this.sendBookingNotification(booking, 'reminder');
      }

      console.log(`📅 Sent ${tomorrowBookings.length} booking reminders for tomorrow`);

      // Get today's consultations for reminders
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endOfToday = new Date(today);
      endOfToday.setHours(23, 59, 59, 999);

      const Consultation = require('../models/Consultation');
      const todayConsultations = await Consultation.find({
        scheduledDate: {
          $gte: today,
          $lte: endOfToday
        },
        status: 'scheduled'
      }).populate('customer doctor');

      // Send consultation reminders
      for (const consultation of todayConsultations) {
        await this.sendConsultationNotification(consultation, 'reminder');
      }

      console.log(`📞 Sent ${todayConsultations.length} consultation reminders for today`);

    } catch (error) {
      console.error('Reminder scheduling error:', error);
    }
  }
}

module.exports = new NotificationService();