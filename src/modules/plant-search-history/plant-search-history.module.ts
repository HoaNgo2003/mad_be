import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlantSearchHistory } from './entities/plant-search-history.entity';
import { PlantSearchHistoryService } from './plant-search-history.service';
import { PlantSearchHistoryController } from './plant-search-history.controller';
const validateConstraint = [];
@Module({
  imports: [TypeOrmModule.forFeature([PlantSearchHistory])],
  exports: [PlantSearchHistoryService],
  controllers: [PlantSearchHistoryController],
  providers: [PlantSearchHistoryService, ...validateConstraint],
})
export class PlantSearchHistoryModule {}
