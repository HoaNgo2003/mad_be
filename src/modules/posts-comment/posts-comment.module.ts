import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsComment } from './entities/posts-comment.entity';
import { PostsCommentService } from './posts-comment.service';
import { UsersModule } from '../user/user.module';
import { NotificationModule } from '../notification/notification.module';
import { PostsModule } from '../posts/posts.module';
import { PostsCommentController } from './posts-comment.controller';
const validateConstraint = [];
@Module({
  imports: [
    TypeOrmModule.forFeature([PostsComment]),
    UsersModule,
    NotificationModule,
    forwardRef(() => PostsModule),
  ],
  exports: [PostsCommentService],
  controllers: [PostsCommentController],
  providers: [PostsCommentService, ...validateConstraint],
})
export class PostsCommentModule {}
