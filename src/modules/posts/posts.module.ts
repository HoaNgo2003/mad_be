import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Posts } from './entities/posts.entity';
import { PostsService } from './posts.service';
const validateConstraint = [];
@Module({
  imports: [TypeOrmModule.forFeature([Posts])],
  exports: [PostsService],
  controllers: [],
  providers: [PostsService, ...validateConstraint],
})
export class PostsModule {}
