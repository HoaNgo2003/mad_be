import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { ScheduleRule } from './entities/schedule-rule.entity';
import { ScheduleTask } from './entities/schedule-task.entity';
import { UserPlants } from '../plant-user/entities/plant-user.entity';
import { CreateScheduleRuleDto } from './dtos/create-schedule-rule.dto';
import { UpdateScheduleRuleDto } from './dtos/update-schedule-rule.dto';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class SchedulesService {
  constructor(
    @InjectRepository(ScheduleRule)
    private readonly scheduleRuleRepo: Repository<ScheduleRule>,

    @InjectRepository(ScheduleTask)
    private readonly scheduleTaskRepo: Repository<ScheduleTask>,

    @InjectRepository(UserPlants)
    private readonly userPlantRepo: Repository<UserPlants>,
    private readonly notificationService: NotificationService,
  ) {}

  async createRule(data: CreateScheduleRuleDto) {
    const userPlant = await this.userPlantRepo.findOne({
      where: { id: data.user_plant_id },
    });

    if (!userPlant) {
      throw new NotFoundException(
        `Không tìm thấy userPlant với ID ${data.user_plant_id}`,
      );
    }

    const rule = this.scheduleRuleRepo.create({
      user_plant: userPlant,
      task_name: data.task_name,
      repeat_interval: data.repeat_interval,
      time_of_day: data.time_of_day,
      notes: data.notes,
    });
    const savedRule = await this.scheduleRuleRepo.save(rule);

    // Gọi hàm sinh task từ rule vừa tạo
    await this.generateTasksForRule(savedRule.id);

    return savedRule;
  }

  // Lấy rule detail theo id
  async getRuleById(id: string) {
    const rule = await this.scheduleRuleRepo.findOne({
      where: { id },
      relations: [], // bỏ qua các entity quan hệ
    });

    if (!rule) {
      throw new NotFoundException(`Không tìm thấy rule với ID ${id}`);
    }

    return rule;
  }

  // Lấy list rule theo userPlantId
  async getRulesByUserPlantId(userPlantId: string) {
    return this.scheduleRuleRepo.find({
      where: {
        user_plant: {
          id: userPlantId,
        },
      },
      order: {
        createdAt: 'DESC',
      },
      relations: [], // bỏ qua các entity quan hệ
    });
  }

  async updateRule(ruleId: string, data: UpdateScheduleRuleDto) {
    const rule = await this.scheduleRuleRepo.findOne({
      where: { id: ruleId },
      relations: ['user_plant', 'user_plant.plant'],
    });

    if (!rule) {
      throw new NotFoundException(`Không tìm thấy rule với ID ${ruleId}`);
    }

    // Cập nhật rule
    const updatedRule = this.scheduleRuleRepo.merge(rule, data);
    const savedRule = await this.scheduleRuleRepo.save(updatedRule);

    const pendingTasks = await this.scheduleTaskRepo.find({
      where: {
        rule: { id: ruleId },
        status: 'pending',
        deletedAt: IsNull(),
      },
    });

    for (const task of pendingTasks) {
      if (data.task_name) task.task_name = data.task_name;
      if (data.time_of_day) {
        const [h, m] = data.time_of_day.split(':').map(Number);
        task.scheduled_at.setHours(h, m, 0, 0);
      }
      if (data.notes !== undefined) task.notes = data.notes;
      await this.scheduleTaskRepo.save(task);
    }

    return {
      message: 'Cập nhật rule và task pending thành công.',
      updatedRule: savedRule,
    };
  }

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

  async getTasks() {
    return this.scheduleTaskRepo.find({
      where: { deletedAt: IsNull() },
      order: { scheduled_at: 'ASC' },
      relations: ['rule', 'rule.user_plant', 'rule.user_plant.plant'],
    });
  }

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

  async getPastTasksByRule(ruleId: string, date?: string) {
    const target = date ? new Date(date) : new Date();
    target.setHours(0, 0, 0, 0); // Lấy từ đầu ngày

    return this.scheduleTaskRepo
      .createQueryBuilder('task')
      .where('task.ruleId = :ruleId', { ruleId })
      .andWhere('task.scheduled_at < :beforeDate', { beforeDate: target })
      .andWhere('task.deletedAt IS NULL')
      .orderBy('task.scheduled_at', 'DESC')
      .addOrderBy('task.status', 'ASC')
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

      // Gửi thông báo đến người dùng
      const user = rule.user_plant.user;
      // await this.notificationService.scheduleTaskNotification()
    }

    return this.scheduleTaskRepo.save(tasksToInsert);
  }
}
