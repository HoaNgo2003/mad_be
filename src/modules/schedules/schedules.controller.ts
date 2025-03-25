import { Controller, Post, Put, Get, Delete, Body, Param, Query, Patch } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { ScheduleRule } from './entities/schedule-rule.entity';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) { }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create schedule rule' })
  @Post('/rules')
  async createRule(@Body() data: any) {
    return this.schedulesService.createRule(data);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update schedule rule by id' })
  @Put('/rules/:id')
  async updateRule(@Param('id') id: string, @Body() data: Partial<ScheduleRule>) {
    return this.schedulesService.updateRule(id, data);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete schedule rule by id' })
  @Delete('/rules/:id')
  async deleteRule(@Param('id') id: string) {
    return this.schedulesService.deleteRuleById(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get list schedule rule by userId' })
  @Get('/rules/user/:userId')
  async getRulesByUserId(@Param('userId') userId: number) {
    return this.schedulesService.getRulesByUserId(userId);
  }

  @Post('/generate-tasks/:id')
  async generateTasksForRule(@Param('id') id: string) {
    return this.schedulesService.generateTasksForRule(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get list task by userId and date' })
  @Get('/tasks-by-date')
  async getTasksByDate(
    @Query('userId') userId: number,
    @Query('date') date: string,
  ) {
    return this.schedulesService.getTasksByUserAndDate(userId, date);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Make task as done' })
  @Patch('/tasks/done/:id')
  async markTaskAsDone(@Param('id') id: string) {
    return this.schedulesService.markTaskAsDone(id);
  }

  @Get('/tasks')
  async getTasks() {
    return this.schedulesService.getTasks();
  }
}
