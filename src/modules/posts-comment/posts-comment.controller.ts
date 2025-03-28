import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorator/user.decorator';
import { User } from '../user/entities/user.entity';
import { PostsService } from '../posts/posts.service';
import { ErrorMessage } from 'src/common/error-message';
import { NotificationService } from '../notification/notification.service';
import { PostsCommentService } from './posts-comment.service';
import { UsersService } from '../user/user.service';
import { CreatePostCommentDto } from './dtos/create-comment.dto';

@ApiTags('Posts-Comments')
@Controller({
  version: '1',
  path: 'post-comment',
})
export class PostsCommentController {
  constructor(
    private readonly repo: PostsCommentService,
    private readonly postsService: PostsService,
    private readonly notiService: NotificationService,
    private readonly userService: UsersService,
  ) {}

  @ApiBearerAuth()
  @Post('')
  @ApiOperation({ summary: 'Like post' })
  async createOne(
    @CurrentUser() user: User,
    @Body() dto: CreatePostCommentDto,
  ) {
    const [posts, parentComment] = await Promise.all([
      this.postsService.getOne({
        filter: [{ field: 'id', operator: 'eq', value: dto.post_id }],
      }),
      dto.replied_user_id
        ? this.repo.getOne({
            filter: [
              {
                field: 'id',
                operator: 'eq',
                value: dto.replied_user_id,
              },
            ],
          })
        : null,
    ]);

    const comment = await this.repo.createOne({
      content: dto.content,
      posts,
      user,
      parent: parentComment,
    });
    await this.notiService.sendPushNotification(
      posts.user.token_device,
      'new notification',
      `${user.username} just post new comment in your post`,
    );
    if (dto.replied_user_id) {
      await this.notiService.sendPushNotification(
        parentComment.user.token_device,
        'new notification',
        `${user.username} just replied you comment`,
      );
    }
    return comment;
  }
}
