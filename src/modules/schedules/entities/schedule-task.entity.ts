import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { BaseMySqlEntity } from 'src/common/entities/base-mysql.entity';
import { ScheduleRule } from './schedule-rule.entity';

@Entity('schedule_tasks')
export class ScheduleTask extends BaseMySqlEntity{
  @ManyToOne(() => ScheduleRule, (rule) => rule.id)
  rule: ScheduleRule;

  @Column()
  plant_id: number;

  @Column()
  task_name: string;

  @Column({ type: 'datetime' })
  scheduled_at: Date;

  @Column({ type: 'enum', enum: ['pending', 'done', 'skipped'], default: 'pending' })
  status: 'pending' | 'done' | 'skipped';

  @Column({ type: 'text', nullable: true })
  notes: string | null;
}
