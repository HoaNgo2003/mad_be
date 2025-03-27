import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsComment } from './entities/posts-comment.entity';
import { PostsCommentService } from './posts-comment.service';
const validateConstraint = [];
@Module({
  imports: [TypeOrmModule.forFeature([PostsComment])],
  exports: [PostsCommentService],
  controllers: [],
  providers: [PostsCommentService, ...validateConstraint],
})
export class PostsCommentModule {}
