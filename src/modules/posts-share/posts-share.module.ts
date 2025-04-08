import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModule } from '../posts/posts.module';
import { NotificationModule } from '../notification/notification.module';
import { PostsShare } from './entities/posts-share.entity';
import { PostsShareService } from './posts-share.service';
import { PostsShareController } from './posts-share.controller';
const validateConstraint = [];
@Module({
  imports: [
    TypeOrmModule.forFeature([PostsShare]),
    forwardRef(() => PostsModule),
    NotificationModule,
  ],
  exports: [PostsShareService],
  controllers: [PostsShareController],
  providers: [PostsShareService, ...validateConstraint],
})
export class PostsShareModule {}
