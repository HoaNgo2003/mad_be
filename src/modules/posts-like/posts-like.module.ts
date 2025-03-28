import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsLike } from './entities/posts-like.entity';
import { PostsLikeService } from './posts-like.service';
import { PostsModule } from '../posts/posts.module';
import { IsPostExistContraints } from 'src/common/validators/post.validate';
import { IsPostsLikeExistContraints } from 'src/common/validators/post-like.validate';
import { PostsLikeController } from './posts-like.controller';
import { NotificationModule } from '../notification/notification.module';
const validateConstraint = [IsPostExistContraints, IsPostsLikeExistContraints];
@Module({
  imports: [
    TypeOrmModule.forFeature([PostsLike]),
    PostsModule,
    NotificationModule,
  ],
  exports: [PostsLikeService],
  controllers: [PostsLikeController],
  providers: [PostsLikeService, ...validateConstraint],
})
export class PostsLikeModule {}
