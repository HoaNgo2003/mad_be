import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorator/user.decorator';
import { User } from '../user/entities/user.entity';
import { PlantSearchHistoryService } from './plant-search-history.service';

@ApiTags('Search Plant History')
@Controller({
  version: '1',
  path: 'search-history',
})
export class PlantSearchHistoryController {
  constructor(
    private readonly plantSearchHistoryService: PlantSearchHistoryService,
  ) {}

  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: 'Get user search history' })
  @HttpCode(HttpStatus.OK)
  async getWishList(@CurrentUser() user: User) {
    return this.plantSearchHistoryService.getMany({
      filter: [{ field: 'user.id', operator: 'eq', value: user.id }],
    });
  }

  @ApiBearerAuth()
  @Get('daily-search')
  @ApiOperation({ summary: 'Get user search history' })
  @HttpCode(HttpStatus.OK)
  async getTop10Keyword(@CurrentUser() user: User) {
    return this.plantSearchHistoryService.getTopKeywordsByUser(user.id);
  }

  @ApiBearerAuth()
  @Get('top3')
  @ApiOperation({ summary: ' Get top 3 plant recently search' })
  @HttpCode(HttpStatus.OK)
  async getTop3Plant(@CurrentUser() user: User) {
    return this.plantSearchHistoryService.getRecentSearches(user.id);
  }
}
