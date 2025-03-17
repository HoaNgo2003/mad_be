import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlantListTask } from './entities/plan-list-task.entity';
import { PlantListTaskService } from './plan-list-task.service';
const validateConstraint = [];
@Module({
  imports: [TypeOrmModule.forFeature([PlantListTask])],
  exports: [PlantListTaskService],
  controllers: [],
  providers: [PlantListTaskService, ...validateConstraint],
})
export class PlantListTaskModule {}
