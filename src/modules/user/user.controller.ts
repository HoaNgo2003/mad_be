import { Controller, Get, Post, Param, Body, Delete } from '@nestjs/common';
import { UsersService } from './user.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

@ApiTags('User')
@Controller({
  version: '1',
  path: 'user',
})
export class UserController {
  constructor(private readonly service: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of users', type: [User] })
  async findAll(): Promise<any> {
    return this.service.getMany({
      filter: [],
      limit: 10,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User found', type: User })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string): Promise<User> {
    return this.service.getOne({
      filter: [
        {
          field: 'id',
          operator: 'eq',
          value: id,
        },
      ],
    });
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created', type: User })
  async create(@Body() dto: CreateUserDto): Promise<User> {
    return this.service.createOne(dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: 200, description: 'User deleted' })
  @ApiResponse({ status: 404, description: 'User not found' })
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
}
