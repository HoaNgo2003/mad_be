import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseMySqlService } from 'src/common/services/base-mysql.service';
import { PostsComment } from './entities/posts-comment.entity';

@Injectable()
export class PostsCommentService extends BaseMySqlService<PostsComment> {
  constructor(
    @InjectRepository(PostsComment)
    private readonly commentRepo: Repository<PostsComment>,
  ) {
    super(commentRepo);
  }

  async createComment(
    content: string,
    userId: string,
    postId: string,
    parentId?: string,
  ): Promise<PostsComment> {
    console.log(postId, parentId, userId, content);
    const comment = this.createOne({
      content,
      user: { id: userId } as any,
      posts: { id: postId } as any,
      parent: parentId ? ({ id: parentId } as any) : null,
      depth: parentId ? (await this.getCommentDepth(parentId)) + 1 : 0,
    });

    return comment;
  }

  async getPostComments(postId: string): Promise<PostsComment[]> {
    return this.commentRepo.find({
      where: { posts: { id: postId }, parent: null },
      relations: ['user', 'replies', 'replies.user'],
      order: {
        createdAt: 'ASC',
        replies: {
          createdAt: 'ASC',
        },
      },
    });
  }

  async getCommentById(id: string): Promise<PostsComment> {
    const comment = await this.commentRepo.findOne({
      where: { id },
      relations: ['user', 'replies', 'replies.user'],
    });

    if (!comment) throw new NotFoundException(`Comment #${id} not found`);
    return comment;
  }

  async getCommentsByPostId(postId: string) {
    const comments = await this.commentRepo.find({
      where: { posts: { id: postId } },
      relations: ['user', 'parent', 'replies', 'replies.user'],
      order: {
        createdAt: 'ASC',
      },
    });

    const commentMap = new Map<string, any>();
    comments.forEach((comment) => {
      commentMap.set(comment.id, {
        id: comment.id,
        content: comment.content,
        user: comment.user,
        created_at: comment.createdAt,
        replies: [],
        parent_id: comment.parent?.id || null,
      });
    });

    const result: any[] = [];

    commentMap.forEach((comment) => {
      if (comment.parent_id) {
        const parent = commentMap.get(comment.parent_id);
        if (parent) {
          parent.replies.push(comment);
        }
      } else {
        result.push(comment);
      }
    });

    return result;
  }

  private async getCommentDepth(commentId: string): Promise<number> {
    const parent = await this.commentRepo.findOne({ where: { id: commentId } });
    return parent?.depth || 0;
  }
}
