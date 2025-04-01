import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, IsNull, Repository } from 'typeorm';
import { ScheduleRule } from './entities/schedule-rule.entity';
import { ScheduleTask } from './entities/schedule-task.entity';
import { UserPlants } from '../plant-user/entities/plant-user.entity';
import { CreateScheduleRuleDto } from './dtos/create-schedule-rule.dto';

@Injectable()
export class SchedulesService {
  constructor(
    @InjectRepository(ScheduleRule)
    private scheduleRuleRepo: Repository<ScheduleRule>,

    @InjectRepository(ScheduleTask)
    private scheduleTaskRepo: Repository<ScheduleTask>,

    @InjectRepository(UserPlants)
    private userPlantRepo: Repository<UserPlants>,
  ) {}

  // ✅ Tạo Rule mới
  async createRule(data: CreateScheduleRuleDto) {
    const userPlant = await this.userPlantRepo.findOne({
      where: { id: data.user_plant_id },
    });

    if (!userPlant) {
      throw new NotFoundException(`Không tìm thấy userPlant với ID ${data.user_plant_id}`);
    }

    const rule = this.scheduleRuleRepo.create({
      user_plant: userPlant,
      task_name: data.task_name,
      repeat_interval: data.repeat_interval,
      time_of_day: data.time_of_day,
      notes: data.notes,
    });

    return this.scheduleRuleRepo.save(rule);
  }

  // ✅ Cập nhật rule
  async updateRule(ruleId: string, data: Partial<ScheduleRule>) {
    const rule = await this.scheduleRuleRepo.findOne({
      where: { id: ruleId },
      relations: ['user_plant'],
    });

    if (!rule) {
      throw new NotFoundException(`Không tìm thấy rule với ID ${ruleId}`);
    }

    const updatedRule = this.scheduleRuleRepo.merge(rule, data);
    return this.scheduleRuleRepo.save(updatedRule);
  }

  // ✅ Xóa rule (mềm)
  async deleteRuleById(ruleId: string) {
    const rule = await this.scheduleRuleRepo.findOne({ where: { id: ruleId } });
    if (!rule) {
      throw new NotFoundException(`Không tìm thấy rule với ID ${ruleId}`);
    }

    const pendingTasks = await this.scheduleTaskRepo.find({
      where: {
        rule: { id: ruleId },
        status: 'pending',
      },
    });

    for (const task of pendingTasks) {
      task.deletedAt = new Date();
      await this.scheduleTaskRepo.save(task);
    }

    await this.scheduleRuleRepo.softDelete(ruleId);
    return { message: `Đã xóa rule ID ${ruleId} thành công.` };
  }

  // ✅ Lấy danh sách task toàn bộ
  async getTasks() {
    return this.scheduleTaskRepo.find({
      where: { deletedAt: IsNull() },
      order: { scheduled_at: 'ASC' },
      relations: ['rule', 'rule.user_plant', 'rule.user_plant.plant'],
    });
  }

  // ✅ Lấy task theo user và ngày
  async getTasksByUserAndDate(userId: number, date: string) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    return this.scheduleTaskRepo
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.rule', 'rule')
      .leftJoinAndSelect('rule.user_plant', 'user_plant')
      .leftJoinAndSelect('user_plant.user', 'user')
      .leftJoinAndSelect('user_plant.plant', 'plant')
      .where('task.scheduled_at BETWEEN :start AND :end', { start, end })
      .andWhere('task.deletedAt IS NULL')
      .andWhere('user.id = :userId', { userId })
      .orderBy('task.status', 'ASC')
      .addOrderBy('task.scheduled_at', 'ASC')
      .select([
        'task.id',
        'task.task_name',
        'task.status',
        'task.scheduled_at',
        'task.notes',
        'task.createdAt',
        'task.updatedAt',
      ])
      .getMany();
  }

  // ✅ Đánh dấu hoàn thành task
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

  // ✅ Sinh 3 task từ rule
  async generateTasksForRule(ruleId: string) {
    const rule = await this.scheduleRuleRepo.findOne({
      where: { id: ruleId },
      relations: ['user_plant', 'user_plant.plant'],
    });

    if (!rule) {
      throw new NotFoundException(`Không tìm thấy rule với ID ${ruleId}`);
    }

    const tasksToInsert = [];
    const now = new Date();

    for (let i = 0; i < 3; i++) {
      const nextDate = new Date();
      nextDate.setDate(now.getDate() + i * rule.repeat_interval);

      const [hours, minutes] = rule.time_of_day.split(':').map(Number);
      nextDate.setHours(hours, minutes, 0, 0);

      const exists = await this.scheduleTaskRepo.findOne({
        where: {
          rule: { id: rule.id },
          scheduled_at: nextDate,
        },
      });

      if (!exists) {
        tasksToInsert.push({
          rule,
          task_name: rule.task_name,
          scheduled_at: nextDate,
          status: 'pending',
          notes: rule.notes,
          plant_id: rule.user_plant.plant?.id ?? null,
        });
      }
    }

    return this.scheduleTaskRepo.save(tasksToInsert);
  }
}
