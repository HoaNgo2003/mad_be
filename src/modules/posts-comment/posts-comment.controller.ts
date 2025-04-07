import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorator/user.decorator';
import { User } from '../user/entities/user.entity';
import { PostsService } from '../posts/posts.service';
import { NotificationService } from '../notification/notification.service';
import { PostsCommentService } from './posts-comment.service';
import { UsersService } from '../user/user.service';
import {
  CreatePostCommentDto,
  UpdatePostCommentDto,
} from './dtos/create-comment.dto';

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
  @ApiOperation({ summary: 'comment post' })
  async createOne(
    @CurrentUser() user: User,
    @Body() dto: CreatePostCommentDto,
  ) {
    const [posts, parentComment] = await Promise.all([
      this.postsService.getOne({
        filter: [{ field: 'id', operator: 'eq', value: dto.post_id }],
        join: [
          {
            field: 'user',
            select: ['token_device'],
          },
        ],
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
            join: [
              {
                field: 'user',
                select: ['token_device'],
              },
            ],
          })
        : null,
    ]);
    console.log('parentComment', parentComment);
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
      posts.user,
    );
    console.log('parentComment', parentComment);
    if (dto.replied_user_id) {
      await this.notiService.sendPushNotification(
        parentComment.user.token_device,
        'new notification',
        `${user.username} just replied you comment`,
        parentComment.user,
      );
    }
    return comment;
  }

  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'delete a comment' })
  async deleteOne(@Param('id') id: string) {
    return this.repo.hardDeleteOne({
      filter: [
        {
          field: 'id',
          operator: 'eq',
          value: id,
        },
      ],
    });
  }

  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ summary: 'update a comment' })
  async updateOne(@Param('id') id: string, @Body() dto: UpdatePostCommentDto) {
    return await this.repo.updateOne(
      {
        filter: [
          {
            field: 'id',
            operator: 'eq',
            value: id,
          },
        ],
      },
      {
        content: dto.content,
      },
    );
  }
}
