import {
  Controller,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorator/user.decorator';
import { User } from '../user/entities/user.entity';
import { PostsCommentService } from './posts-comment.service';
import { PostsService } from '../posts/posts.service';
import { NotificationService } from '../notification/notification.service';
import {
  CreatePostCommentDto,
  UpdatePostCommentDto,
} from './dtos/create-comment.dto';
import { ETypeNoti } from 'src/common/types/data-type';

@ApiTags('Posts-Comments')
@Controller({
  version: '1',
  path: 'post-comment',
})
export class PostsCommentController {
  constructor(
    private readonly commentService: PostsCommentService,
    private readonly postService: PostsService,
    private readonly notiService: NotificationService,
  ) {}

  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Create a new comment or reply' })
  async createComment(
    @CurrentUser() user: User,
    @Body() dto: CreatePostCommentDto,
  ) {
    const post = await this.postService.getOne({
      filter: [{ field: 'id', operator: 'eq', value: dto.post_id }],
      join: [{ field: 'user', select: ['token_device'] }],
    });

    if (!post) throw new BadRequestException('Post not found');

    const parentComment = dto.replied_user_id
      ? await this.commentService.getOne({
          filter: [{ field: 'id', operator: 'eq', value: dto.replied_user_id }],
          join: [{ field: 'user', select: ['token_device'] }],
        })
      : null;

    const newComment = await this.commentService.createComment(
      dto.content,
      user.id,
      dto.post_id,
      dto.replied_user_id,
    );
    if (post.user?.token_device && post.user.id !== user.id) {
      const data = {
        username: user.username,
        userId: user.id,
        postId: post.id,
        postTitle: post.title,
        avatarUrl: user.profile_picture,
        commentId: newComment.id,
        commentContent: newComment.content,
        content: `${user.username} đã bình luận vào bài viết của bạn.`,
        type: ETypeNoti.comment,
      };
      await this.notiService.sendPushNotification(
        post.user.token_device,
        '📢 Thông báo mới',
        data,
        post.user,
      );
    }

    if (
      parentComment?.user?.token_device &&
      parentComment.user.id !== user.id
    ) {
      const dataNoti = {
        username: user.username,
        userId: user.id,
        postId: post.id,
        postTitle: post.title,
        avatarUrl: user.profile_picture,
        commentId: newComment.id,
        commentContent: newComment.content,
        content: `${user.username} đã trả lời bình luận của bạn.`,
        type: ETypeNoti.comment,
      };
      await this.notiService.sendPushNotification(
        parentComment.user.token_device,
        '📢 Thông báo mới',
        dataNoti,
        parentComment.user,
      );
    }

    return newComment;
  }

  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ summary: 'Update a comment' })
  async updateComment(
    @Param('id') id: string,
    @Body() dto: UpdatePostCommentDto,
  ) {
    return this.commentService.updateOne(
      {
        filter: [{ field: 'id', operator: 'eq', value: id }],
      },
      { content: dto.content },
    );
  }

  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a comment permanently (hard delete)' })
  async deleteComment(@Param('id') id: string) {
    return this.commentService.hardDeleteOne({
      filter: [{ field: 'id', operator: 'eq', value: id }],
    });
  }
}
