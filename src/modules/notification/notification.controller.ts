import { Controller, Post, Param, Get, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { CurrentUser } from 'src/common/decorator/user.decorator';
import { User } from '../user/entities/user.entity';

@ApiTags('Expo Notifications')
@Controller({
  version: '1',
  path: 'expo',
})
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @ApiBearerAuth()
  @Get('')
  @ApiOperation({ summary: 'Get all notification of current user' })
  async getAllNotification(@CurrentUser() user: User) {
    console.log(user);
    const data = await this.notificationService.getMany({
      filter: [
        {
          field: 'token',
          operator: 'eq',
          value: user.token_device,
        },
      ],
    });
    return data;
  }

  @ApiBearerAuth()
  @Get(':id')
  @ApiOperation({ summary: 'Get one notification' })
  async getOneNotification(@Param('id') id: string) {
    return this.notificationService.getOne({
      filter: [
        {
          field: 'id',
          operator: 'eq',
          value: id,
        },
      ],
    });
  }

  @ApiBearerAuth()
  @Post('seen-notification/:id')
  @ApiOperation({ summary: 'Seen notification' })
  async seenNotification(@Param('id') id: string) {
    return this.notificationService.updateOne(
      {
        filter: [
          {
            field: 'id',
            operator: 'eq',
            value: id,
          },
        ],
      },
      {
        seen: true,
      },
    );
  }

  @ApiBearerAuth()
  @Post('count-unseen-notification')
  @ApiOperation({ summary: 'Count unseen notification' })
  async countUnseenNotification(@CurrentUser() user: User) {
    const data = await this.notificationService.getMany({
      filter: [
        {
          field: 'seen',
          operator: 'eq',
          value: false,
        },
        {
          field: 'token',
          operator: 'eq',
          value: user.token_device,
        },
      ],
    });
    if (Array.isArray(data)) {
      return data.length;
    }
    return data.data?.length || 0;
  }

  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification' })
  async deleteNotification(@Param('id') id: string) {
    return this.notificationService.hardDeleteOne({
      filter: [
        {
          field: 'id',
          operator: 'eq',
          value: id,
        },
      ],
    });
  }

  @ApiBearerAuth()
  @Post('read-notification/:id')
  @ApiOperation({ summary: 'Seen notification' })
  async readNotification(@Param('id') id: string) {
    return this.notificationService.markNotificationAsRead(id);
  }
}
