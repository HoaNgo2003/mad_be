import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import * as cron from 'node-cron';
import { BaseMySqlService } from 'src/common/services/base-mysql.service';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { User } from '../user/entities/user.entity';
import { ScheduleTask } from '../schedules/entities/schedule-task.entity';
import { CronJob } from 'cron';
import { SchedulerRegistry } from '@nestjs/schedule';

@Injectable()
export class NotificationService extends BaseMySqlService<Notification> {
  private readonly expo: Expo;
  private token: string | null = null;
  private isScheduled = false;
  constructor(
    @InjectRepository(Notification)
    private readonly repo: Repository<Notification>,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {
    super(repo);
    this.expo = new Expo();
  }

  // scheduleTaskNotification(
  //   task: ScheduleTask,
  //   token_device: string,
  //   user: User,
  // ) {
  //   const job = new CronJob(task.scheduled_at, async () => {
  //     await this.sendPushNotification(
  //       token_device,
  //       task.task_name,
  //       task.notes,
  //       user,
  //     );
  //   });

  //   const jobName = `task-notify-${task.id}`;
  //   this.schedulerRegistry.addCronJob(jobName, job as any);
  //   job.start();
  // }

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
    },
    user: User,
  ) {
    if (!Expo.isExpoPushToken(token)) {
      console.error(' Invalid Expo push token:', token);
      return;
    }

    this.token = token;
    console.log(' Sending notification now...');

    const message: ExpoPushMessage = {
      to: token,
      sound: 'default',
      title,
      body: body.content,
    };

    try {
      const receipts: ExpoPushTicket[] =
        await this.expo.sendPushNotificationsAsync([message]);
      const notiDto = {
        title,
        body: JSON.stringify(body),
        token,
        user,
      };
      await this.createOne(notiDto);
      return { success: true, response: receipts };
    } catch (error) {
      console.error(' Error sending Expo push notification:', error);
      return { success: false, error: error.message };
    }
  }

  async markNotificationAsRead(notificationId: string) {
    return this.updateOne(
      {
        filter: [
          {
            field: 'id',
            operator: 'eq',
            value: notificationId
          }
        ]
      },
      {
        seen: true,
        updatedAt: new Date()
      }
    );
  }

  // private scheduleNotifications() {
  //   if (!this.token || this.isScheduled) return;

  //   this.isScheduled = true;
  //   const now = new Date();
  //   now.setMinutes(now.getMinutes() + 2);

  //   const minute = now.getMinutes();
  //   const hour = now.getHours();

  //   const scheduleTime = `${minute} ${hour} * * *`;

  //   cron.schedule(scheduleTime, async () => {
  //     if (this.token) {
  //       await this.sendPushNotification(
  //         this.token,
  //         ' Reminder!',
  //         'This notification was scheduled 5 minutes ago!',
  //         new User(),
  //       );
  //     }
  //   });
  // }
}
