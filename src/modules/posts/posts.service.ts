import { Injectable } from '@nestjs/common';
import { BaseMySqlService } from 'src/common/services/base-mysql.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Posts } from './entities/posts.entity';

@Injectable()
export class PostsService extends BaseMySqlService<Posts> {
  constructor(
    @InjectRepository(Posts)
    private readonly repo: Repository<Posts>,
  ) {
    super(repo);
  }
}
