import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsComment } from './entities/posts-comment.entity';
import { PostsCommentService } from './posts-comment.service';
import { UsersModule } from '../user/user.module';
import { NotificationModule } from '../notification/notification.module';
import { PostsModule } from '../posts/posts.module';
const validateConstraint = [];
@Module({
  imports: [
    TypeOrmModule.forFeature([PostsComment]),
    UsersModule,
    NotificationModule,
    PostsModule,
  ],
  exports: [PostsCommentService],
  controllers: [],
  providers: [PostsCommentService, ...validateConstraint],
})
export class PostsCommentModule {}
