import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorator/user.decorator';
import { User } from '../user/entities/user.entity';
import { UserFollowService } from './user-follow.service';
import { UsersService } from '../user/user.service';
import { UserIdDto } from './dtos/paramUserId.dto';
import { NotificationService } from '../notification/notification.service';
import { ETypeNoti } from 'src/common/types/data-type';

@ApiTags('Follow')
@Controller({
  version: '1',
  path: 'follow',
})
export class UserFollowController {
  constructor(
    private readonly repo: UserFollowService,
    private readonly usersService: UsersService,
    private readonly notiService: NotificationService,
  ) {}

  @ApiBearerAuth()
  @Post(':id')
  @ApiOperation({ summary: 'follow another user' })
  async followAnotherUser(
    @CurrentUser() user: User,
    @Param() param: UserIdDto,
  ) {
    const following = await this.usersService.getOne({
      filter: [
        {
          field: 'id',
          operator: 'eq',
          value: param.id,
        },
      ],
    });
    const checkFollow = await this.repo.checkFollow(user.id, following.id);
    if (checkFollow) {
      throw new BadRequestException('Bạn đã theo dõi người dùng này rồi!!!');
    }

    const data = await this.repo.createOne({
      follower: user,
      following: following,
    });
    const dataNoti = {
      username: user.username,
      userId: user.id,
      avatarUrl: user.profile_picture,
      content: `${user.username} mới theo dõi bạn!!!`,
      type: ETypeNoti.follow,
    };
    await this.notiService.sendPushNotification(
      following.token_device,
      `📢 Thông báo mới`,
      dataNoti,
      following,
    );
    return data;
  }

  @ApiBearerAuth()
  @Delete('unfollow/:id')
  @ApiOperation({ summary: 'unfollow other user' })
  async unfollowUser(@CurrentUser() user: User, @Param() param: UserIdDto) {
    const data = await this.repo.unFollow(user.id, param.id);
    await this.usersService.getOne({
      filter: [
        {
          field: 'id',
          operator: 'eq',
          value: user.id,
        },
      ],
    });

    return data;
  }

  @ApiBearerAuth()
  @Get('following/:id')
  @ApiOperation({ summary: 'Danh sách những người bản thân đang follow' })
  async getAllUserFollowing(@Param() param: UserIdDto) {
    const user = await this.usersService.getOne({
      filter: [
        {
          field: 'id',
          operator: 'eq',
          value: param.id,
        },
      ],
    });
    return this.repo.getAllFollowing(user.id);
  }

  @ApiBearerAuth()
  @Get('follwer/:id')
  @ApiOperation({ summary: 'Danh sách những người đang follow mình' })
  async getAllUserFollower(@Param() param: UserIdDto) {
    const user = await this.usersService.getOne({
      filter: [
        {
          field: 'id',
          operator: 'eq',
          value: param.id,
        },
      ],
    });
    return this.repo.getAllFollower(user.id);
  }

  @ApiBearerAuth()
  @Get('check-follow/:id')
  @ApiOperation({ summary: 'check follow' })
  async checkFollow(@CurrentUser() user: User, @Param() param: UserIdDto) {
    const following = await this.usersService.getOne({
      filter: [
        {
          field: 'id',
          operator: 'eq',
          value: param.id,
        },
      ],
    });
    const checkFollow = await this.repo.checkFollow(user.id, following.id);
    return !!checkFollow;
  }
}
