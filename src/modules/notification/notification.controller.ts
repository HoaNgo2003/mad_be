import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { Public } from 'src/common/decorator/public.decorator';
import { SendNotificationDto } from './dtos/create-noti.dto';

@ApiTags('Firebase Notifications') // Groups endpoints under this tag in Swagger
@Controller('firebase')
export class NotificationController {
  constructor(private readonly firebaseService: NotificationService) {}

  @Public()
  @Post('send-notification')
  @ApiOperation({ summary: 'Send push notification' }) // Describes the endpoint
  @ApiResponse({ status: 200, description: 'Notification sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  // @ApiBody({ type: SendNotificationDto }) // Defines the request body schema
  async sendNotification(@Body() data: SendNotificationDto) {
    return this.firebaseService.sendPushNotification(
      data.token,
      data.title,
      data.body,
    );
  }
}
