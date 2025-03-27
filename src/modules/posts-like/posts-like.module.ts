import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsLike } from './entities/posts-like.entity';
import { PostsLikeService } from './posts-like.service';
import { PostsModule } from '../posts/posts.module';
import { IsPostExistContraints } from 'src/common/validators/post.validate';
import { IsPostsLikeExistContraints } from 'src/common/validators/post-like.validate';
const validateConstraint = [IsPostExistContraints, IsPostsLikeExistContraints];
@Module({
  imports: [TypeOrmModule.forFeature([PostsLike]), PostsModule],
  exports: [PostsLikeService],
  controllers: [],
  providers: [PostsLikeService, ...validateConstraint],
})
export class PostsLikeModule {}
