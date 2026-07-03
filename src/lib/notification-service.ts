import type { Notification, NotificationType, NotificationSettings } from "@/types";

/**
 * Notification Service
 * Handles all notification logic
 * Currently mocked - ready to integrate with Twilio/WhatsApp
 */
export const NotificationService = {
  /**
   * Send booking confirmation
   */
  async sendConfirmation(
    phone: string,
    name: string,
    time: string,
    queuePosition: number
  ): Promise<Notification> {
    const message = `Hello ${name}! Your booking is confirmed for ${time}. You are position #${queuePosition} in the queue.`;
    return this.mockSend("confirmation", phone, message);
  },

  /**
   * Send reminder 10 minutes before turn
   */
  async sendReminder(
    phone: string,
    name: string,
    estimatedTime: string
  ): Promise<Notification> {
    const message = `Hi ${name}! You're up in 10 minutes. Please head to the shop. Estimated time: ${estimatedTime}`;
    return this.mockSend("reminder", phone, message);
  },

  /**
   * Notify customer when queue moved earlier
   */
  async sendQueueMovedEarlier(
    phone: string,
    name: string,
    newETA: string,
    minutesSaved: number
  ): Promise<Notification> {
    const message = `Good news ${name}! You're now #1. Estimated time: ${newETA} (${minutesSaved} min earlier).`;
    return this.mockSend("queue-moved", phone, message);
  },

  /**
   * Notify customer of delay
   */
  async sendDelayNotification(
    phone: string,
    name: string,
    extraMinutes: number,
    newETA: string
  ): Promise<Notification> {
    const message = `Hi ${name}, we're running ${extraMinutes} minutes behind. New ETA: ${newETA}. Thank you for your patience.`;
    return this.mockSend("queue-delayed", phone, message);
  },

  /**
   * Notify customer their booking was cancelled
   */
  async sendCancellation(
    phone: string,
    name: string,
    reason?: string
  ): Promise<Notification> {
    const reasonText = reason ? ` Reason: ${reason}.` : "";
    const message = `Hi ${name}, your booking has been cancelled.${reasonText} Please call us to reschedule.`;
    return this.mockSend("cancelled", phone, message);
  },

  /**
   * Notify customer they're ready
   */
  async sendReadyNotification(
    phone: string,
    name: string
  ): Promise<Notification> {
    const message = `Hi ${name}! You're ready. Please come to the shop now!`;
    return this.mockSend("ready", phone, message);
  },

  /**
   * Mock send - simulates sending
   * In production, integrate with Twilio or WhatsApp
   */
  async mockSend(
    type: NotificationType,
    phone: string,
    message: string
  ): Promise<Notification> {
    const notification: Notification = {
      id: Date.now().toString(),
      bookingId: "", // filled by caller
      customerPhone: phone,
      type,
      message,
      sent: true,
      sentAt: new Date(),
      method: "in-app",
      createdAt: new Date(),
    };

    // Log in production
    console.log(`[NOTIFICATION] ${type.toUpperCase()} to ${phone}: ${message}`);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    return notification;
  },

  /**
   * Schedule reminder for later
   * In production, use job queue (Bull, Agenda, etc.)
   */
  scheduleReminder(
    bookingId: string,
    phone: string,
    name: string,
    eta: string,
    delayMs: number
  ): void {
    setTimeout(() => {
      this.sendReminder(phone, name, eta);
    }, delayMs);
  },

  /**
   * Get notification settings (from database in production)
   */
  getDefaultSettings(): NotificationSettings {
    return {
      confirmationEnabled: true,
      reminderEnabled: true,
      reminderMinutesBefore: 10,
      delayNotificationEnabled: true,
      earlyNotificationEnabled: true,
      provider: "mock",
    };
  },
};
