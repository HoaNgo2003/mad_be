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
import { EReact } from 'src/common/types/data-type';
import { ParamIdPostsDto, ParamIdPostsLikeDto } from './dtos/paramId.dto';
import { PostsService } from '../posts/posts.service';
import { ErrorMessage } from 'src/common/error-message';

@ApiTags('User')
@Controller({
  version: '1',
  path: 'user',
})
export class UserController {
  constructor(
    private readonly repo: PostsLikeService,
    private readonly postsService: PostsService,
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
      return {
        message: 'You had disliked this post!',
      };
    } catch (error) {
      throw new BadRequestException(ErrorMessage.Post.cannotLikeThisPost);
    }
  }

  @ApiBearerAuth()
  @Get('dislike/:id')
  @ApiOperation({ summary: 'Like post' })
  async countDislikePosts(@Param() param: ParamIdPostsLikeDto) {
    try {
      const result = await this.repo.getMany({
        filter: [
          {
            field: 'id',
            operator: 'eq',
            value: param.id,
          },
          {
            field: 'type',
            operator: 'eq',
            value: EReact.dislike,
          },
        ],
      });

      if (Array.isArray(result)) {
        return {
          count: result.length,
        };
      } else {
        return {
          count: result.data.length,
        };
      }
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @ApiBearerAuth()
  @Get('like/:id')
  @ApiOperation({ summary: 'Like post' })
  async countLikePosts(@Param() param: ParamIdPostsLikeDto) {
    try {
      const result = await this.repo.getMany({
        filter: [
          {
            field: 'id',
            operator: 'eq',
            value: param.id,
          },
          {
            field: 'type',
            operator: 'eq',
            value: EReact.like,
          },
        ],
      });

      if (Array.isArray(result)) {
        return {
          count: result.length,
        };
      } else {
        return {
          count: result.data.length,
        };
      }
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
