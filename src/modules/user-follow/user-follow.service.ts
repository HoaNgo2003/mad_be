import { Injectable } from '@nestjs/common';
import { BaseMySqlService } from 'src/common/services/base-mysql.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserFollow } from './entities/user-follow.entity';

@Injectable()
export class UserFollowService extends BaseMySqlService<UserFollow> {
  constructor(
    @InjectRepository(UserFollow)
    private readonly repo: Repository<UserFollow>,
  ) {
    super(repo);
  }
  async getAllFollowing(id: string) {
    return this.repo.find({
      where: {
        follower: {
          id,
        },
      },
      relations: ['following'],
    });
  }

  async getAllFollower(id: string): Promise<UserFollow[]> {
    return this.repo.find({
      where: {
        following: {
          id,
        },
      },
      relations: ['follower'],
    });
  }
  async unFollow(id: string) {
    return this.repo.delete({
      follower: {
        id,
      },
    });
  }
}
