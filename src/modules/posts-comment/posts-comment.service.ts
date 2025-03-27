import { Injectable } from '@nestjs/common';
import { BaseMySqlService } from 'src/common/services/base-mysql.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostsComment } from './entities/posts-comment.entity';

@Injectable()
export class PostsCommentService extends BaseMySqlService<PostsComment> {
  constructor(
    @InjectRepository(PostsComment)
    private readonly repo: Repository<PostsComment>,
  ) {
    super(repo);
  }
}
