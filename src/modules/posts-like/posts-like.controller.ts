import { BadRequestException, Controller, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorator/user.decorator';
import { User } from '../user/entities/user.entity';
import { PostsLikeService } from './posts-like.service';
import { EReact } from 'src/common/types/data-type';
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
  @Post('like/:id')
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
      await this.repo.createOne({
        user_id: user.id,
        type: EReact.like,
        posts,
      });

      await this.notiService.sendPushNotification(
        posts.user.token_device,
        `new notification`,
        '${user.username} just liked your post!!!',
      );
      return {
        message: 'You had liked this post!',
      };
    } catch (error) {
      throw new BadRequestException(ErrorMessage.Post.cannotLikeThisPost);
    }
  }

  @ApiBearerAuth()
  @Post('dislike/:id')
  @ApiOperation({ summary: 'Like post' })
  async dislikePosts(
    @CurrentUser() user: User,
    @Param() param: ParamIdPostsDto,
  ) {
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
        type: EReact.dislike,
        posts,
      });
      await this.notiService.sendPushNotification(
        posts.user.token_device,
        `new notification`,
        '${user.username} just disliked your post!!!',
      );
      return {
        message: 'You had disliked this post!',
      };
    } catch (error) {
      throw new BadRequestException(ErrorMessage.Post.cannotLikeThisPost);
    }
  }
}
