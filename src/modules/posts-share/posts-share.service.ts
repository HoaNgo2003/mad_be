import { Injectable } from '@nestjs/common';
import { BaseMySqlService } from 'src/common/services/base-mysql.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostsShare } from './entities/posts-share.entity';

@Injectable()
export class PostsShareService extends BaseMySqlService<PostsShare> {
  constructor(
    @InjectRepository(PostsShare)
    private readonly repo: Repository<PostsShare>,
  ) {
    super(repo);
  }
  async countSharePost(postId: string) {
    const count = await this.repo.countBy({ posts: { id: postId } });
    return count;
  }
}
