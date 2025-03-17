import { Module } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { SchedulesController } from './schedules.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleRule } from './entities/schedule-rule.entity';
import { ScheduleTask } from './entities/schedule-task.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ScheduleRule, ScheduleTask])],
  controllers: [SchedulesController],
  providers: [SchedulesService],
})
export class SchedulesModule {}