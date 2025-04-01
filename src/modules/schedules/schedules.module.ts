import { Module } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { SchedulesController } from './schedules.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleRule } from './entities/schedule-rule.entity';
import { ScheduleTask } from './entities/schedule-task.entity';
import { UserPlants } from '../plant-user/entities/plant-user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ScheduleRule, ScheduleTask, UserPlants ])],
  controllers: [SchedulesController],
  providers: [SchedulesService],
})
export class SchedulesModule {}