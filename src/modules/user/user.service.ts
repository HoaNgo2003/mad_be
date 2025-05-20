import { Injectable } from '@nestjs/common';
import { BaseMySqlService } from 'src/common/services/base-mysql.service';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserFollowService } from '../user-follow/user-follow.service';

@Injectable()
export class UsersService extends BaseMySqlService<User> {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
    private readonly userFollowService: UserFollowService,
  ) {
    super(repo);
  }

  async getCurrentUser(id: string): Promise<any> {
    const [followingCount, followerCount] = await Promise.all([
      this.userFollowService.countFollowing(id),
      this.userFollowService.countFollower(id),
    ]);
    const user = await this.repo.findOne({
      where: { id },
    });

    if (!user) {
      throw new Error('Người dùng không tồn tại');
    }

    return {
      ...user,
      followingCount,
      followerCount,
    };
  }
}
