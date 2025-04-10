import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Posts } from './entities/posts.entity';
import { PostsService } from './posts.service';
import { UserFollowModule } from '../user-follow/user.follow.module';
import { IsPostExistContraints } from 'src/common/validators/post.validate';
import { UploadModule } from '../upload/upload.module';
import { PostsController } from './posts.controller';
import { PostsLikeModule } from '../posts-like/posts-like.module';
import { NotificationModule } from '../notification/notification.module';
import { PostsShareModule } from '../posts-share/posts-share.module';

import { PostsCommentModule } from '../posts-comment/posts-comment.module';
import { UsersModule } from '../user/user.module';
import { IsUserNotFoundContraints } from 'src/common/validators/user.validate';
const validateConstraint = [IsPostExistContraints, IsUserNotFoundContraints];
@Module({
  imports: [
    TypeOrmModule.forFeature([Posts]),
    forwardRef(() => UserFollowModule),
    forwardRef(() => UploadModule),
    forwardRef(() => PostsLikeModule),
    forwardRef(() => PostsShareModule),
    forwardRef(() => PostsCommentModule),
    NotificationModule,
    UsersModule,
  ],
  exports: [PostsService],
  controllers: [PostsController],
  providers: [PostsService, ...validateConstraint],
})
export class PostsModule {}
