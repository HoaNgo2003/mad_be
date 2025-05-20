import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Delete,
  Patch,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UsersService } from './user.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UploadService } from '../upload/upload.service';
import { CurrentUser } from 'src/common/decorator/user.decorator';
import { UserFollowService } from '../user-follow/user-follow.service';

@ApiTags('User')
@Controller({
  version: '1',
  path: 'user',
})
export class UserController {
  constructor(
    private readonly service: UsersService,
    private readonly uploadService: UploadService,
    private readonly userFollowService: UserFollowService,
  ) {}

  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Get current user' })
  @ApiResponse({
    status: 200,
    description: 'Get current user login',
    type: [User],
  })
  async getMe(@CurrentUser() user): Promise<any> {
    return this.service.getCurrentUser(user.id);
  }

  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of users', type: [User] })
  async findAll(): Promise<any> {
    return this.service.getMany({
      filter: [],
      limit: 10,
    });
  }

  @ApiBearerAuth()
  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'Tìm thấy người dùng', type: User })
  @ApiResponse({ status: 404, description: 'Ngưởi dùng không tồn tại' })
  async findOne(@Param('id') id: string): Promise<any> {
    const [followingCount, followerCount] = await Promise.all([
      this.userFollowService.countFollowing(id),
      this.userFollowService.countFollower(id),
    ]);
    const user = await this.service.getOne({
      filter: [
        {
          field: 'id',
          operator: 'eq',
          value: id,
        },
      ],
    });
    return {
      ...user,
      followingCount,
      followerCount,
    };
  }

  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created', type: User })
  async create(@Body() dto: CreateUserDto): Promise<User> {
    return this.service.createOne(dto);
  }

  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: 200, description: 'User deleted' })
  @ApiResponse({ status: 404, description: 'Người dùng không tồn tại' })
  async remove(@Param('id') id: string): Promise<any> {
    return this.service.softDeleteOne({
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
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({ status: 200, description: 'User updated' })
  @ApiResponse({ status: 404, description: 'Người dùng không tồn tại' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string', example: 'JohnDoe' },
        full_name: { type: 'string', example: 'JohnDoe' },
        birth_day: { type: 'string', example: 'JohnDoe' },
        gender: { type: 'string', example: 'JohnDoe' },
        email: { type: 'string', example: 'johndoe@example.com' },
        file: {
          type: 'string',
          format: 'binary',
          description: 'Profile picture file (optional)',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
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
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<any> {
    if (file) {
      const { url } = await this.uploadService.uploadFile(file);
      dto.profile_picture = url;
    }
    return this.service.updateOne(
      {
        filter: [{ field: 'id', operator: 'eq', value: id }],
      },
      dto,
    );
  }
}
