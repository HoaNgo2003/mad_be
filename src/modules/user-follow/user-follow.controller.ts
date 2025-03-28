import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorator/user.decorator';
import { User } from '../user/entities/user.entity';
import { UserFollowService } from './user-follow.service';
import { UsersService } from '../user/user.service';
import { UserIdDto } from './dtos/paramUserId.dto';

@ApiTags('Follow')
@Controller({
  version: '1',
  path: 'follow',
})
export class UserFollowController {
  constructor(
    private readonly repo: UserFollowService,
    private readonly usersService: UsersService,
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
    return this.repo.createOne({
      follower: user,
      following: following,
    });
  }

  @ApiBearerAuth()
  @Delete('unfollow/:id')
  @ApiOperation({ summary: 'unfollow other user' })
  async unfollowUser(@CurrentUser() user: User) {
    return this.repo.unFollow(user.id);
  }

  @ApiBearerAuth()
  @Get('')
  @ApiOperation({ summary: 'get list user following' })
  async getAllUserFollowing(@CurrentUser() user: User) {
    return this.repo.getAllFollowing(user.id);
  }

  @ApiBearerAuth()
  @Get('follwer')
  @ApiOperation({ summary: 'get list who are following mysefl' })
  async getAllUserFollower(@CurrentUser() user: User) {
    return this.repo.getAllFollower(user.id);
  }
}
