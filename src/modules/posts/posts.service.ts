import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseMySqlService } from 'src/common/services/base-mysql.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Posts } from './entities/posts.entity';
import { User } from '../user/entities/user.entity';
import { PostsLikeService } from '../posts-like/posts-like.service';
import { EReact } from 'src/common/types/data-type';
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
  async getListPostByCurrentUser(user: User) {
    const postsData = await this.repo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('post.posts_like', 'posts_like')
      .leftJoinAndSelect('post.comments', 'comments')
      .leftJoinAndSelect('comments.user', 'commentUser')
      .leftJoinAndSelect('comments.replies', 'replies')
      .leftJoinAndSelect('replies.user', 'replyUser')
      .where('user.id = :userId', { userId: user.id })
      .getMany();

    return this.enrichPosts(postsData, user);
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

    return this.enrichPosts(postsData, user);
  }

  private async enrichPosts(posts: Posts[], user: User) {
    return Promise.all(
      posts.map(async (post) => {
        const isLike = post.posts_like.some(
          (like) => like.user_id === user.id && like.type === EReact.like,
        );

        const [like, share] = await Promise.all([
          this.postLikeService.countPostLike(post.id),
          this.postShareService.countSharePost(post.id),
        ]);

        const commentData = await this.postCommentService.getCommentsByPostId(
          post.id,
        );

        return {
          ...post,
          is_like: isLike,
          posts_like: like,
          posts_share: share,
          comments: commentData,
          comments_count: post.comments.length,
        };
      }),
    );
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
      (like) => like.user_id == user.id && like.type === EReact.like,
    );

    const [like, share] = await Promise.all([
      this.postLikeService.countPostLike(post.id),
      this.postShareService.countSharePost(post.id),
    ]);

    const comments = await this.postCommentService.getCommentsByPostId(post.id);

    return {
      ...post,
      is_like: isLike,
      posts_like: like,
      posts_share: share,
      comments,
      comments_count: post.comments.length,
    };
  }
}
