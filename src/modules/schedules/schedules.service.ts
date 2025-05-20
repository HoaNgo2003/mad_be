import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, MoreThan, Repository } from 'typeorm';
import { ScheduleRule } from './entities/schedule-rule.entity';
import { ScheduleTask } from './entities/schedule-task.entity';
import { UserPlants } from '../plant-user/entities/plant-user.entity';
import { CreateScheduleRuleDto } from './dtos/create-schedule-rule.dto';
import { UpdateScheduleRuleDto } from './dtos/update-schedule-rule.dto';
import { NotificationService } from '../notification/notification.service';
import { User } from '../user/entities/user.entity';
import { CurrentUser } from 'src/common/decorator/user.decorator';
import { ETypeNoti } from 'src/common/types/data-type';

@Injectable()
export class SchedulesService {
  private readonly logger = new Logger(SchedulesService.name);

  constructor(
    @InjectRepository(ScheduleRule)
    private readonly scheduleRuleRepo: Repository<ScheduleRule>,

    @InjectRepository(ScheduleTask)
    private readonly scheduleTaskRepo: Repository<ScheduleTask>,

    @InjectRepository(UserPlants)
    private readonly userPlantRepo: Repository<UserPlants>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    private readonly notificationService: NotificationService,
  ) { }

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
  async getTaskById(taskId: string) {
    const task = await this.scheduleTaskRepo.findOne({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException(`Không tìm thấy task với ID ${taskId}`);
    }

    return task;
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

  // ✅ Sinh nhiệm vụ hằng ngày cho tất cả các quy tắc
  async generateDailyTasksForAllRules() {
    // 1. Lấy tất cả các quy tắc còn hoạt động
    const activeRules = await this.scheduleRuleRepo.find({
      where: {
        deletedAt: IsNull(),
        user_plant: {
          deletedAt: IsNull(),
        },
      },
      relations: ['user_plant', 'user_plant.plant'],
    });

    // 2. Duyệt qua từng quy tắc và sinh nhiệm vụ
    for (const rule of activeRules) {
      try {
        // Kiểm tra số lượng nhiệm vụ chưa hoàn thành và trong tương lai
        const futureTasksCount = await this.scheduleTaskRepo.count({
          where: {
            rule: { id: rule.id },
            status: 'pending',
            scheduled_at: MoreThan(new Date()),
            deletedAt: IsNull(),
          },
        });

        // Nếu số lượng nhiệm vụ trong tương lai < 3, sinh thêm nhiệm vụ
        if (futureTasksCount < 3) {
          await this.generateTasksForRule(rule.id);
        }
      } catch (error) {
        // Ghi log lỗi nếu không thể sinh nhiệm vụ cho một quy tắc cụ thể
        console.error(`Lỗi khi sinh nhiệm vụ cho rule ${rule.id}:`, error);
      }
    }

    return {
      message: 'Đã hoàn tất quá trình sinh nhiệm vụ hằng ngày',
      totalRulesProcessed: activeRules.length,
    };
  }

  // Sinh thông báo cho các task từ 10-11 phút trước khi diễn ra
  async generateUpcomingTaskNotifications() {
    try {
      // Tìm các task từ 10-11 phút tới
      const tasks = await this.scheduleTaskRepo
        .createQueryBuilder('task')
        .leftJoinAndSelect('task.rule', 'rule')
        .leftJoinAndSelect('rule.user_plant', 'user_plant')
        .leftJoinAndSelect('user_plant.user', 'user')
        .leftJoinAndSelect('user_plant.plant', 'plant')
        .where('task.status = :status', { status: 'pending' })
        .andWhere('task.deletedAt IS NULL')
        .andWhere(
          'TIMESTAMPDIFF(MINUTE, NOW(), task.scheduled_at) BETWEEN 10 AND 11',
        )
        .getMany();

      // Nếu không có task nào, ghi log và thoát
      if (tasks.length === 0) {
        this.logger.log('Không có task nào sắp diễn ra');
        return {
          message: 'Không có task nào sắp diễn ra',
          totalNotifications: 0,
        };
      }

      // Xử lý và gửi thông báo cho từng task
      const notificationResults = [];

      for (const task of tasks) {
        try {
          // Lấy thông tin người dùng
          const user = task.rule.user_plant.user;
          const plant = task.rule.user_plant.plant;

          // Lấy token thiết bị của người dùng
          const userDeviceToken = await this.getUserDeviceToken(user.id);

          if (!userDeviceToken) {
            this.logger.warn(`Không tìm thấy device token cho user ${user.id}`);
            continue;
          }
          console.log("task", task);
          // Gửi thông báo
          const data = {
            username: user.full_name, // Tên người dùng
            userId: user.id,
            postId: null,
            postTitle: null,
            plantUrl: plant.plant_url,
            commentId: null,
            commentContent: null,
            taskId: task.id,
            taskName: task.task_name,
            taskScheduledAt: task.scheduled_at,
            taskStatus: task.status,
            taskNotes: task.notes,
            content: `Sắp đến giờ chăm sóc ${task.rule.user_plant.plant.name}. Nhiệm vụ: ${task.task_name}. Chi tiết: ${task.notes || 'Không có ghi chú'}`,
            type: ETypeNoti.task,
          };
          const notificationResult =
            await this.notificationService.sendPushNotification(
              userDeviceToken,
              'Thông báo công việc',
              data,
              user,
            );

          notificationResults.push({
            taskId: task.id,
            userId: user.id,
            success: notificationResult.success,
          });
        } catch (taskError) {
          this.logger.error(
            `Lỗi khi xử lý thông báo cho task ${task.id}`,
            taskError,
          );
        }
      }

      this.logger.log(`Đã xử lý ${notificationResults.length} thông báo`);

      return {
        message: 'Đã sinh thông báo cho các task sắp diễn ra',
        totalNotifications: notificationResults.length,
        results: notificationResults,
      };
    } catch (error) {
      this.logger.error('Lỗi khi sinh thông báo task', error);
      throw error;
    }
  }

  // Lấy device token của người dùng
  private async getUserDeviceToken(userId: string): Promise<string | null> {
    try {
      // TODO: Implement logic lấy device token
      // Ví dụ: truy vấn từ bảng user hoặc bảng device token
      const user = await this.userRepo.findOne({
        where: { id: userId },
        select: ['token_device'],
      });

      return user?.token_device || null;
    } catch (error) {
      this.logger.error(`Lỗi khi lấy device token cho user ${userId}`, error);
      return null;
    }
  }
}
