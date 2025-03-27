import { Injectable } from '@nestjs/common';
import { BaseMySqlService } from 'src/common/services/base-mysql.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostsLike } from './entities/posts-like.entity';

@Injectable()
export class PostsLikeService extends BaseMySqlService<PostsLike> {
  constructor(
    @InjectRepository(PostsLike)
    private readonly repo: Repository<PostsLike>,
  ) {
    super(repo);
  }
}
