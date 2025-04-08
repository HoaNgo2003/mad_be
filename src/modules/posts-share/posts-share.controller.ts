import { BadRequestException, Controller, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorator/user.decorator';
import { User } from '../user/entities/user.entity';

import { EReact } from 'src/common/types/data-type';

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

      const isShare = posts.posts_share.some((like) => like.user_id == user.id);
      if (isShare) {
        return {
          message: 'You had shared this post!',
        };
      }

      await this.repo.createOne({
        user_id: user.id,
        posts,
      });
      console.log('posts', posts);
      await this.notiService.sendPushNotification(
        posts.user.token_device,
        `new notification`,
        '${user.username} just shared your post!!!',
        posts.user,
      );
      return {
        message: 'You had liked this post!',
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException(ErrorMessage.Post.cannotLikeThisPost);
    }
  }
}
