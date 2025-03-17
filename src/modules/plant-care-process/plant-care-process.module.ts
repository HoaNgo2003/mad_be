import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlantCareProcess } from './entities/plant-care-process.entity';
import { PlantCareProcessService } from './plant-care-process.service';
import { PlantListTaskModule } from '../plant-list-task/plan-list-task.module';
import { PlantCareProcessController } from './plant-care-process.controller';
const validateConstraint = [];
@Module({
  imports: [TypeOrmModule.forFeature([PlantCareProcess]), PlantListTaskModule],
  exports: [PlantCareProcessService],
  controllers: [PlantCareProcessController],
  providers: [PlantCareProcessService, ...validateConstraint],
})
export class PlantCareProcessModule {}
