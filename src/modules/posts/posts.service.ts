import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseMySqlService } from 'src/common/services/base-mysql.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Posts } from './entities/posts.entity';
import { User } from '../user/entities/user.entity';
import { PostsLikeService } from '../posts-like/posts-like.service';
import { EReact } from 'src/common/types/data-type';
import { filter } from 'rxjs';
import { PostsShareService } from '../posts-share/posts-share.service';
import { PostsCommentService } from '../posts-comment/posts-comment.service';

@Injectable()
export class PostsService extends BaseMySqlService<Posts> {
  constructor(
    @InjectRepository(Posts)
    private readonly repo: Repository<Posts>,
    private readonly postLikeService: PostsLikeService,
    private readonly postShareService: PostsShareService,
    private readonly postCommentService: PostsCommentService,
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

  async getListPost(user: User) {
    const postsData = await this.repo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('post.posts_like', 'posts_like')
      .leftJoinAndSelect('post.comments', 'comments')
      .leftJoinAndSelect('comments.user', 'commentUser')
      .leftJoinAndSelect('comments.replies', 'replies')
      .leftJoinAndSelect('replies.user', 'replyUser')
      .getMany();

    const enrichedPosts = await Promise.all(
      postsData.map(async (post) => {
        const isLike = post.posts_like.some(
          (like) => like.user_id === user.id && like.type === EReact.like,
        );
        const isDislike = post.posts_like.some(
          (like) => like.user_id === user.id && like.type === EReact.dislike,
        );

        const [like, dislike, share] = await Promise.all([
          this.postLikeService.countPostLike(post.id),
          this.postLikeService.countPostDislike(post.id),
          this.postShareService.countSharePost(post.id),
        ]);

        const commentData = await this.postCommentService.getCommentsByPostId(
          post.id,
        );
        return {
          ...post,
          is_like: isLike,
          is_dislike: isDislike,
          posts_like: like,
          posts_dislike: dislike,
          posts_share: share,
          comments: commentData,
          comments_count: post.comments.length,
        };
      }),
    );

    return enrichedPosts;
  }

  async getOnePost(user: User, postId: string) {
    const post = await this.repo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('post.posts_like', 'posts_like')
      .leftJoinAndSelect('post.comments', 'comments')
      .leftJoinAndSelect('comments.user', 'commentUser')
      .leftJoinAndSelect('comments.replies', 'replies')
      .leftJoinAndSelect('replies.user', 'replyUser')
      .where('post.id = :postId', { postId })
      .getOne();

    if (!post) {
      throw new NotFoundException('Bài viết không tồn tại ');
    }

    const isLike = post.posts_like.some(
      (like) => like.user_id === user.id && like.type === EReact.like,
    );

    const isDislike = post.posts_like.some(
      (like) => like.user_id === user.id && like.type === EReact.dislike,
    );

    const [like, dislike, share] = await Promise.all([
      this.postLikeService.countPostLike(post.id),
      this.postLikeService.countPostDislike(post.id),
      this.postShareService.countSharePost(post.id),
    ]);

    const comments = await this.postCommentService.getCommentsByPostId(post.id);

    return {
      ...post,
      is_like: isLike,
      is_dislike: isDislike,
      posts_like: like,
      posts_dislike: dislike,
      posts_share: share,
      comments,
      comments_count: post.comments.length,
    };
  }
}
