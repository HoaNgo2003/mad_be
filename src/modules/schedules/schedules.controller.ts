import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { SchedulesService } from './schedules.service';

@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post('/rules')
  async createRule(@Body() data: any) {
    return this.schedulesService.createRule(data);
  }

  @Post('/generate-tasks/:id')
  async generateTasksForRule(@Param('id') id: string) {
    return this.schedulesService.generateTasksForRule(id);
  }

  @Get('/tasks')
  async getTasks() {
    return this.schedulesService.getTasks();
  }
}
