import { Injectable } from '@nestjs/common';
import { BaseMySqlService } from 'src/common/services/base-mysql.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Posts } from './entities/posts.entity';
import { User } from '../user/entities/user.entity';
import { PostsLikeService } from '../posts-like/posts-like.service';

@Injectable()
export class PostsService extends BaseMySqlService<Posts> {
  constructor(
    @InjectRepository(Posts)
    private readonly repo: Repository<Posts>,
    private readonly postLikeService: PostsLikeService,
  ) {
    super(repo);
  }
  async getListPostByUser(user: User) {
    let postsData = await this.repo.find({
      where: {
        user: {
          id: user.id,
        },
      },
    });
    const resPostDatas = await Promise.all(
      postsData.map(async (post) => {
        const like = await this.postLikeService.countPostLike(post.id);
        const dislike = await this.postLikeService.countPostDislike(post.id);
        return {
          ...post,
          posts_like: like,
          posts_dislike: dislike,
          comments: post.comments.length,
        };
      }),
    );
    return resPostDatas;
  }

  async getListPost() {
    let postsData = await this.repo.find({
      relations: ['user'],
    });
    const resPostDatas = await Promise.all(
      postsData.map(async (post) => {
        const like = await this.postLikeService.countPostLike(post.id);
        const dislike = await this.postLikeService.countPostDislike(post.id);
        return {
          ...post,
          posts_like: like,
          posts_dislike: dislike,
          comments: post.comments.length,
        };
      }),
    );
    return resPostDatas;
  }
}
