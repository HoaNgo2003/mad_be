import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorator/user.decorator';
import { User } from '../user/entities/user.entity';
import { PostsLikeService } from './posts-like.service';
import { EReact, ETypeNoti } from 'src/common/types/data-type';
import { ParamIdPostsDto } from './dtos/paramId.dto';
import { PostsService } from '../posts/posts.service';
import { ErrorMessage } from 'src/common/error-message';
import { NotificationService } from '../notification/notification.service';

@ApiTags('Posts-Like')
@Controller({
  version: '1',
  path: 'post-like',
})
export class PostsLikeController {
  constructor(
    private readonly repo: PostsLikeService,
    private readonly postsService: PostsService,
    private readonly notiService: NotificationService,
  ) {}

  @ApiBearerAuth()
  @Post('like-or-dislike/:id')
  @ApiOperation({ summary: 'Like post' })
  async likePosts(@CurrentUser() user: User, @Param() param: ParamIdPostsDto) {
    try {
      const posts = await this.postsService.getOne({
        filter: [
          {
            field: 'id',
            operator: 'eq',
            value: param.id,
          },
        ],
      });

      const isLike = posts.posts_like.some(
        (like) => like.user_id == user.id && like.type == EReact.like,
      );
      if (isLike) {
        await this.repo.hardDeleteOne({
          filter: [
            {
              field: 'posts.id',
              operator: 'eq',
              value: posts.id,
            },
            {
              field: 'user_id',
              operator: 'eq',
              value: user.id,
            },
          ],
        });
        await this.postsService.updateOne(
          {
            filter: [
              {
                field: 'id',
                operator: 'eq',
                value: posts.id,
              },
            ],
          },
          {
            ranking: posts.ranking - 1,
          },
        );
        return {
          message: 'You had unliked this post!',
        };
      }
      await this.postsService.updateOne(
        {
          filter: [
            {
              field: 'id',
              operator: 'eq',
              value: posts.id,
            },
          ],
        },
        {
          ranking: posts.ranking + 1,
        },
      );
      await this.repo.createOne({
        user_id: user.id,
        type: EReact.like,
        posts,
      });
      const data = {
        username: user.username,
        postId: posts.id,
        postTitle: posts.title,
        userId: user.id,
        avatarUrl: user.profile_picture,
        content: `${user.username} đã thích bài viết của bạn`,
        type: ETypeNoti.like,
      };
      if (user.id !== posts.user.id) {
        await this.notiService.sendPushNotification(
          posts.user.token_device,
          `📢 Thông báo mới`,
          data,
          posts.user,
        );
      }
      return {
        message: 'You had liked this post!',
      };
    } catch (error) {
      throw new BadRequestException(ErrorMessage.Post.cannotLikeThisPost);
    }
  }

  @ApiBearerAuth()
  @Get('check-like/:id')
  @ApiOperation({ summary: 'Check like post' })
  async checkLikePosts(
    @CurrentUser() user: User,
    @Param() param: ParamIdPostsDto,
  ) {
    return this.repo.checkLike(param.id, user.id);
  }
}
