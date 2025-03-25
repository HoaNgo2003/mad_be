import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, IsNull, Repository } from 'typeorm';
import { ScheduleRule } from './entities/schedule-rule.entity';
import { ScheduleTask } from './entities/schedule-task.entity';

@Injectable()
export class SchedulesService {
  constructor(
    @InjectRepository(ScheduleRule)
    private scheduleRuleRepo: Repository<ScheduleRule>,

    @InjectRepository(ScheduleTask)
    private scheduleTaskRepo: Repository<ScheduleTask>,
  ) { }

  // Lấy danh sách lịch trình chăm sóc cây
  async getTasks() {
    return this.scheduleTaskRepo.find({
      order: { scheduled_at: 'ASC' }, // Sắp xếp theo thời gian sắp tới
      relations: ['rule'], // Lấy cả thông tin rule liên quan
    });
  }

  // Tạo Rule mới
  async createRule(data: Partial<ScheduleRule>) {
    const rule = this.scheduleRuleRepo.create(data);
    return this.scheduleRuleRepo.save(rule);
  }

  // Cập nhật rule
  async updateRule(ruleId: string, data: Partial<ScheduleRule>) {
    const rule = await this.scheduleRuleRepo.findOne({ where: { id: ruleId } });
    if (!rule) {
      throw new NotFoundException(`Không tìm thấy rule với ID ${ruleId}`);
    }

    await this.scheduleRuleRepo.update(ruleId, data);
    return { message: 'Cập nhật thành công' };
  }

  async deleteRuleById(ruleId: string) {
    const rule = await this.scheduleRuleRepo.findOne({ where: { id: ruleId } });

    if (!rule) {
      throw new NotFoundException(`Không tìm thấy rule với ID ${ruleId}`);
    }

    // Xóa mềm các task liên quan có status = 'pending'
    const pendingTasks = await this.scheduleTaskRepo.find({
      where: {
        rule: { id: ruleId },
        status: 'pending',
      },
    });

    for (const task of pendingTasks) {
      task.deletedAt = new Date(); // nếu có cột deletedBy trong ScheduleTask
      await this.scheduleTaskRepo.save(task);
    }

    // Xóa mềm (cập nhật deletedAt)
    await this.scheduleRuleRepo.softDelete(ruleId);

    return { message: `Đã xóa rule ID ${ruleId} thành công.` };
  }

  // Lấy schedule theo userId
  async getRulesByUserId(userId: number) {
    return this.scheduleRuleRepo.find({
      where: { user_id: userId },
      order: { createdAt: 'DESC' } // Sắp xếp mới nhất lên trên
    });
  }

  // Lấy danh sách các task theo userId và date
  async getTasksByUserAndDate(userId: number, date: string) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
  
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
  
    return this.scheduleTaskRepo.find({
      where: {
        scheduled_at: Between(start, end),
        rule: {
          user_id: userId,
        },
        deletedAt: IsNull(), // chỉ lấy task chưa bị xóa mềm
      },
      relations: [],
      order: {
        status : 'ASC',
        scheduled_at: 'ASC',
      },
    });
  }

  // Hoàn thành task theo id
  async markTaskAsDone(taskId: string) {
    const task = await this.scheduleTaskRepo.findOne({ where: { id: taskId } });
  
    if (!task) {
      throw new NotFoundException(`Không tìm thấy task`);
    }
  
    if (task.status === 'done') {
      return { message: `Task đã hoàn thành trước đó.` };
    }
  
    task.status = 'done';
    await this.scheduleTaskRepo.save(task);
  
    return { message: `Hoàn thành` };
  }

  // Sinh task từ 1 rule dựa vào ID
  async generateTasksForRule(ruleId: string) {
    const rule = await this.scheduleRuleRepo.findOne({ where: { id: ruleId } });
    if (!rule) {
      throw new NotFoundException(`Không tìm thấy rule với ID ${ruleId}`);
    }

    let today = new Date();
    const tasksToInsert = [];

    if (rule.repeat_type === 'daily') {
      for (let i = 0; i < 3; i++) {
        let nextDate = new Date(today);
        nextDate.setDate(today.getDate() + i);
        this.setTimeOfDay(nextDate, rule.time_of_day);

        tasksToInsert.push(this.createTask(rule, nextDate));
      }
    } else if (rule.repeat_type === 'weekly') {
      const repeatDays = rule.repeat_days.split(',').map(day => day.trim());

      for (let day of repeatDays) {
        let nextDate = this.getNextDateForWeekday(today, day);

        for (let i = 0; i < 3; i++) {
          let taskDate = new Date(nextDate);
          taskDate.setDate(nextDate.getDate() + i * 7);
          this.setTimeOfDay(taskDate, rule.time_of_day);

          tasksToInsert.push(this.createTask(rule, taskDate));
        }
      }
    }

    return this.scheduleTaskRepo.save(tasksToInsert);
  }

  // Tạo object task để insert vào DB
  private createTask(rule: ScheduleRule, scheduledAt: Date): Partial<ScheduleTask> {
    return {
      rule: rule,
      plant_id: rule.plant_id,
      task_name: rule.task_name,
      scheduled_at: scheduledAt,
      status: 'pending',
      notes: rule.notes,
    };
  }

  // Chuyển từ tên ngày thành index của tuần
  private getDayIndex(day: string): number {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return daysOfWeek.indexOf(day);
  }

  // Tìm ngày tiếp theo của một thứ cụ thể
  private getNextDateForWeekday(today: Date, targetDay: string): Date {
    let todayIndex = today.getDay();
    let targetIndex = this.getDayIndex(targetDay);
    let daysUntilNext = (targetIndex - todayIndex + 7) % 7;
    if (daysUntilNext === 0) daysUntilNext = 7; // Nếu hôm nay đúng target thì lấy tuần sau

    let nextDate = new Date(today);
    nextDate.setDate(today.getDate() + daysUntilNext);
    return nextDate;
  }

  // Đặt giờ theo rule
  private setTimeOfDay(date: Date, time: string) {
    let [hours, minutes] = time.split(':').map(Number);
    date.setHours(hours, minutes, 0, 0);
  }
}
