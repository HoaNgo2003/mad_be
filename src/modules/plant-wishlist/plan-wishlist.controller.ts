import {
  Controller,
  Post,
  Get,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PlantWishlistService } from './plan-wishlist.service';
import { CurrentUser } from 'src/common/decorator/user.decorator';
import { User } from '../user/entities/user.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Plant Wishlist')
@Controller({
  version: '1',
  path: 'wishlist',
})
export class PlantWishlistController {
  constructor(private readonly plantWishlistService: PlantWishlistService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('/add/:id')
  @ApiOperation({ summary: 'Add a plant to wishlist' })
  @HttpCode(HttpStatus.CREATED)
  async addToWishList(@CurrentUser() user: User, @Param('id') plantId: string) {
    return this.plantWishlistService.addToWishList(user, plantId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Get user wishlist' })
  @HttpCode(HttpStatus.OK)
  async getWishList(@CurrentUser() user: User) {
    return this.plantWishlistService.getMany({
      filter: [{ field: 'user.id', operator: 'eq', value: user.id }],
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('/remove/:id')
  @ApiOperation({ summary: 'Remove a plant from wishlist' })
  @HttpCode(HttpStatus.OK)
  async removeFromWishList(@Param('id') id: string) {
    return this.plantWishlistService.hardDeleteOne({
      filter: [{ field: 'id', operator: 'eq', value: id }],
    });
  }
}
