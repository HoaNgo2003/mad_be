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

  async unFollow(folowerId: string, followingId: string) {
    return this.repo.delete({
      follower: {
        id: folowerId,
      },
      following: {
        id: followingId,
      },
    });
  }

  async countFollowing(id: string) {
    return this.repo.count({
      where: {
        follower: {
          id,
        },
      },
    });
  }

  async countFollower(id: string) {
    return this.repo.count({
      where: {
        following: {
          id,
        },
      },
    });
  }

  async checkFollow(followerId: string, followingId: string) {
    return this.repo.findOne({
      where: {
        follower: {
          id: followerId,
        },
        following: {
          id: followingId,
        },
      },
    });
  }
}
