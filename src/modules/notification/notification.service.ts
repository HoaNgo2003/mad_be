import { Injectable } from '@nestjs/common';
import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';

@Injectable()
export class NotificationService {
  private expo: Expo;

  constructor() {
    this.expo = new Expo();
  }

  async sendPushNotification(token: string, title: string, body: string) {
    if (!Expo.isExpoPushToken(token)) {
      console.error('❌ Invalid Expo push token:', token);
      return { success: false, error: 'Invalid Expo push token' };
    }

    const message: ExpoPushMessage = {
      to: token,
      sound: 'default',
      title,
      body,
    };

    try {
      const receipts: ExpoPushTicket[] = await this.expo.sendPushNotificationsAsync([message]);
      console.log('✅ Notification sent:', receipts);
      return { success: true, response: receipts };
    } catch (error) {
      console.error('❌ Error sending Expo push notification:', error);
      return { success: false, error: error.message };
    }
  }
}
