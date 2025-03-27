import { Injectable } from '@nestjs/common';
import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import * as cron from 'node-cron';

@Injectable()
export class NotificationService {
  private readonly expo: Expo;
  private token: string | null = null;
  private isScheduled = false; // Biến để kiểm tra đã lên lịch hay chưa

  constructor() {
    this.expo = new Expo();
  }

  async sendPushNotification(token: string, title: string, body: string) {
    if (!Expo.isExpoPushToken(token)) {
      console.error('❌ Invalid Expo push token:', token);
      return { success: false, error: 'Invalid Expo push token' };
    }

    this.token = token; // Lưu token
    console.log('📩 Sending notification now...');

    const message: ExpoPushMessage = {
      to: token,
      sound: 'default',
      title,
      body,
    };

    try {
      const receipts: ExpoPushTicket[] =
        await this.expo.sendPushNotificationsAsync([message]);
      console.log('✅ Notification sent:', receipts);

      // 🔹 Sau khi gửi noti lần đầu -> Lên lịch gửi sau 5 phút
      this.scheduleNotifications();

      return { success: true, response: receipts };
    } catch (error) {
      console.error('❌ Error sending Expo push notification:', error);
      return { success: false, error: error.message };
    }
  }

  private scheduleNotifications() {
    if (!this.token || this.isScheduled) return; // Tránh lên lịch nhiều lần

    this.isScheduled = true; // Đánh dấu đã lên lịch

    const now = new Date();
    now.setMinutes(now.getMinutes() + 2); // Thêm 5 phút

    const minute = now.getMinutes();
    const hour = now.getHours();

    const scheduleTime = `${minute} ${hour} * * *`; // Định dạng cron

    console.log(`🕒 Scheduling notification at ${hour}:${minute}`);

    cron.schedule(scheduleTime, async () => {
      console.log('⏰ Sending scheduled notification after 5 minutes');
      if (this.token) {
        await this.sendPushNotification(
          this.token,
          '⏰ Reminder!',
          'This notification was scheduled 5 minutes ago!',
        );
      }
    });
  }
}
