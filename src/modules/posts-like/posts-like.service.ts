import { Injectable } from '@nestjs/common';
import { BaseMySqlService } from 'src/common/services/base-mysql.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostsLike } from './entities/posts-like.entity';
import { EReact } from 'src/common/types/data-type';

@Injectable()
export class PostsLikeService extends BaseMySqlService<PostsLike> {
  constructor(
    @InjectRepository(PostsLike)
    private readonly repo: Repository<PostsLike>,
  ) {
    super(repo);
  }

  async countPostLike(id: string) {
    const data = await this.repo.find({
      where: {
        posts: {
          id,
        },
        type: EReact.like,
      },
    });
    return data.length;
  }

  async countPostDislike(id: string) {
    const data = await this.repo.find({
      where: {
        posts: {
          id,
        },
        type: EReact.dislike,
      },
    });
    return data.length;
  }
}
