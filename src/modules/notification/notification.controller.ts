import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { Public } from 'src/common/decorator/public.decorator';
import { SendNotificationDto } from './dtos/create-noti.dto';

@ApiTags('Expo Notifications')
@Controller('expo')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Public()
  @Post('send-notification')
  @ApiOperation({ summary: 'Send push notification using Expo' })
  @ApiResponse({ status: 200, description: 'Notification sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  async sendNotification(@Body() data: SendNotificationDto) {
    console.log('📡 Sending Expo push notification to:', data.token);
    return this.notificationService.sendPushNotification(data.token, data.title, data.body);
  }
}
