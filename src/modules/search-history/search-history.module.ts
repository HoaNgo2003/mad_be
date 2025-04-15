import { Module } from '@nestjs/common';
import { SearchHistoryService } from './search-history.service';
import { SearchHistoryController } from './search-history.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchHistory } from './entities/search-history.entity/search-history.entity';
import { User } from '../user/entities/user.entity';
import { Plant } from '../plant/entities/plant.entity';
import { PlantSearchHistoryService } from '../plant-search-history/plant-search-history.service';
import { PlantSearchHistory } from '../plant-search-history/entities/plant-search-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SearchHistory, User, Plant, PlantSearchHistory])
  ],
  providers: [SearchHistoryService, PlantSearchHistoryService],
  controllers: [SearchHistoryController]
})
export class SearchHistoryModule {}
