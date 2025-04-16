import { BadRequestException, Controller, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorator/user.decorator';
import { User } from '../user/entities/user.entity';

import { EReact, ETypeNoti } from 'src/common/types/data-type';

import { PostsService } from '../posts/posts.service';
import { ErrorMessage } from 'src/common/error-message';
import { NotificationService } from '../notification/notification.service';
import { PostsShareService } from './posts-share.service';
import { ParamIdPostsDto } from './dtos/paramId.dto';

@ApiTags('Posts-Share')
@Controller({
  version: '1',
  path: 'post-share',
})
export class PostsShareController {
  constructor(
    private readonly repo: PostsShareService,
    private readonly postsService: PostsService,
    private readonly notiService: NotificationService,
  ) {}

  @ApiBearerAuth()
  @Post('share/:id')
  @ApiOperation({ summary: 'Like post' })
  async sharePosts(@CurrentUser() user: User, @Param() param: ParamIdPostsDto) {
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

      await this.repo.createOne({
        user_id: user.id,
        posts,
      });
      if (posts.user.id !== user.id) {
        const data = {
          username: user.username,
          userId: user.id,
          postId: posts.id,
          postTitle: posts.title,
          avatarUrl: user.profile_picture,
          content: `${user.username} đã chia sẻ bài viết của bạn!!!`,
          type: ETypeNoti.share,
        };
        await this.notiService.sendPushNotification(
          posts.user.token_device,
          `📢 Thông báo mới`,
          data,
          posts.user,
        );
      }

      return {
        message: 'You had shared this post!',
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException(ErrorMessage.Post.cannotLikeThisPost);
    }
  }
}
