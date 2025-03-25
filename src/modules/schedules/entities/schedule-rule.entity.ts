import { BaseMySqlEntity } from 'src/common/entities/base-mysql.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity('schedule_rules')
export class ScheduleRule extends BaseMySqlEntity{

  @Column()
  user_id: number;

  @Column()
  plant_id: number;

  @Column()
  task_name: string;

  @Column({ type: 'enum', enum: ['once', 'daily', 'weekly'], default:'once' })
  repeat_type: 'once'|'daily' | 'weekly';

  @Column({ type: 'varchar', nullable: true })
  repeat_days: string | null; // Lưu thứ dưới dạng "Monday,Wednesday"

  @Column({ type: 'time' })
  time_of_day: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;
}
