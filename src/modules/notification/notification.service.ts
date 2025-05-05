import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import { BaseMySqlService } from 'src/common/services/base-mysql.service';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { User } from '../user/entities/user.entity';
import { SchedulerRegistry } from '@nestjs/schedule';

@Injectable()
export class NotificationService extends BaseMySqlService<Notification> {
  private readonly expo: Expo;
  private token: string | null = null;
  constructor(
    @InjectRepository(Notification)
    private readonly repo: Repository<Notification>,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {
    super(repo);
    this.expo = new Expo();
  }

  async sendPushNotification(
    token: string,
    title: string,
    body: {
      username: string;
      userId: string;
      postId?: string;
      postTitle?: string;
      avatarUrl?: string;
      commentId?: string;
      commentContent?: string;
      content: string;
      type: string;
      type: string;
    },
    user: User,
  ) {
    this.token = token;

    const message: ExpoPushMessage = {
      to: token,
      sound: 'default',
      title,
      body: body.content,
    };
    const notiDto = {
      title,
      body: JSON.stringify(body),
      token,
      user,
    };
    await this.createOne({ ...notiDto, type: body.type });

    try {
      const receipts: ExpoPushTicket[] =
        await this.expo.sendPushNotificationsAsync([message]);
      return { success: true, response: receipts };
    } catch (error) {
      console.error(' Error sending Expo push notification:', error);
      return { success: false, error: error.message };
    }
  }
}
