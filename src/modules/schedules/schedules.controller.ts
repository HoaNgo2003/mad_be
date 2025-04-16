import {
  Controller,
  Post,
  Put,
  Get,
  Delete,
  Body,
  Param,
  Query,
  Patch,
} from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CreateScheduleRuleDto } from './dtos/create-schedule-rule.dto';
import { UpdateScheduleRuleDto } from './dtos/update-schedule-rule.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

@Controller({
  version: '1',
  path: 'schedules',
})
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create schedule rule' })
  @Post('/rules')
  async createRule(@Body() data: CreateScheduleRuleDto) {
    return this.schedulesService.createRule(data);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get schedule rule by id' })
  @Get('/rules/:id')
  async getRuleById(@Param('id') id: string) {
    return this.schedulesService.getRuleById(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get schedule rule by userPlantId' })
  @Get('/rules/user-plant/:userPlantId')
  async getRulesByUserPlantId(@Param('userPlantId') id: string) {
    return this.schedulesService.getRulesByUserPlantId(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update schedule rule by id' })
  @Patch('/rules/:id')
  async updateRule(
    @Param('id') id: string,
    @Body() data: UpdateScheduleRuleDto,
  ) {
    return this.schedulesService.updateRule(id, data);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete schedule rule by id' })
  @Delete('/rules/:id')
  async deleteRule(@Param('id') id: string) {
    return this.schedulesService.deleteRuleById(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Fake: Gen next 3 task of rule' })
  @Post('/generate-tasks/:id')
  async generateTasksForRule(@Param('id') id: string) {
    return this.schedulesService.generateTasksForRule(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get list task by user and date' })
  @Get('/tasks-by-date')
  async getTasksByDateAndUser(
    @Query('userId') userId: number,
    @Query('date') date: string,
  ) {
    return this.schedulesService.getTasksByUserAndDate(userId, date);
  }

  @ApiBearerAuth()
  @Get('/rules/past-tasks/:ruleId')
  @ApiOperation({ summary: 'Get past task by ruleId and date' })
  @ApiQuery({ name: 'date', required: false })
  async getPastTasksByRule(
    @Param('ruleId') ruleId: string,
    @Query('date') date?: string,
  ) {
    return this.schedulesService.getPastTasksByRule(ruleId, date);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Make task as done' })
  @Patch('/tasks/done/:id')
  async markTaskAsDone(@Param('id') id: string) {
    return this.schedulesService.markTaskAsDone(id);
  }

  @ApiBearerAuth()
  @Get('/tasks')
  async getTasks() {
    return this.schedulesService.getTasks();
  }

  // Gen daily task
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyTaskGeneration() {
    await this.schedulesService.generateDailyTasksForAllRules();
  }

  // Chạy mỗi 1 phút để kiểm tra và gửi thông báo
  @Cron(CronExpression.EVERY_MINUTE)
  async handleTaskNotifications() {
    try {
      // 1. Sinh task mới nếu cần
      // await this.schedulesService.generateDailyTasksForAllRules();

      // 2. Gửi thông báo cho các task sắp diễn ra
      await this.schedulesService.generateUpcomingTaskNotifications();
    } catch (error) {
      console.error('Lỗi trong quy trình xử lý task:', error);
    }
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Test daily process gen task' })
  @Post('/generate-daily-tasks')
  async manualGenerateDailyTasks() {
    try {
      // Gọi phương thức sinh nhiệm vụ hằng ngày
      const result =
        await this.schedulesService.generateDailyTasksForAllRules();

      return {
        success: true,
        message: 'Thành công',
        details: result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lỗi khi sinh nhiệm vụ',
        error: error.message,
      };
    }
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Test process push notification per minute' })
  @Post('/send-notifications')
  async manualSendNotifications() {
    try {
      const result =
        await this.schedulesService.generateUpcomingTaskNotifications();
      return {
        success: true,
        message: 'Đã gửi thông báo thành công',
        details: result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lỗi khi gửi thông báo',
        error: error.message,
      };
    }
  }
}
