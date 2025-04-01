import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { CreateUserPlantDto } from './dtos/plant-user.dto';
import { UserPlantService } from './plant-user.service';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@Controller({
  version: '1',
  path: 'user-plants',
})
export class UserPlantController {
  constructor(private readonly service: UserPlantService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a plant to a user' })
  @Post()
  async create(@Body() dto: CreateUserPlantDto) {
    return this.service.create(dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all plants of a user' })
  @Get()
  async getByUser(@Query('userId') userId: string) {
    return this.service.getPlantsByUser(userId);
  }
}
