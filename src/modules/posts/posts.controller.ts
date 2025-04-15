import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorator/user.decorator';
import { User } from '../user/entities/user.entity';
import { PostsService } from './posts.service';
import { UserFollowService } from '../user-follow/user-follow.service';
import { PostsIdDto } from './dtos/post.param.dto';
import { UploadService } from '../upload/upload.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreatePostDto } from './dtos/create-post.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CrudRequest, ParsedRequest } from '@dataui/crud';
import { Public } from 'src/common/decorator/public.decorator';
import { PostsLikeService } from '../posts-like/posts-like.service';
import { NotificationService } from '../notification/notification.service';
import { UpdatePostDto } from './dtos/update-post.dto';
import { EReact } from 'src/common/types/data-type';
import { PostsShareService } from '../posts-share/posts-share.service';
import { UserIdDto } from '../user-follow/dtos/paramUserId.dto';
import { UsersService } from '../user/user.service';

@ApiTags('Posts')
@Controller({
  version: '1',
  path: 'posts',
})
export class PostsController {
  constructor(
    private readonly repo: PostsService,
    private readonly userFollowService: UserFollowService,
    private readonly uploadService: UploadService,
    private readonly postsLikeService: PostsLikeService,
    private readonly postsShareService: PostsShareService,
    private readonly notiService: NotificationService,
    private readonly userService: UsersService,
  ) {}

  @ApiBearerAuth()
  @Post('')
  @ApiOperation({ summary: 'Create a new post with multiple images' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreatePostDto })
  @UseInterceptors(
    FilesInterceptor('files', 15, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, uniqueSuffix + extname(file.originalname));
        },
      }),
    }),
  )
  async createOne(
    @CurrentUser() user: User,
    @Body() createPostDto: CreatePostDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const { urls } = await this.uploadService.uploadMultipleFiles(files);
    delete createPostDto.files;
    const data = await this.repo.createOne({
      ...createPostDto,
      imageUrl: urls,
      user,
    });
    const userFollow = await this.userFollowService.getAllFollower(user.id);

    for (const userData of userFollow) {
      const dataNoti = {
        username: user.username,
        userId: user.id,
        postId: data.id,
        postTitle: data.title,
        avatarUrl: user.profile_picture,
        content: `${user.username} vừa đăng bài viết mới!!`,
      };
      await this.notiService.sendPushNotification(
        userData.follower.token_device,
        `📢 Thông báo mới`,
        dataNoti,
        userData.follower,
      );
    }
    return data;
  }

  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'delete a post' })
  async unfollowUser(@CurrentUser() user: User, @Param() param: PostsIdDto) {
    return this.repo.hardDeleteOne({
      filter: [
        {
          field: 'id',
          operator: 'eq',
          value: param.id,
        },
      ],
    });
  }

  @ApiBearerAuth()
  @Get('/current-user')
  @ApiOperation({ summary: 'get list posts by current user' })
  async getAllPost(@CurrentUser() user: User) {
    return this.repo.getListPostByCurrentUser(user);
  }

  @Public()
  @Get('/user/:id')
  @ApiOperation({ summary: 'get list posts by user' })
  async getListPostByUserId(@Param() param: UserIdDto) {
    const user = await this.userService.getOne({
      filter: [
        {
          field: 'id',
          operator: 'eq',
          value: param.id,
        },
      ],
    });
    return this.repo.getListPostByCurrentUser(user);
  }

  @ApiBearerAuth()
  @Get('')
  @ApiOperation({ summary: 'get list posts' })
  async getAll(@CurrentUser() user: User) {
    return this.repo.getListPost(user);
  }

  @ApiBearerAuth()
  @Get(':id')
  @ApiOperation({ summary: 'get one post' })
  async getOne(@Param() param: PostsIdDto, @CurrentUser() user: User) {
    return this.repo.getOnePost(user, param.id);
  }

  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ summary: 'Update a post with multiple images' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdatePostDto })
  @UseInterceptors(
    FilesInterceptor('files', 15, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, uniqueSuffix + extname(file.originalname));
        },
      }),
    }),
  )
  async updateOne(
    @Param('id') postId: number,
    @CurrentUser() user: User,
    @Body() updatePostDto: UpdatePostDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const { urls } = await this.uploadService.uploadMultipleFiles(files);

    const updatedPost = await this.repo.updateOne(
      {
        filter: [
          {
            field: 'id',
            operator: 'eq',
            value: postId,
          },
        ],
      },
      {
        ...updatePostDto,
        imageUrl: urls,
      },
    );

    return updatedPost;
  }
}
